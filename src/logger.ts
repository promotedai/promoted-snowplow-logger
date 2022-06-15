import hash from 'object-hash';
import {
  AsyncSnowplow,
  ImmediateAsyncSnowplow,
  SnowplowFn,
  TimerAsyncSnowplow,
  windowSnowplowProvider,
} from './async-snowplow';
import { NoopEventLogger } from './noop-logger';
import type { Action, Click, CohortMembership, HasUserInfo, Impression, User, UserInfo, View } from './types/event';
import type { EventLogger, EventLoggerArguments, LocalStorage } from './types/logger';

// Store the last domain userId we saved to Promoted to reduce the number of
// log calls.
const DEFAULT_USER_SESSION_LOCAL_STORAGE_KEY = 'p-us';
const DEFAULT_USER_HASH_LOCAL_STORAGE_KEY = 'p-uh';
const DEBUG_LOCAL_STORAGE_KEY = 'p-debug';

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

const createAsyncSnowplow = (overrideSnowplow: SnowplowFn | undefined, handleError: (err: Error) => void) => {
  if (overrideSnowplow) {
    return new ImmediateAsyncSnowplow(overrideSnowplow, handleError);
  }
  return new TimerAsyncSnowplow(windowSnowplowProvider, handleError);
};

/**
 * A utility class for logging events.
 *
 * Warning: This class modifies the inputs.  We avoid creating duplicate objects
 * to reduce memory pressure.
 */
export class EventLoggerImpl implements EventLogger {
  private platformName: string;
  private isDebugEnabled: boolean;

  // Delay generation until needed since not all pages log all types of schemas.
  private userIgluSchema?: string;
  private cohortMembershipIgluSchema?: string;
  private impressionIgluSchema?: string;
  private actionIgluSchema?: string;

  private handleError: (err: Error) => void;
  private getUserInfo?: () => UserInfo | undefined;
  private snowplow: AsyncSnowplow;
  private localStorage?: LocalStorage;
  private userSessionLocalStorageKey: string;
  private userHashLocalStorageKey: string;

  /**
   * @params {EventLoggerArguments} args The arguments for the logger.
   */
  public constructor(args: EventLoggerArguments) {
    this.platformName = args.platformName;
    this.handleError = args.handleError;
    this.getUserInfo = args.getUserInfo;
    this.snowplow = createAsyncSnowplow(args.snowplow, args.handleError);
    this.localStorage = args.localStorage;
    if (this.localStorage === undefined && typeof window !== 'undefined') {
      this.localStorage = window?.localStorage;
    }
    this.isDebugEnabled = this.localStorage?.getItem(DEBUG_LOCAL_STORAGE_KEY) === 'true';
    this.userSessionLocalStorageKey =
      args.userSessionLocalStorageKey !== undefined
        ? args.userSessionLocalStorageKey
        : DEFAULT_USER_SESSION_LOCAL_STORAGE_KEY;
    this.userHashLocalStorageKey =
      args.userHashLocalStorageKey !== undefined ? args.userHashLocalStorageKey : DEFAULT_USER_HASH_LOCAL_STORAGE_KEY;
  }

  /**
   * Returns the User IGLU Schema URL.  As a function to delay string construction.
   */
  private getUserIgluSchema() {
    if (!this.userIgluSchema) {
      this.userIgluSchema = `iglu:ai.promoted.${this.platformName}/user/jsonschema/1-0-0`;
    }
    return this.userIgluSchema;
  }

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

  logUser = (user: User) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    // This version of the snowplow method allows us to get access to `cf`.
    this.snowplow.callSnowplow(function () {
      // We use cf to get sessionId.
      // @ts-expect-error Snowplow docs recommend this calling pattern.
      self.innerLogUser(this.cf, user);
    });
  };

  innerLogUser = (cf: any, user: User) => {
    const schema = this.getUserIgluSchema();
    try {
      const domainUserInfo = cf.getDomainUserInfo();
      const sessionId = domainUserInfo[6];
      // If localStorage is not enabled, this will log a bunch of duplicate user records.
      const oldSessionId = this.localStorage?.getItem(this.userSessionLocalStorageKey);
      const oldUserHash = this.localStorage?.getItem(this.userHashLocalStorageKey);
      // Only send the log events if the userId changes.
      const newUserHash = hash(user);
      if (this.isDebugEnabled) {
        // Avoid extra strings in client-side libraries.  Just log raw params.
        console.log(sessionId);
        console.log(oldSessionId);
        console.log(newUserHash);
        console.log(oldUserHash);
      }
      if (sessionId !== oldSessionId || newUserHash !== oldUserHash) {
        this.snowplow.callSnowplow('trackUnstructEvent', {
          schema,
          data: this.mergeBaseUserInfo(user),
        });
        this.localStorage?.setItem(this.userSessionLocalStorageKey, sessionId);
        this.localStorage?.setItem(this.userHashLocalStorageKey, newUserHash);
      }
    } catch (error) {
      this.handleError(error);
    }
  };

  logCohortMembership = (cohortMembership: CohortMembership) => {
    this.snowplow.callSnowplow('trackUnstructEvent', {
      schema: this.getCohortMembershipIgluSchema(),
      data: this.mergeBaseUserInfo(cohortMembership),
    });
  };

  logView = (view: View) => {
    this.snowplow.callSnowplow('trackPageView', null, getViewContexts(this.mergeBaseUserInfo(view)));
  };

  logImpression = (impression: Impression) => {
    this.snowplow.callSnowplow('trackUnstructEvent', {
      schema: this.getImpressionIgluSchema(),
      data: this.mergeBaseUserInfo(impression),
    });
  };

  logAction = (action: Action) => {
    this.snowplow.callSnowplow('trackUnstructEvent', {
      schema: this.getActionIgluSchema(),
      data: this.mergeBaseUserInfo(action),
    });
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

  flushEarlyEvents = () => {
    this.snowplow.flushEarlyEvents();
  };
}
