import { cacheClient } from '@/lib/redis/redis-client';
import { ERROR_CODE } from '@/middleware/error-handler';
import type { Request, Response, NextFunction } from 'express';

const ATTEMPT_LIMIT = 3;
const WINDOW_MINUTE = 60;
const BLOCK_HOUR = 60 * 60;

export const resendActivationLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const key = `activation:limiter:${req.body.email || req.ip}`;
  const now = Math.floor(Date.now() / 1000);

  const blockedUntil = await cacheClient.client.get(`${key}:blocked`);
  if (blockedUntil && Number(blockedUntil) > now) {
    res.status(429).json({ error: { code: ERROR_CODE.RATE_LIMIT, message: 'Too many attempts' } });
    return;
  }

  // Pobierz liczbę prób
  const attemptsRaw = await cacheClient.client.get(key);
  const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;

  if (attempts >= ATTEMPT_LIMIT) {
    // Ustaw blokadę na godzinę
    await cacheClient.client.set(`${key}:blocked`, String(now + BLOCK_HOUR), { EX: BLOCK_HOUR });
    await cacheClient.client.del(key);
    res.status(429).json({ error: { code: ERROR_CODE.RATE_LIMIT, message: 'Too many attempts' } });
    return;
  }

  await cacheClient.client.set(key, String(attempts + 1), { EX: WINDOW_MINUTE });

  next();
};
