import type { Action, Click, CohortMembership, Impression, View } from './types/event';
import type { EventLogger, EventLoggerArguments } from './types/logger';
import { createEventLogger } from './logger';

const snowplowTrackers: Array<string> | string | undefined = undefined;

interface MockSnowplow {
  trackSelfDescribingEvent: jest.Mock;
  trackPageView: jest.Mock;
}

const createMockSnowplow = (): MockSnowplow => ({
  trackSelfDescribingEvent: jest.fn(),
  trackPageView: jest.fn(),
});

const createThrowingMockSnowplow = (): MockSnowplow => ({
  trackSelfDescribingEvent: jest.fn(() => {
    throw 'Failed';
  }),
  trackPageView: jest.fn(() => {
    throw 'Failed';
  }),
});

export const createTestEventLogger = (args: Omit<EventLoggerArguments, 'handleError'>): EventLogger =>
  createEventLogger({
    ...args,
    handleError: (e) => {
      throw e;
    },
  });

describe('logCohortMembership', () => {
  it('success', () => {
    const snowplow = createMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
      snowplowTrackers,
    });

    const cohortMembership: CohortMembership = {
      cohortId: 'experiment1',
      arm: 'TREATMENT',
    };
    logger.logCohortMembership(cohortMembership);

    expect(snowplow.trackSelfDescribingEvent.mock.calls).toEqual([
      [
        {
          event: {
            schema: 'iglu:ai.promoted/cohortmembership/jsonschema/1-0-0',
            data: {
              cohortId: 'experiment1',
              arm: 'TREATMENT',
            },
          },
        },
        snowplowTrackers,
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
      snowplowTrackers,
    });

    const cohortMembership: CohortMembership = {
      cohortId: 'experiment1',
      arm: 'TREATMENT',
    };
    expect(() => logger.logCohortMembership(cohortMembership)).toThrow(/^Failed$/);
  });
});

describe('logView', () => {
  it('success', () => {
    const snowplow = createMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
      snowplowTrackers,
    });

    const view: View = {
      useCase: 'SEARCH',
    };
    logger.logView(view);

    expect(snowplow.trackPageView.mock.calls).toEqual([
      [
        {
          context: [
            {
              data: {
                useCase: 'SEARCH',
              },
              schema: 'iglu:ai.promoted/pageview_cx/jsonschema/2-0-0',
            },
          ],
        },
        snowplowTrackers,
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
    });

    const view: View = {
      useCase: 'SEARCH',
    };
    expect(() => logger.logView(view)).toThrow(/^Failed$/);
  });
});

describe('logImpression', () => {
  it('success', () => {
    const snowplow = createMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
      snowplowTrackers,
    });

    const impression: Impression = {
      impressionId: 'abc-xyz',
    };
    logger.logImpression(impression);

    expect(snowplow.trackSelfDescribingEvent.mock.calls).toEqual([
      [
        {
          event: {
            schema: 'iglu:ai.promoted/impression/jsonschema/1-0-0',
            data: {
              impressionId: 'abc-xyz',
            },
          },
        },
        snowplowTrackers,
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
    });

    const impression: Impression = {
      impressionId: 'abc-xyz',
    };
    expect(() => logger.logImpression(impression)).toThrow(/^Failed$/);
  });
});

describe('logAction', () => {
  it('success', () => {
    const snowplow = createMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
      snowplowTrackers,
    });

    const action: Action = {
      impressionId: 'abc-xyz',
    };
    logger.logAction(action);

    expect(snowplow.trackSelfDescribingEvent.mock.calls).toEqual([
      [
        {
          event: {
            schema: 'iglu:ai.promoted/action/jsonschema/1-0-0',
            data: {
              impressionId: 'abc-xyz',
            },
          },
        },
        snowplowTrackers,
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
    });

    const action: Action = {
      impressionId: 'abc-xyz',
    };
    expect(() => logger.logAction(action)).toThrow(/^Failed$/);
  });

  describe('cart', () => {
    it('success - convert amount to micros', () => {
      const snowplow = createMockSnowplow();
      const logger = createTestEventLogger({
        snowplow,
        snowplowTrackers,
      });

      const action: Action = {
        impressionId: 'abc-xyz',
        actionType: 'CHECKOUT',
        cart: {
          contents: [
            {
              contentId: '1',
              quantity: 1,
              pricePerUnit: {
                currencyCode: 'USD',
                amount: 2,
              },
            },
          ],
        },
      };
      logger.logAction(action);

      expect(snowplow.trackSelfDescribingEvent.mock.calls).toEqual([
        [
          {
            event: {
              schema: 'iglu:ai.promoted/action/jsonschema/1-0-0',
              data: {
                impressionId: 'abc-xyz',
                actionType: 'CHECKOUT',
                cart: {
                  contents: [
                    {
                      contentId: '1',
                      quantity: 1,
                      pricePerUnit: {
                        currencyCode: 'USD',
                        amountMicros: 2000000,
                      },
                    },
                  ],
                },
              },
            },
          },
          snowplowTrackers,
        ],
      ]);
    });

    it('error - quantity should be non-zero', () => {
      const snowplow = createMockSnowplow();
      const logger = createTestEventLogger({
        snowplow,
      });

      const action: Action = {
        impressionId: 'abc-xyz',
        actionType: 'CHECKOUT',
        cart: {
          contents: [
            {
              contentId: '1',
              quantity: 0,
              pricePerUnit: {
                currencyCode: 'USD',
                amount: 2,
              },
            },
          ],
        },
      };
      expect(() => logger.logAction(action)).toThrow(/^CartContent.quantity should be non-zero$/);
    });

    it('error - do not set both amount and amountMicros', () => {
      const snowplow = createMockSnowplow();
      const logger = createTestEventLogger({
        snowplow,
      });

      const action: Action = {
        impressionId: 'abc-xyz',
        actionType: 'CHECKOUT',
        cart: {
          contents: [
            {
              contentId: '1',
              quantity: 1,
              pricePerUnit: {
                currencyCode: 'USD',
                amount: 2,
                amountMicros: 2000000,
              },
            },
          ],
        },
      };
      expect(() => logger.logAction(action)).toThrow(/^Do not set both amount and amountMicros$/);
    });
  });
});

