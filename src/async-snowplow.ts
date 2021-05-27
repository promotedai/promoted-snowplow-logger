export type SnowplowFn = (...args: any[]) => void;

/**
 * Wraps Snowplow method and allows for flushing a bunch of Snowplow calls.
 */
export interface AsyncSnowplow {
  /**
   * Same as calling Snowplow but will queue the events if Snowplow is not loaded.
   */
  call(...args: any[]): void;

  /**
   * Tries to flush the queue if Snowplow is setup.
   */
  tryFlush(): void;
}

/**
 * A version of AsyncSnowplow that runs the calls immediately.  A valid
 * SnowplowFn must be passed into the constructor.
 */
export class ImmediateAsyncSnowplow implements AsyncSnowplow {
  snowplow: SnowplowFn;
  handleLogError: (err: Error) => void;

  public constructor(snowplow: SnowplowFn, handleLogError: (err: Error) => void) {
    this.snowplow = snowplow;
    this.handleLogError = handleLogError;
  }

  call(...args: any[]) {
    try {
      this.snowplow(...args);
    } catch (e) {
      this.handleLogError(e);
    }
  }

  tryFlush() {
    // Do nothing.
  }
}

// @ts-expect-error window does not have snowplow on it.
export const windowSnowplowProvider = () => typeof window !== 'undefined' && window?.snowplow;

const SLEEP_DURATION_MS = 2000;
const MAX_TIMER_ATTEMPTS = 15;

/**
 * An implementation of AsyncSnowplow that is backed by a timer.
 */
export class TimerAsyncSnowplow implements AsyncSnowplow {
  snowplowProvider: () => SnowplowFn | undefined;
  handleLogError: (err: Error) => void;
  queue: any[][];
  timer: ReturnType<typeof setTimeout> | undefined;
  numTimerAttempts = 0;

  public constructor(snowplowProvider: () => SnowplowFn | undefined, handleLogError: (err: Error) => void) {
    this.snowplowProvider = snowplowProvider;
    this.handleLogError = handleLogError;
    this.queue = [];
  }

  call(...args: any[]) {
    const snowplow = this.snowplowProvider();
    if (snowplow) {
      snowplow(...args);
    } else {
      // Delay call.
      this.queue.push(args);
      this.createTimerIfNeeded();
    }
  }

  tryFlush() {
    if (this.queue.length > 0) {
      try {
        const snowplow = this.snowplowProvider();
        if (snowplow) {
          const newQueue: any[][] = [];
          let error: Error | undefined = undefined;
          this.queue.forEach((args) => {
            try {
              snowplow(...args);
            } catch (e) {
              newQueue.push(args);
              error = e;
            }
          });
          this.queue = newQueue;
          if (error !== undefined) {
            throw error;
          }
        } else {
          // Make sure another timer exists.
          this.createTimerIfNeeded();
        }
      } catch (e) {
        this.handleLogError(e);
      }
    }
  }

  createTimerIfNeeded() {
    if (this.queue.length > 0 && !this.timer) {
      if (this.numTimerAttempts >= MAX_TIMER_ATTEMPTS) {
        this.handleLogError(new Error('Max Snow timers exceeded'));
      } else {
        this.numTimerAttempts++;
        this.timer = setTimeout(() => {
          this.timer = undefined;
          this.tryFlush();
        }, SLEEP_DURATION_MS);
      }
    }
  }
}
