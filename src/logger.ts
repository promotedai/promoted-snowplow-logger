import type { SelfDescribingJson } from '@snowplow/tracker-core';
import { NoopEventLogger } from './noop-logger';
import type { Action, Click, CohortMembership, HasUserInfo, Impression, UserInfo, View } from './types/event';
import type { EventLogger, EventLoggerArguments, Snowplow } from './types/logger';

export const getViewContexts = (view: View) => {
  if (view) {
    return [
      {
        schema: 'iglu:ai.promoted/pageview_cx/jsonschema/2-0-0',
        data: view,
      },
    ];
  } else {
    return [];
  }
};

export const createEventLogger = (args: EventLoggerArguments): EventLogger => {
  if (args.enabled === undefined || args.enabled) {
    return new EventLoggerImpl(args);
  } else {
    return new NoopEventLogger();
  }
};

const requiredError = (field: string) => new Error(`${field} is required`);

/**
 * A utility class for logging events.
 *
 * Warning: This class modifies the inputs.  We avoid creating duplicate objects
 * to reduce memory pressure.
 */
export class EventLoggerImpl implements EventLogger {
  private platformName: string;

  // Delay generation until needed since not all pages log all types of schemas.
  private cohortMembershipIgluSchema?: string;
  private impressionIgluSchema?: string;
  private actionIgluSchema?: string;

  private handleError: (err: Error) => void;
  private getUserInfo?: () => UserInfo | undefined;
  private snowplow: Snowplow;

  /**
   * @params {EventLoggerArguments} args The arguments for the logger.
   */
  public constructor(args: EventLoggerArguments) {
    this.platformName = args.platformName;
    this.handleError = args.handleError;
    this.getUserInfo = args.getUserInfo;
    this.snowplow = args.snowplow;
    this.validateArgs();
  }

  private validateArgs = () => {
    if (!this.handleError) {
      throw requiredError('handleError');
    }
    if (!this.snowplow) {
      throw requiredError('snowplow');
    }
    if (!this.snowplow.trackSelfDescribingEvent) {
      throw requiredError('trackSelfDescribingEvent');
    }
    if (!this.snowplow.trackPageView) {
      throw requiredError('trackPageView');
    }
  };

  /**
   * Returns the CohortMembership IGLU Schema URL.  As a function to delay string construction.
   */
  private getCohortMembershipIgluSchema() {
    if (!this.cohortMembershipIgluSchema) {
      this.cohortMembershipIgluSchema = `iglu:ai.promoted.${this.platformName}/cohortmembership/jsonschema/1-0-0`;
    }
    return this.cohortMembershipIgluSchema;
  }

  /**
   * Returns the Impression IGLU Schema URL.  As a function to delay string construction.
   */
  private getImpressionIgluSchema() {
    if (!this.impressionIgluSchema) {
      this.impressionIgluSchema = `iglu:ai.promoted.${this.platformName}/impression/jsonschema/1-0-0`;
    }
    return this.impressionIgluSchema;
  }

  /**
   * Returns the Action IGLU Schema URL.  As a function to delay string construction.
   */
  private getActionIgluSchema() {
    if (!this.actionIgluSchema) {
      this.actionIgluSchema = `iglu:ai.promoted.${this.platformName}/action/jsonschema/1-0-0`;
    }
    return this.actionIgluSchema;
  }

  logCohortMembership = (cohortMembership: CohortMembership) => {
    this.snowplow.trackSelfDescribingEvent({
      event: {
        schema: this.getCohortMembershipIgluSchema(),
        data: this.mergeBaseUserInfo(cohortMembership) as any,
      },
    });
  };

  logView = (view: View) => {
    this.snowplow.trackPageView({
      context: getViewContexts(this.mergeBaseUserInfo(view)) as Array<SelfDescribingJson>,
    });
  };

  logImpression = (impression: Impression) => {
    this.snowplow.trackSelfDescribingEvent({
      event: {
        schema: this.getImpressionIgluSchema(),
        data: this.mergeBaseUserInfo(impression) as any,
      },
    });
  };

  logAction = (action: Action) => {
    this.prepareAction(action);
    this.snowplow.trackSelfDescribingEvent({
      event: {
        schema: this.getActionIgluSchema(),
        data: this.mergeBaseUserInfo(action) as any,
      },
    });
  };

  /* Validates and transforms Actions. */
  private prepareAction = (action: Action) => {
    const { cart } = action;
    if (cart) {
      for (const cartContent of cart.contents) {
        if (cartContent.quantity == 0) {
          // If handleError does not throw, continue processing.
          this.handleError(new Error('CartContent.quantity should be non-zero'));
        }
        const { pricePerUnit } = cartContent;
        if (pricePerUnit && pricePerUnit.amount !== undefined) {
          if (pricePerUnit.amountMicros !== undefined) {
            this.handleError(new Error('Do not set both amount and amountMicros'));
          }
          // Our API currently only supports amountMicros.
          // This long multiplication is fine to run in the browser for most platforms.
          // TODO - eventually move this behind the API.
          cartContent.pricePerUnit = {
            currencyCode: pricePerUnit.currencyCode,
            amountMicros: Math.round(1000000 * pricePerUnit.amount),
          };
        }
      }
    }
  };

  logClick = (click: Click) => {
    const action: Action = {
      actionType: 2,
      ...click,
    };
    // Moves the `targetUrl` field to `navigateAction.targetUrl`
    const { targetUrl } = click;
    delete action['targetUrl'];
    if (targetUrl) {
      action.navigateAction = { targetUrl };
    }

    this.logAction(action);
  };

  mergeBaseUserInfo = <T extends HasUserInfo>(record: T): T => {
    // TODO - is this the right syntax?
    const baseUserInfo = this.getUserInfo?.();
    if (baseUserInfo) {
      const { userInfo } = record;
      record.userInfo = {
        ...baseUserInfo,
        ...userInfo,
      };
    }
    return record;
  };
}
