import { createEventLogger } from './logger';
import type { Snowplow } from './types/logger';

const createMockSnowplow = (): Snowplow => ({
  trackSelfDescribingEvent: jest.fn(),
  trackPageView: jest.fn(),
});

describe('disabled logging', () => {
  it('disable', () => {
    const snowplow = createMockSnowplow();
    const logger = createEventLogger({
      enabled: false,
      snowplow,
      handleError: (e) => {
        throw e;
      },
    });

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
