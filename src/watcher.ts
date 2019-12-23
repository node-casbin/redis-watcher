import { Watcher } from 'casbin';
import { RedisConnection } from './redis';

export default class RedisWatcher implements Watcher {
  private pubConnection!: RedisConnection;
  private subConnection!: RedisConnection;
  private callback: () => void;

  public static async newWatcher(uri: string): Promise<RedisWatcher> {
    const watcher = new RedisWatcher(uri);
    await Promise.all([watcher.pubConnection.open(), watcher.subConnection.open()]);
    return watcher;
  }

  constructor(uri: string) {
    this.pubConnection = new RedisConnection(uri);
    this.subConnection = new RedisConnection(uri);
  }

  public async update(): Promise<boolean> {
    try {
      await this.pubConnection.redisClient.publish('change', 'casbin rules updated');
      return true;
    } catch (e) {
      return false;
    }
  }

  public setUpdateCallback(callback: () => void) {
    this.callback = callback;
  }

  public async close(): Promise<void> {
    const promise1 = this.pubConnection.close();
    const promise2 = this.subConnection.close();
    await Promise.all([promise1, promise2]);
  }
}
