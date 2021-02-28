import hash from 'object-hash';

/**
 * Constructor arguments for EventLogger.
 */
export interface EventLoggerArguments {
  /**
   * The name of your Platform in Promoted's configuration.
   */
  platformName: string;

  /**
   * A way to turn off logging.  Defaults to true.
   */
  enabled?: boolean;

  /*
  Indicates how to handle errors.
  E.g. in development, throw an error so the developer can see.  In production,
  you might want to silently log and monitor to minimize the impact to the UI
  if there is an issue.

  Here is example code for NextJS:
  ```
  const throwError =
    process?.env?.NODE_ENV !== 'production' ||
    (typeof location !== "undefined" && location?.hostname === "localhost");
  ...
  handleLogError: throwError ? (err) => {
      throw error;
    } : (err) => console.error(err);
  }
  ```
  */
  handleLogError: (err: Error) => void;

  /**
   * Used to override `window.snowplow` for testing.
   */
  snowplow?: (...args: any[]) => void;

  /**
   * Used to override LocalStorage for testing.
   */
  localStorage?: LocalStorage;

  /**
   * Key for local storage that contains the last logged session ID.
   * We want to log the User object at least once per session.
   * By default, 'p-us' is used.
   */
  userSessionLocalStorageKey?: string;

  /**
   * Key for local storage that contains the hash of the last logged user.
   * We want to log the User object when the user object changes.
   * By default, 'p-uh' is used.
   */
  userHashLocalStorageKey?: string;
}

export interface User {
  common: {};
}

export interface CohortMembership {
  common: {};
}

export interface View {
  common: {};
}

export interface CommonRequest {
  // viewId gets filled in on the server.
  requestId: string;
}

export interface Request {
  common: CommonRequest;
}

export interface CommonInsertion {
  // TODO - specify requestId.
  insertionId: string;
}

export interface Insertion {
  common: CommonInsertion;
}

export interface CommonImpression {
  // TODO - specify insertion.
  impressionId: string;
}

export interface Impression {
  common: CommonImpression;
}

export interface Click {
  /**
   * The impressionId for the content (if content was clicked on).
   */
  impressionId?: string;
  /**
   * The target URL.  For actions on the same page, you can use '#action'.
   */
  targetUrl: string;
  /**
   * The target URL.  For actions on the same page, you can use '#action'.
   */
  elementId: string;
}

// Store the last domain userId we saved to Promoted to reduce the number of
// log calls.
const DEFAULT_USER_SESSION_LOCAL_STORAGE_KEY = 'p-us';
const DEFAULT_USER_HASH_LOCAL_STORAGE_KEY = 'p-uh';
const DEBUG_LOCAL_STORAGE_KEY = 'p-debug';

export interface LocalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

/**
 * Returns the contexts for clicks given the parameters.
 */
const getClickContexts = (impressionId: string | undefined) => {
  if (impressionId) {
    return [
      {
        schema: 'iglu:ai.promoted/impression_cx/jsonschema/1-0-0',
        data: {
          impressionId,
        },
      },
    ];
  } else {
    return undefined;
  }
};

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

/**
 * Interface for EventLogger.  The logger better handles errors and
 * conditionals that are encountered during development.
 */
interface EventLogger {
  /**
   * Logs `user` depending on the configuration.  The default
   * configuration is log once per session.  Stores data in localStorage
   * to reduce the number of actual logging calls (hence `maybe`).
   * Warning: the call will modify the input `user`.  Clients must copy the object.
   * @param {User} the call will modify the object
   */
  logUser(user: User): void;

  /**
   * Logs `cohortMembership`.
   */
  logCohortMembership(cohortMembership: CohortMembership): void;

  /**
   * Logs `view`.
   */
  logView(view: View): void;

  /**
   * Logs `request`.
   */
  logRequest(request: Request): void;

  /**
   * Logs `insertion`.
   */
  logInsertion(insertion: Insertion): void;

  /**
   * Logs `impression`.
   */
  logImpression(impression: Impression): void;

  /**
   * Logs `click`.
   */
  logClick(click: Click): void;
}

export const createEventLogger = (args: EventLoggerArguments) => {
  if (args.enabled === undefined || args.enabled) {
    return new EventLoggerImpl(args);
  } else {
    return new NoopEventLogger();
  }
};

/**
 * A utility class for logging events.
 *
 * Warning: This class modifies the inputs.  We avoid creating duplicate objects
 * to reduce memory pressure.
 */
export class NoopEventLogger implements EventLogger {
  logUser() {
    /* No op. */
  }

