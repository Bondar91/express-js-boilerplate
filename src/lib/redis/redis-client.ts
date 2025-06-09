/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from 'redis';
import { loadEnvs } from '@/config/env';
import { createLogger, type ILogger } from '../logger';
import { redisConfig } from '@/config/redis';

loadEnvs();

export interface ICacheClient {
  get(key: string): Promise<any>;
  set(key: string, data: any, duration?: number): Promise<boolean>;
  removeByPattern(pattern: string): Promise<any>;
  scanByPattern(pattern: string): Promise<string[]>;
}

class CustomRedisClient implements ICacheClient {
  private readonly cacheClient: ReturnType<typeof createClient>;

  private logger: ILogger;

  public constructor() {
    this.cacheClient = createClient({ url: redisConfig.url });
    this.logger = createLogger();
    this.cacheClient.on('error', err => {
      if (err) {
        this.logger.error(`Unhandled redis error: ${err.toString()}`, err);
      }
    });
  }

  public async connect() {
    return this.cacheClient.connect();
  }

  public async get(key: string) {
    try {
      const result = await this.cacheClient.get(key);
      if (!result) {
        return null;
      }
      return JSON.parse(result);
    } catch {
      return null;
    }
  }

  public async set(key: string, data: any, duration: number = 1800): Promise<boolean> {
    const status = await this.cacheClient.set(key, JSON.stringify(data), {
      EX: duration,
    });

    this.logger.info(`Cache set for key: ${key}`);

    return status === 'OK';
  }

  public scanByPattern(pattern: string): Promise<string[]> {
    const scanRecursive = async (client: ReturnType<typeof createClient>, cursor: string = '0'): Promise<string[]> => {
      const result = await client.scan(cursor, {
        MATCH: pattern,
        COUNT: 10,
      });

      if (result.cursor === '0') {
        return result.keys;
      }

      const nextKeys = await scanRecursive(client, result.cursor);
      return [...result.keys, ...nextKeys];
    };

    return scanRecursive(this.cacheClient);
  }

  public async removeByPattern(pattern: string) {
    const foundKeys: string[] = await this.cacheClient.keys(pattern);
    this.logger.info(`Cache keys found to delete: ${foundKeys}`);
    await Promise.all(foundKeys.map(key => this.cacheClient.del(key)));
  }

  public get client() {
    return this.cacheClient;
  }
}

export const cacheClient = new CustomRedisClient();
