import type { Action, Click, CohortMembership, Impression, User, View } from './event';

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
   * Logs `impression`.
   */
  logImpression(impression: Impression): void;

  /**
   * Logs `action`.
   */
  logAction(action: Action): void;

  /**
   * Logs `click`.
   */
  logClick(click: Click): void;

  /**
   * Flush any Snowplow events that have been queued up in the EventLogger.
   */
  flushEarlyEvents(): void;
}

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
  handleError: throwError ? (err) => { throw error; } : console.error;
  }
  ```
  */
  handleError: (err: Error) => void;

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

export interface LocalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}