describe('logClick', () => {
  it('success', () => {
    const snowplow = createMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
      snowplowTrackers,
    });

    const click: Click = {
      impressionId: 'abc-xyz',
      targetUrl: 'target-url',
      elementId: 'element-id',
    };
    logger.logClick(click);

    expect(snowplow.trackSelfDescribingEvent.mock.calls).toEqual([
      [
        {
          event: {
            schema: 'iglu:ai.promoted/action/jsonschema/1-0-0',
            data: {
              actionType: 2,
              elementId: 'element-id',
              impressionId: 'abc-xyz',
              navigateAction: {
                targetUrl: 'target-url',
              },
            },
          },
        },
        snowplowTrackers,
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
    });

    const click: Click = {
      impressionId: 'abc-xyz',
      targetUrl: 'target-url',
      elementId: 'element-id',
    };
    expect(() => logger.logClick(click)).toThrow(/^Failed$/);
  });
});

describe('mergeBaseUserInfo', () => {
  // TODO - specify getUserInfo but returns undefined.
  // TODO - on record.

  it('no userInfo', () => {
    runTestCase({}, {}, {});
  });

  it('base userInfo is undefined', () => {
    runTestCase({ getUserInfo: () => undefined }, {}, {});
  });

  it('base userInfo is specified ', () => {
    runTestCase({ getUserInfo: () => ({ anonUserId: 'abc' }) }, {}, { userInfo: { anonUserId: 'abc' } });
  });

  describe('both base and record userinfo set', () => {
    it('override anonUserId', () => {
      runTestCase(
        { getUserInfo: () => ({ anonUserId: 'abc' }) },
        { userInfo: { anonUserId: 'efg' } },
        { userInfo: { anonUserId: 'efg' } }
      );
    });

    it('merge some fields', () => {
      runTestCase(
        { getUserInfo: () => ({ anonUserId: 'abc' }) },
        { userInfo: { userId: 'efg' } },
        { userInfo: { anonUserId: 'abc', userId: 'efg' } }
      );
    });
  });

  const runTestCase = (args: Partial<EventLoggerArguments>, inputData: Impression, expectedData: Impression) => {
    const snowplow = createMockSnowplow();
    const logger = createTestEventLogger({
      ...args,
      snowplow,
      snowplowTrackers,
    });

    const impression: Impression = {
      impressionId: 'abc-xyz',
      ...inputData,
    };
    logger.logImpression(impression);

    expect(snowplow.trackSelfDescribingEvent.mock.calls).toEqual([
      [
        {
          event: {
            schema: 'iglu:ai.promoted/impression/jsonschema/1-0-0',
            data: {
              impressionId: 'abc-xyz',
              ...expectedData,
            },
          },
        },
        snowplowTrackers,
      ],
    ]);
  };
});

describe('snowplowTrackers', () => {
  it('will pass undefined trackers to snowplow', () => {
    runTrackersTestCase(undefined, undefined);
  });

  it('it will convert a single value to an array and pass to snowplow', () => {
    runTrackersTestCase('tracker1', ['tracker1']);
  });

  it('will pass an array to snowplow', () => {
    const trackers = ['tracker1', 'tracker2'];
    runTrackersTestCase(trackers, trackers);
  });

  const runTrackersTestCase = (
    snowplowTrackers: Array<string> | string | undefined,
    expectedTrackers: Array<string> | undefined
  ) => {
    const snowplow = createMockSnowplow();
    const logger = createTestEventLogger({
      snowplow,
      snowplowTrackers,
    });

    const impression: Impression = {
      impressionId: 'abc-xyz',
    };
    logger.logImpression(impression);

    expect(snowplow.trackSelfDescribingEvent.mock.calls).toEqual([
      [
        {
          event: {
            schema: 'iglu:ai.promoted/impression/jsonschema/1-0-0',
            data: {
              impressionId: 'abc-xyz',
            },
          },
        },
        expectedTrackers,
      ],
    ]);
  };
});
