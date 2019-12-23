'use strict';
import Redis from 'ioredis';

export class RedisConnection {
  private readonly uri: string;

  public redisClient!: Redis.Redis;

  constructor(uri: string) {
    this.uri = uri;
  }

  public open() {
    console.info('Connecting to redis: ', this.uri);
    this.redisClient = new Redis(this.uri);
    return new Promise((done, fail) => {
      const errorHandlerBeforeConnect = (error: Error) => fail(error);
      this.redisClient.once('connect', () => {
        this.redisClient.removeListener('error', errorHandlerBeforeConnect);
        return done();
      });
      this.redisClient.once('error', errorHandlerBeforeConnect);
    });
  }

  public async close() {
    console.info('Disconnect redis: ', this.uri);
    return new Promise((done) => {
      this.redisClient.disconnect();
      return done();
    });
  }
}
