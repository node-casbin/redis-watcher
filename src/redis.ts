import Redis, { RedisOptions } from 'ioredis';

export class RedisConnection {
  private readonly options?: Redis.RedisOptions | string;
  public redisClient: Redis.Redis;

  constructor(options?: RedisOptions | string) {
    this.options = options;
  }

  public open() {
    // @ts-ignore
    this.redisClient = new Redis(this.options);
  }

  public close() {
    this.redisClient.disconnect();
  }
}
