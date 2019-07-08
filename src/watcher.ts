import { Watcher } from 'casbin';
import { RedisConnection } from './redis';

export default class RedisWatcher implements Watcher {
  private pubConnection!: RedisConnection;
  private subConnection!: RedisConnection;
  private callback!: () => void;

  constructor (uri: string) {
    this.pubConnection = new RedisConnection(uri);
    this.subConnection = new RedisConnection(uri);
  }

  static async newWatcher (uri: string): Promise<RedisWatcher> {
    const watcher = new RedisWatcher(uri);
    await Promise.all([watcher.pubConnection.open(), watcher.subConnection.open()]);
    return watcher;
  }

  public async update (): Promise<boolean> {
    try {
      await this.pubConnection.redisClient.publish('change', 'casbin rules updated');
      return true;
    } catch {
      return false;
    }
  }

  public setUpdateCallback (callback: () => void) {
    this.callback = callback;
  }

  public async close(): Promise<void> {
    const promise1 = this.pubConnection.close();
    const promise2 = this.subConnection.close();
    await Promise.all([promise1, promise2]);
  }
}