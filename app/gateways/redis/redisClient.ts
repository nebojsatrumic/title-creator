import Redis, {RedisOptions} from "ioredis";
import {conf, redisConfig} from "../../config";
import {Logger} from "../../lib/logger";
import {ICacheClient} from "./ICacheClient";

export class RedisClient implements ICacheClient {
  private redis: any;
  constructor() {
    if (conf.nodeEnv === "test") {
      Logger.info("Using mock Redis client implementation for test env.");
      this.redis = {
        // tslint:disable-next-line:no-empty
        set: () => {},
        del: () => {
          return Promise.resolve();
        },
        get: () => {
          return Promise.resolve();
        },
      };
      return;
    }
    Logger.info("Connecting to Redis...");
    this.redis = new Redis({
      port: +redisConfig.port,
      host: redisConfig.host,
      password: redisConfig.pass,
    } as RedisOptions);
  }

  public getClient() {
    return this.redis;
  }

  public set(key: string, value: any, option?: string, ttl?: number) {
    if (option && ttl) {
      return this.redis.set(key, value, option, ttl);
    }
    return this.redis.set(key, value);
  }

  public get(key: string) {
    return this.redis.get(key);
  }

  public del(key: string) {
    return this.redis.del(key);
  }
}
