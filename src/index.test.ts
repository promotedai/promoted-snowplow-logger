import {
  Click,
  CohortMembership,
  createEventLogger,
  EventLoggerImpl,
  Impression,
  Insertion,
  Request,
  User,
  View,
} from '.';

const platformName = 'test';

const mockLocalStorage = (items = {}) => ({
  items,
  getItem: (key: string) => items[key],
  setItem: (key: string, value: string) => (items[key] = value),
});

describe('disabled logging', () => {
  it('disable', () => {
    const snowplow = jest.fn();
    const localStorage = mockLocalStorage({
      'p-us': undefined,
      'p-uh': undefined,
    });
    const logger = createEventLogger({
      enabled: false,
      platformName,
      handleLogError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage,
    });

    logger.logUser({
      common: {},
    });
    logger.logCohortMembership({
      common: {},
    });
    logger.logView({
      common: {},
    });
    logger.logRequest({
      common: {
        requestId: 'requestId1',
      },
    });
    logger.logInsertion({
      common: {
        insertionId: 'insertionId1',
      },
    });
    logger.logImpression({
      common: {
        impressionId: 'impressionId1',
      },
    });
    logger.logClick({
      impressionId: 'impressionId1',
      targetUrl: 'localhost/target',
      elementId: 'button-id',
    });
  });
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
      handleLogError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage,
    });

    const user = {
      common: {
        logUserId: 'log-user-id',
      },
    } as User;
    const cf = {
      getDomainUserInfo: () => {
        return [, , , , , , 'session-id1'];
      },
    };
    logger.innerLogUser(cf, user);

    expect(snowplow.mock.calls.length).toBe(1);
    expect(snowplow.mock.calls[0][0]).toEqual('trackUnstructEvent');
    expect(snowplow.mock.calls[0][1]).toEqual({
      schema: 'iglu:ai.promoted.test/user/jsonschema/1-0-0',
      data: {
        common: {
          logUserId: 'log-user-id',
        },
      },
    });
    expect(localStorage.items).toEqual({
      'p-uh': '79fde9e6f22beefc8863cae0df052eb4dd56babf',
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
      handleLogError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const user = {
      common: {
        logUserId: 'log-user-id',
      },
    } as User;
    const cf = {
      getDomainUserInfo: () => {
        return [, , , , , , 'session-id1'];
      },
    };
    expect(() => logger.innerLogUser(cf, user)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logCohortMembership', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const cohortMembership = {
      common: {
        cohort_id: 'UNKNOWN_COHORT',
        experimentGroup: 'EXPERIMENT',
      },
    } as CohortMembership;
    logger.logCohortMembership(cohortMembership);

    expect(snowplow.mock.calls.length).toBe(1);
    expect(snowplow.mock.calls[0][0]).toEqual('trackUnstructEvent');
    expect(snowplow.mock.calls[0][1]).toEqual({
      schema: 'iglu:ai.promoted.test/cohortmembership/jsonschema/1-0-0',
      data: {
        common: {
          cohort_id: 'UNKNOWN_COHORT',
          experimentGroup: 'EXPERIMENT',
        },
      },
    });
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const cohortMembership = {
      common: {
        cohort_id: 'UNKNOWN_COHORT',
        experimentGroup: 'EXPERIMENT',
      },
    } as CohortMembership;
    expect(() => logger.logCohortMembership(cohortMembership)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logView', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const view = {
      common: {
        useCase: 'SEARCH',
      },
    } as View;
    logger.logView(view);

    expect(snowplow.mock.calls.length).toBe(1);
    expect(snowplow.mock.calls[0][0]).toEqual('trackPageView');
    expect(snowplow.mock.calls[0][1]).toEqual(null);
    expect(snowplow.mock.calls[0][2]).toEqual([
      {
        data: {
          common: {
            useCase: 'SEARCH',
          },
        },
        schema: 'iglu:ai.promoted/pageview_cx/jsonschema/2-0-0',
      },
    ]);
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const view = {
      common: {
        useCase: 'SEARCH',
      },
    } as View;
    expect(() => logger.logView(view)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logRequest', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const request = {
      common: {
        requestId: 'abc-xyz',
        useCase: 'SEARCH',
      },
      experimentOneGroup: 1,
    } as Request;
    logger.logRequest(request);

    expect(snowplow.mock.calls.length).toBe(1);
    expect(snowplow.mock.calls[0][0]).toEqual('trackUnstructEvent');
    expect(snowplow.mock.calls[0][1]).toEqual({
      schema: 'iglu:ai.promoted.test/request/jsonschema/1-0-0',
      data: {
        common: {
          requestId: 'abc-xyz',
          useCase: 'SEARCH',
        },
        experimentOneGroup: 1,
      },
    });
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const request = {
      common: {
        requestId: 'abc-xyz',
        useCase: 'SEARCH',
      },
      experimentOneGroup: 1,
    } as Request;
    expect(() => logger.logRequest(request)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logInsertion', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const insertion = {
      common: {
        insertionId: 'abc-xyz',
        contentId: '123',
      },
      shirt: {
        color: 'blue',
      },
    } as Insertion;
    logger.logInsertion(insertion);

    expect(snowplow.mock.calls.length).toBe(1);
    expect(snowplow.mock.calls[0][0]).toEqual('trackUnstructEvent');
    expect(snowplow.mock.calls[0][1]).toEqual({
      schema: 'iglu:ai.promoted.test/insertion/jsonschema/1-0-0',
      data: {
        common: {
          contentId: '123',
          insertionId: 'abc-xyz',
        },
        shirt: {
          color: 'blue',
        },
      },
    });
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const insertion = {
      common: {
        insertionId: 'abc-xyz',
        contentId: '123',
      },
      shirt: {
        color: 'blue',
      },
    } as Insertion;
    expect(() => logger.logInsertion(insertion)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logImpression', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const impression = {
      common: {
        impressionId: 'abc-xyz',
      },
      timeMillis: 123456789,
    } as Impression;
    logger.logImpression(impression);

    expect(snowplow.mock.calls.length).toBe(1);
    expect(snowplow.mock.calls[0][0]).toEqual('trackUnstructEvent');
    expect(snowplow.mock.calls[0][1]).toEqual({
      schema: 'iglu:ai.promoted.test/impression/jsonschema/1-0-0',
      data: {
        common: {
          impressionId: 'abc-xyz',
        },
        timeMillis: 123456789,
      },
    });
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
        throw 'Inner fail: ' + err;
      },
      snowplow,
      localStorage: mockLocalStorage(),
    });

    const impression = {
      common: {
        impressionId: 'abc-xyz',
      },
      timeMillis: 123456789,
    } as Impression;
    expect(() => logger.logImpression(impression)).toThrow(/^Inner fail: Failed$/);
  });
});

describe('logClick', () => {
  it('success', () => {
    const snowplow = jest.fn();
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
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

    expect(snowplow.mock.calls.length).toBe(1);
    expect(snowplow.mock.calls[0][0]).toEqual('trackLinkClick');
    expect(snowplow.mock.calls[0][1]).toEqual('target-url');
    expect(snowplow.mock.calls[0][2]).toEqual('element-id');
    expect(snowplow.mock.calls[0][3]).toEqual([]);
    expect(snowplow.mock.calls[0][4]).toEqual('');
    expect(snowplow.mock.calls[0][5]).toEqual('');
    expect(snowplow.mock.calls[0][6]).toEqual([
      {
        schema: 'iglu:ai.promoted/impression_cx/jsonschema/1-0-0',
        data: {
          impressionId: 'abc-xyz',
        },
      },
    ]);
  });

  it('error', () => {
    const snowplow = jest.fn(() => {
      throw 'Failed';
    });
    const logger = createEventLogger({
      platformName,
      handleLogError: (err: Error) => {
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
