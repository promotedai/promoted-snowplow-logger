export type SnowplowFn = (...args: any[]) => void;

/**
 * Wraps Snowplow method and allows for flushing a bunch of Snowplow calls.
 */
export interface AsyncSnowplow {
  /**
   * Same as calling Snowplow but will queue the events if Snowplow is not loaded.
   */
  callSnowplow(...args: any[]): void;

  /**
   * Tries to flush the queue if Snowplow is setup.
   */
  flushEarlyEvents(): void;
}

/**
 * A version of AsyncSnowplow that runs the calls immediately.  A valid
 * SnowplowFn must be passed into the constructor.
 */
export class ImmediateAsyncSnowplow implements AsyncSnowplow {
  snowplow: SnowplowFn;
  handleError: (err: Error) => void;

  public constructor(snowplow: SnowplowFn, handleError: (err: Error) => void) {
    this.snowplow = snowplow;
    this.handleError = handleError;
  }

  callSnowplow(...args: any[]) {
    try {
      this.snowplow(...args);
    } catch (e) {
      this.handleError(e);
    }
  }

  flushEarlyEvents() {
    // Do nothing.
  }
}

// @ts-expect-error window does not have snowplow on it.
export const windowSnowplowProvider = () => typeof window !== 'undefined' && window?.snowplow;

const SLEEP_DURATION_MS = 3000;
const MAX_TIMER_ATTEMPTS = 10;

/**
 * An implementation of AsyncSnowplow that is backed by a timer.
 */
export class TimerAsyncSnowplow implements AsyncSnowplow {
  snowplowProvider: () => SnowplowFn | undefined;
  handleError: (err: Error) => void;
  queue: any[][];
  timer: ReturnType<typeof setTimeout> | undefined;
  numTimerAttempts = 0;

  public constructor(snowplowProvider: () => SnowplowFn | undefined, handleError: (err: Error) => void) {
    this.snowplowProvider = snowplowProvider;
    this.handleError = handleError;
    this.queue = [];
  }

  callSnowplow(...args: any[]) {
    const snowplow = this.snowplowProvider();
    if (snowplow) {
      snowplow(...args);
    } else {
      // Delay call.
      this.queue.push(args);
      this.createTimerIfNeeded();
    }
  }

  flushEarlyEvents() {
    if (this.queue.length > 0) {
      try {
        const snowplow = this.snowplowProvider();
        if (snowplow) {
          let error: Error | undefined = undefined;
          this.queue.forEach((args) => {
            try {
              snowplow(...args);
            } catch (e) {
              error = e;
            }
          });
          this.queue = [];
          if (error !== undefined) {
            throw error;
          }
        } else {
          // Make sure another timer exists.
          this.createTimerIfNeeded();
        }
      } catch (e) {
        this.handleError(e);
      }
    }
  }

  createTimerIfNeeded() {
    if (this.queue.length > 0 && !this.timer) {
      if (this.numTimerAttempts >= MAX_TIMER_ATTEMPTS) {
        this.handleError(new Error('Max Snow timers exceeded'));
      } else {
        this.numTimerAttempts++;
        this.timer = setTimeout(() => {
          this.timer = undefined;
          this.flushEarlyEvents();
        }, SLEEP_DURATION_MS);
      }
    }
  }
}
