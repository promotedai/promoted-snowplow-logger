import { ImmediateAsyncSnowplow, TimerAsyncSnowplow } from './async-snowplow';

jest.useFakeTimers();

describe('ImmediateAsyncSnowplow', () => {
  describe('call', () => {
    it('success', () => {
      const snowplow = jest.fn();
      const asyncSnowplow = new ImmediateAsyncSnowplow(snowplow, (e) => {
        throw e;
      });
      const event = { fake: 'prop' };
      asyncSnowplow.call('trackUnstructEvent', event);
      expect(snowplow.mock.calls).toEqual([['trackUnstructEvent', event]]);
    });

    it('success', () => {
      const snowplow = jest.fn(() => {
        throw 'Failed';
      });
      const asyncSnowplow = new ImmediateAsyncSnowplow(snowplow, (e) => {
        throw e;
      });
      const event = { fake: 'prop' };
      expect(() => asyncSnowplow.call('trackUnstructEvent', event)).toThrow(/^Failed$/);
    });
  });

  it('flushEarlyEvents', () => {
    const snowplow = jest.fn();
    const asyncSnowplow = new ImmediateAsyncSnowplow(snowplow, (e) => {
      throw e;
    });
    asyncSnowplow.flushEarlyEvents();
    // Nothing should happen.
    expect(snowplow).not.toHaveBeenCalled();
  });
});

// Call ends up testing flushEarlyEvents and createTimerIfNeeded.
describe('TimerAsyncSnowplow - call', () => {
  describe('success', () => {
    it('immediate', () => {
      const snowplow = jest.fn();
      const asyncSnowplow = new TimerAsyncSnowplow(
        () => snowplow,
        (e) => {
          throw e;
        }
      );
      const event = { fake: 'prop' };
      asyncSnowplow.call('trackUnstructEvent', event);
      expect(snowplow.mock.calls).toEqual([['trackUnstructEvent', event]]);
    });

    it('timer', () => {
      let snowplow: any = undefined;
      const asyncSnowplow = new TimerAsyncSnowplow(
        () => snowplow,
        (e) => {
          throw e;
        }
      );
      const event = { fake: 'prop' };
      asyncSnowplow.call('trackUnstructEvent', event);
      snowplow = jest.fn();
      jest.runAllTimers();
      expect(snowplow.mock.calls).toEqual([['trackUnstructEvent', event]]);
    });

    it('timer 3x', () => {
      let snowplow: any = undefined;
      const asyncSnowplow = new TimerAsyncSnowplow(
        () => snowplow,
        (e) => {
          throw e;
        }
      );
      const event0 = { fake: 'prop0' };
      asyncSnowplow.call('trackUnstructEvent', event0);
      const event1 = { fake: 'prop1' };
      asyncSnowplow.call('trackUnstructEvent', event1);
      snowplow = jest.fn();
      jest.runAllTimers();
      expect(snowplow.mock.calls).toEqual([
        ['trackUnstructEvent', event0],
        ['trackUnstructEvent', event1],
      ]);
      const event2 = { fake: 'prop2' };
      asyncSnowplow.call('trackUnstructEvent', event2);
      expect(snowplow.mock.calls).toEqual([
        ['trackUnstructEvent', event0],
        ['trackUnstructEvent', event1],
        ['trackUnstructEvent', event2],
      ]);
    });
  });

  describe('error', () => {
    it('immediate', () => {
      const snowplow = jest.fn(() => {
        throw 'Failed';
      });
      const asyncSnowplow = new TimerAsyncSnowplow(
        () => snowplow,
        (e) => {
          throw e;
        }
      );
      const event = { fake: 'prop' };
      expect(() => asyncSnowplow.call('trackUnstructEvent', event)).toThrow(/^Failed$/);
    });

    it('timer 3x', () => {
      let snowplow: any = undefined;
      const asyncSnowplow = new TimerAsyncSnowplow(
        () => snowplow,
        (e) => {
          throw e;
        }
      );
      const event0 = { fake: 'prop0' };
      asyncSnowplow.call('trackUnstructEvent', event0);
      const event1 = { fake: 'prop1' };
      asyncSnowplow.call('trackUnstructEvent', event1);
      let i = 0;
      snowplow = jest.fn(() => {
        // Fail every other call.
        if (i % 2 === 1) {
          throw 'Failed';
        }
        i++;
      });
      expect(() => jest.runAllTimers()).toThrow(/^Failed$/);
      expect(snowplow.mock.calls).toEqual([
        ['trackUnstructEvent', event0],
        ['trackUnstructEvent', event1],
      ]);
      const event2 = { fake: 'prop2' };
      expect(() => asyncSnowplow.call('trackUnstructEvent', event2)).toThrow(/^Failed$/);
    });
  });

  describe('test max attempt', () => {
    it('right before the max', () => {
      let snowplow: any = undefined;
      const asyncSnowplow = new TimerAsyncSnowplow(
        () => snowplow,
        (e) => {
          throw e;
        }
      );
      const event = { fake: 'prop' };
      asyncSnowplow.call('trackUnstructEvent', event);
      for (let i = 0; i < 14; i++) {
        jest.runOnlyPendingTimers();
      }
      snowplow = jest.fn();
      jest.runAllTimers();
      expect(snowplow.mock.calls).toEqual([['trackUnstructEvent', event]]);
    });

    it('exceed max', () => {
      const snowplow: any = undefined;
      const asyncSnowplow = new TimerAsyncSnowplow(
        () => snowplow,
        (e) => {
          throw e;
        }
      );
      const event = { fake: 'prop' };
      asyncSnowplow.call('trackUnstructEvent', event);
      for (let i = 0; i < 14; i++) {
        jest.runOnlyPendingTimers();
      }
      expect(() => jest.runOnlyPendingTimers()).toThrow(/^Max Snow timers exceeded$/);
    });
  });
});