  logCohortMembership() {
    /* No op. */
  }

  logView() {
    /* No op. */
  }

  logRequest() {
    /* No op. */
  }

  logInsertion() {
    /* No op. */
  }

  logImpression() {
    /* No op. */
  }

  logClick() {
    /* No op. */
  }
}

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
  private requestIgluSchema?: string;
  private insertionIgluSchema?: string;
  private impressionIgluSchema?: string;

  private handleLogError: (err: Error) => void;
  private snowplow: (...args: any[]) => void;
  private localStorage?: LocalStorage;
  private userSessionLocalStorageKey: string;
  private userHashLocalStorageKey: string;

  /**
   * @params {EventLoggerArguments} args The arguments for the logger.
   */
  public constructor(args: EventLoggerArguments) {
    this.platformName = args.platformName;
    this.handleLogError = args.handleLogError;
    // @ts-expect-error window does not have snowplow on it.
    const sp = args.snowplow || (typeof window !== 'undefined' && window?.snowplow);
    this.snowplow = (...args: any[]) => {
      // Delay the error in case the client is using NextJS.
      if (!this.snowplow) {
        throw Error(`snowplow needs to be set on EventLogger constructor arguments or accessible on window`);
      }
      sp(...args);
    };
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
   * Returns the Request IGLU Schema URL.  As a function to delay string construction.
   */
  private getRequestIgluSchema() {
    if (!this.requestIgluSchema) {
      this.requestIgluSchema = `iglu:ai.promoted.${this.platformName}/request/jsonschema/1-0-0`;
    }
    return this.requestIgluSchema;
  }

  /**
   * Returns the Insertion IGLU Schema URL.  As a function to delay string construction.
   */
  private getInsertionIgluSchema() {
    if (!this.insertionIgluSchema) {
      this.insertionIgluSchema = `iglu:ai.promoted.${this.platformName}/insertion/jsonschema/1-0-0`;
    }
    return this.insertionIgluSchema;
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

  logUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    if (this.isDebugEnabled) {
      console.log(`EventLogger.logUser`);
    }

    // This version of the snowplow method allows us to get access to `cf`.
    this.snowplow(function () {
      // We use cf to get sessionId.
      // @ts-expect-error Snowplow docs recommend this calling pattern.
      self.innerLogUser(this.cf, user);
    });
  }

  innerLogUser(cf: any, user: User) {
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
        console.log(
          `EventLogger.logUser - sessionId=${sessionId}, oldSessionId=${oldSessionId}, newUserHash=${newUserHash}, oldUserHash=${oldUserHash}`
        );
      }
      if (sessionId !== oldSessionId || newUserHash !== oldUserHash) {
        this.snowplow('trackUnstructEvent', {
          schema,
          data: user,
        });
        this.localStorage?.setItem(this.userSessionLocalStorageKey, sessionId);
        this.localStorage?.setItem(this.userHashLocalStorageKey, newUserHash);
      }
    } catch (error) {
      this.handleLogError(error);
    }
  }

  logCohortMembership(cohortMembership: CohortMembership) {
    try {
      this.snowplow('trackUnstructEvent', {
        schema: this.getCohortMembershipIgluSchema(),
        data: cohortMembership,
      });
    } catch (error) {
      this.handleLogError(error);
    }
  }

  logView(view: View) {
    try {
      this.snowplow('trackPageView', null, getViewContexts(view));
    } catch (error) {
      this.handleLogError(error);
    }
  }

  logRequest(request: Request) {
    try {
      // Q - should I add viewId here on the server?
      this.snowplow('trackUnstructEvent', {
        schema: this.getRequestIgluSchema(),
        data: request,
      });
    } catch (error) {
      this.handleLogError(error);
    }
  }

  logInsertion(insertion: Insertion) {
    try {
      this.snowplow('trackUnstructEvent', {
        schema: this.getInsertionIgluSchema(),
        data: insertion,
      });
    } catch (error) {
      this.handleLogError(error);
    }
  }

  logImpression(impression: Impression) {
    try {
      this.snowplow('trackUnstructEvent', {
        schema: this.getImpressionIgluSchema(),
        data: impression,
      });
    } catch (error) {
      this.handleLogError(error);
    }
  }

  logClick({ impressionId, targetUrl, elementId }: Click) {
    try {
      this.snowplow('trackLinkClick', targetUrl, elementId, [], '', '', getClickContexts(impressionId));
    } catch (error) {
      this.handleLogError(error);
    }
  }
}
