import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { cacheClient } from '@/lib/redis/redis-client';
import { RateLimitError } from '@/errors/rate-limit.error';

export const createRateLimiter = async () => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => cacheClient.client.sendCommand(args),
      prefix: 'rl:',
    }),
    windowMs: 5 * 60 * 1000,
    max: 100,
    handler: () => {
      throw new RateLimitError('Too many requests!');
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
