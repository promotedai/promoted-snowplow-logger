import { createEventLogger } from './logger';

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
      handleError: (err: Error) => {
        throw err;
      },
      snowplow,
      localStorage,
    });

    logger.logUser({});
    logger.logCohortMembership({});
    logger.logView({});
    logger.logImpression({
      impressionId: 'impressionId1',
    });
    logger.logClick({
      impressionId: 'impressionId1',
      targetUrl: 'localhost/target',
      elementId: 'button-id',
    });
  });
});
