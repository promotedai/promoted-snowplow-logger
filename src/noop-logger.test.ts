import { createEventLogger } from './logger';
import type { Snowplow } from './types/logger';

const platformName = 'test';

const createMockSnowplow = (): Snowplow => ({
  trackSelfDescribingEvent: jest.fn(),
  trackPageView: jest.fn(),
});

describe('disabled logging', () => {
  it('disable', () => {
    const snowplow = createMockSnowplow();
    const logger = createEventLogger({
      enabled: false,
      platformName,
      snowplow,
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
