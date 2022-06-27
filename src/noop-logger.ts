import type { EventLogger } from './types/logger';

/**
 * A utility class for logging events.
 *
 * Warning: This class modifies the inputs.  We avoid creating duplicate objects
 * to reduce memory pressure.
 */
export class NoopEventLogger implements EventLogger {
  logCohortMembership = () => {
    /* No op. */
  };

  logView = () => {
    /* No op. */
  };

  logImpression = () => {
    /* No op. */
  };

  logAction = () => {
    /* No op. */
  };

  logClick = () => {
    /* No op. */
  };

  flushEarlyEvents = () => {
    /* No op. */
  };
}
