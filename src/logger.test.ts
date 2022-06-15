import type { Action, Click, CohortMembership, Impression, User, View } from './types/event';
import { createEventLogger, EventLoggerImpl } from './logger';

const platformName = 'test';

const mockLocalStorage = (items = {}) => ({
  items,
  getItem: (key: string) => items[key],
  setItem: (key: string, value: string) => (items[key] = value),
});

describe('logUser', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const localStorage = mockLocalStorage({
      'p-us': undefined,
      'p-uh': undefined,
    });
    // Use impl so we get access to innerLogUser.
    const logger = new EventLoggerImpl({
      platformName,
      handleError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage,
    });

    const user: User = {
      userInfo: {
        logUserId: 'log-user-id',
      },
    };
    const cf = {
      getDomainUserInfo: () => {
        return [, , , , , , 'session-id1'];
      },
    };
    logger.innerLogUser(cf, user);

    expect(snowplow.mock.calls).toEqual([
      [
        'trackUnstructEvent',
        {
          schema: 'iglu:ai.promoted.test/user/jsonschema/1-0-0',
          data: {
            userInfo: {
              logUserId: 'log-user-id',
            },
          },
        },
      ],
    ]);
    expect(localStorage.items).toEqual({
      'p-uh': '2e9b31c7dfb430e21c52ac37d549e0eebc8b683b',
      'p-us': 'session-id1',
    });
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    // Use impl so we get access to innerLogUser.
    const logger = new EventLoggerImpl({
      platformName,
      handleError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const user: User = {
      userInfo: {
        logUserId: 'log-user-id',
      },
    };
    const cf = {
      getDomainUserInfo: () => {
        return [, , , , , , 'session-id1'];
      },
    };
    expect(() => logger.innerLogUser(cf, user)).toThrow(/^Inner fail: Inner fail: Failed$/);
  });
});

describe('logCohortMembership', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const cohortMembership: CohortMembership = {
      cohortId: 'experiment1',
      arm: 'TREATMENT',
    };
    logger.logCohortMembership(cohortMembership);

    expect(snowplow.mock.calls).toEqual([
      [
        'trackUnstructEvent',
        {
          schema: 'iglu:ai.promoted.test/cohortmembership/jsonschema/1-0-0',
          data: {
            cohortId: 'experiment1',
            arm: 'TREATMENT',
          },
        },
      ],
    ]);
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const cohortMembership: CohortMembership = {
      cohortId: 'experiment1',
      arm: 'TREATMENT',
    };
    expect(() => logger.logCohortMembership(cohortMembership)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logView', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const view: View = {
      useCase: 'SEARCH',
    };
    logger.logView(view);

    expect(snowplow.mock.calls).toEqual([
      [
        'trackPageView',
        null,
        [
          {
            data: {
              useCase: 'SEARCH',
            },
            schema: 'iglu:ai.promoted/pageview_cx/jsonschema/2-0-0',
          },
        ],
      ],
    ]);
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const view: View = {
      useCase: 'SEARCH',
    };
    expect(() => logger.logView(view)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logImpression', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const impression: Impression = {
      impressionId: 'abc-xyz',
    };
    logger.logImpression(impression);

    expect(snowplow.mock.calls).toEqual([
      [
        'trackUnstructEvent',
        {
          schema: 'iglu:ai.promoted.test/impression/jsonschema/1-0-0',
          data: {
            impressionId: 'abc-xyz',
          },
        },
      ],
    ]);
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const impression: Impression = {
      impressionId: 'abc-xyz',
    };
    expect(() => logger.logImpression(impression)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logAction', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const action: Action = {
      impressionId: 'abc-xyz',
    };
    logger.logAction(action);

    expect(snowplow.mock.calls).toEqual([
      [
        'trackUnstructEvent',
        {
          schema: 'iglu:ai.promoted.test/action/jsonschema/1-0-0',
          data: {
            impressionId: 'abc-xyz',
          },
        },
      ],
    ]);
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const action: Action = {
      impressionId: 'abc-xyz',
    };
    expect(() => logger.logAction(action)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logClick', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const click: Click = {
      impressionId: 'abc-xyz',
      targetUrl: 'target-url',
      elementId: 'element-id',
    };
    logger.logClick(click);

    expect(snowplow.mock.calls).toEqual([
      [
        'trackLinkClick',
        'target-url',
        'element-id',
        [],
        '',
        '',
        [
          {
            schema: 'iglu:ai.promoted/impression_cx/jsonschema/1-0-0',
            data: {
              impressionId: 'abc-xyz',
            },
          },
        ],
      ],
    ]);
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const click: Click = {
      impressionId: 'abc-xyz',
      targetUrl: 'target-url',
      elementId: 'element-id',
    };
    expect(() => logger.logClick(click)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('flushEarlyEvents', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });
    logger.flushEarlyEvents();
    // Nothing should happen.
    expect(snowplow).not.toHaveBeenCalled();
  });
});
