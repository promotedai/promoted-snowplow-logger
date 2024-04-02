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
  private handleError: (err: Error) => void;
  private getUserInfo?: () => UserInfo | undefined;
  private snowplow: Snowplow;
  private snowplowTrackers?: Array<string> | undefined;

  /**
   * @params {EventLoggerArguments} args The arguments for the logger.
   */
  public constructor(args: EventLoggerArguments) {
    this.handleError = args.handleError;
    this.getUserInfo = args.getUserInfo;
    this.snowplow = args.snowplow;
    this.snowplowTrackers = this.arrayWrap(args.snowplowTrackers);
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

  logCohortMembership = (cohortMembership: CohortMembership) => {
    this.snowplow.trackSelfDescribingEvent(
      {
        event: {
          schema: 'iglu:ai.promoted/cohortmembership/jsonschema/1-0-0',
          data: this.mergeBaseUserInfo(cohortMembership) as any,
        },
      },
      this.snowplowTrackers
    );
  };

  logView = (view: View) => {
    this.snowplow.trackPageView(
      {
        context: getViewContexts(this.mergeBaseUserInfo(view)) as Array<SelfDescribingJson>,
      },
      this.snowplowTrackers
    );
  };

  logImpression = (impression: Impression) => {
    this.snowplow.trackSelfDescribingEvent(
      {
        event: {
          schema: 'iglu:ai.promoted/impression/jsonschema/1-0-0',
          data: this.mergeBaseUserInfo(impression) as any,
        },
      },
      this.snowplowTrackers
    );
  };

  logAction = (action: Action) => {
    this.prepareAction(action);
    this.snowplow.trackSelfDescribingEvent(
      {
        event: {
          schema: 'iglu:ai.promoted/action/jsonschema/1-0-0',
          data: this.mergeBaseUserInfo(action) as any,
        },
      },
      this.snowplowTrackers
    );
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

  /**
   * Wraps a value in an array if it is not already an array. If the value is undefined, it returns undefined.
   *
   * @param value - The value to be wrapped in an array. It can be of any type T or an array of type T.
   * @returns If the value is an array, it returns the array as is. If the value is not an array but is defined,
   *          it returns the value wrapped in an array. If the value is undefined, it returns undefined.
   */
  private arrayWrap = <T>(value?: T | T[]): T[] | undefined => {
    if (Array.isArray(value)) {
      return value;
    } else if (value) {
      return [value];
    } else {
      return undefined;
    }
  };
}
