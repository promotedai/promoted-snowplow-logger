import { CommonEventProperties, PageViewEvent, SelfDescribingEvent } from '@snowplow/tracker-core';
import type { Action, Click, CohortMembership, Impression, UserInfo, View } from './event';

/**
 * A subset of Snoplow that is needed.
 */
export interface Snowplow {
  trackSelfDescribingEvent(event: SelfDescribingEvent & CommonEventProperties, trackers?: Array<string>): void;

  trackPageView(event?: PageViewEvent & CommonEventProperties, trackers?: Array<string>): void;
}

/**
 * Interface for EventLogger.  The logger better handles errors and
 * conditionals that are encountered during development.
 */
interface EventLogger {
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
}

/**
 * Constructor arguments for EventLogger.
 */
export interface EventLoggerArguments {
  /**
   * A smaller Snowplow interface.  This is needed so we can keep Snowplow as a
   * peer dependency.
   */
  snowplow: Snowplow;

  /**
   * The name of the tracker to use.
   * This is useful if you have multiple trackers on the page.
   * See [Managing multiple trackers](https://docs.snowplow.io/docs/collecting-data/collecting-from-own-applications/javascript-trackers/web-tracker/tracker-setup/managing-multiple-trackers/) for how this parameter is used.
   * If no tracker names are provided, all events will get sent to all instantiated trackers.
   */
  snowplowTrackers?: Array<string> | string;

  /**
   * A way to turn off logging.  Defaults to true.
   */
  enabled?: boolean;

  /**
   * Indicates how to handle errors.
   * E.g. in development, throw an error so the developer can see.  In production,
   * you might want to silently log and monitor to minimize the impact to the UI
   * if there is an issue.
   *
   * Here is example code for NextJS:
   * ```
   * const throwError =
   *   process?.env?.NODE_ENV !== 'production' ||
   *   (typeof location !== "undefined" && location?.hostname === "localhost");
   *
   * ...
   * handleError: throwError ? (err) => { throw error; } : console.error
   * ...
   * ```
   */
  handleError: (err: Error) => void;

  /**
   * Provides a base UserInfo across all records.
   * This is useful if you have your own anonUserId implementation.
   *
   * Example:
   * ```
   * const eventLogger = newEventLogger({
   *   ...
   *   getUserInfo: () => ({
   *     anonUserId: getCustomAnonymousUserId(),
   *     userId: getUserId()
   *   })
   * }
   * ```
   *
   * If both this base UserInfo and the record UserInfo is set, the UserInfos are
   * merged and the record's UserInfos are preferred.
   *
   * This does not work with auto-link tracking.
   */
  getUserInfo?: () => UserInfo | undefined;
}
