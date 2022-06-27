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
   * The name of your Platform in Promoted's configuration.
   */
  platformName: string;

  /**
   * A smaller Snowplow interface.  This is needed so we can keep Snowplow as a
   * peer dependency.
   */
  snowplow: Snowplow;

  /**
   * A way to turn off logging.  Defaults to true.
   */
  enabled?: boolean;

  /**
   * Provides a base UserInfo across all records.
   * This is useful if you have your own logUserId implementation.
   *
   * Example:
   * ```
   * const eventLogger = newEventLogger({
   *   ...
   *   getUserInfo: () => ({
   *     logUserId: getCustomAnonymousUserId(),
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
