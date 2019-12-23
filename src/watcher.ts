import { Watcher } from 'casbin';
import { RedisConnection } from './redis';
import { RedisOptions } from 'ioredis';

export interface Options extends RedisOptions {
  channel?: string;
}

export class RedisWatcher implements Watcher {
  private pubConnection: RedisConnection;
  private subConnection: RedisConnection;
  private callback: () => void;
  private channel = 'casbin';

  public static async newWatcher(options?: Options | string): Promise<RedisWatcher> {
    return new RedisWatcher(options);
  }

  private constructor(options?: Options | string) {
    if (typeof options === 'object' && options.channel) {
      this.channel = options.channel;
    }

    this.pubConnection = new RedisConnection(options);
    this.subConnection = new RedisConnection(options);
    this.pubConnection.open();
    this.subConnection.open();

    this.subConnection.redisClient.subscribe(this.channel).catch(() => {});
    this.subConnection.redisClient.on('message', (channel, message) => {
      if (channel !== this.channel) {
        return;
      }
      if (this.callback) {
        this.callback();
      }
    });
  }

  public async update(): Promise<boolean> {
    await this.pubConnection.redisClient.publish(this.channel, 'casbin rules updated');
    return true;
  }

  public setUpdateCallback(callback: () => void) {
    this.callback = callback;
  }

  public async close(): Promise<void> {
    this.pubConnection.close();
    this.subConnection.close();
  }
}
