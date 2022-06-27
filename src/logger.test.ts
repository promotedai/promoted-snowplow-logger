import type { Action, Click, CohortMembership, Impression, View } from './types/event';
import type { EventLoggerArguments } from './types/logger';
import { createEventLogger } from './logger';

const platformName = 'test';

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

describe('logCohortMembership', () => {
  it('success', () => {
    const snowplow = createMockSnowplow();
    const logger = createEventLogger({
      platformName,
      snowplow,
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
            schema: 'iglu:ai.promoted.test/cohortmembership/jsonschema/1-0-0',
            data: {
              cohortId: 'experiment1',
              arm: 'TREATMENT',
            },
          },
        },
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createEventLogger({
      platformName,
      snowplow,
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
    const logger = createEventLogger({
      platformName,
      snowplow,
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
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createEventLogger({
      platformName,
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
    const logger = createEventLogger({
      platformName,
      snowplow,
    });

    const impression: Impression = {
      impressionId: 'abc-xyz',
    };
    logger.logImpression(impression);

    expect(snowplow.trackSelfDescribingEvent.mock.calls).toEqual([
      [
        {
          event: {
            schema: 'iglu:ai.promoted.test/impression/jsonschema/1-0-0',
            data: {
              impressionId: 'abc-xyz',
            },
          },
        },
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createEventLogger({
      platformName,
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
    const logger = createEventLogger({
      platformName,
      snowplow,
    });

    const action: Action = {
      impressionId: 'abc-xyz',
    };
    logger.logAction(action);

    expect(snowplow.trackSelfDescribingEvent.mock.calls).toEqual([
      [
        {
          event: {
            schema: 'iglu:ai.promoted.test/action/jsonschema/1-0-0',
            data: {
              impressionId: 'abc-xyz',
            },
          },
        },
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createEventLogger({
      platformName,
      snowplow,
    });

    const action: Action = {
      impressionId: 'abc-xyz',
    };
    expect(() => logger.logAction(action)).toThrow(/^Failed$/);
  });
});

describe('logClick', () => {
  it('success', () => {
    const snowplow = createMockSnowplow();
    const logger = createEventLogger({
      platformName,
      snowplow,
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
            schema: 'iglu:ai.promoted.test/action/jsonschema/1-0-0',
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
      ],
    ]);
  });

  it('error', () => {
    const snowplow = createThrowingMockSnowplow();
    const logger = createEventLogger({
      platformName,
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
    runTestCase({ getUserInfo: () => ({ logUserId: 'abc' }) }, {}, { userInfo: { logUserId: 'abc' } });
  });

  describe('both base and record userinfo set', () => {
    it('override logUserId', () => {
      runTestCase(
        { getUserInfo: () => ({ logUserId: 'abc' }) },
        { userInfo: { logUserId: 'efg' } },
        { userInfo: { logUserId: 'efg' } }
      );
    });

    it('merge some fields', () => {
      runTestCase(
        { getUserInfo: () => ({ logUserId: 'abc' }) },
        { userInfo: { userId: 'efg' } },
        { userInfo: { logUserId: 'abc', userId: 'efg' } }
      );
    });
  });

  const runTestCase = (args: Partial<EventLoggerArguments>, inputData: Impression, expectedData: Impression) => {
    const snowplow = createMockSnowplow();
    const logger = createEventLogger({
      ...args,
      platformName,
      snowplow,
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
            schema: 'iglu:ai.promoted.test/impression/jsonschema/1-0-0',
            data: {
              impressionId: 'abc-xyz',
              ...expectedData,
            },
          },
        },
      ],
    ]);
  };
});
