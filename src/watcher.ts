import { Watcher } from 'casbin';
import { RedisClusterConnection, RedisConnection } from './redis';
import { ClusterNode, ClusterOptions, RedisOptions } from 'ioredis';

export interface WatcherOptions extends RedisOptions {
  channel?: string;
}

export interface WatcherClusterOptions extends ClusterOptions {
  channel?: string;
}

export class RedisWatcher implements Watcher {
  private pubConnection: RedisConnection | RedisClusterConnection;
  private subConnection: RedisConnection | RedisClusterConnection;
  private callback: () => void;
  private channel = 'casbin';

  /**
   * newWatcher creates a watcher on the single Redis.
   * @param options - https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
   * @example
   * newWatcher('redis://user:password@redis-service.com:6379')
   * newWatcher('//localhost:6379')
   * newWatcher({
   *   port: 6379, // Redis port
   *   host: "127.0.0.1", // Redis host
   *   family: 4, // 4 (IPv4) or 6 (IPv6)
   *   password: "auth",
   *   db: 0,
   *   channel: "casbin"
   * })
   */
  public static async newWatcher(options?: WatcherOptions | string): Promise<RedisWatcher> {
    let channel = '';
    if (typeof options === 'object' && options.channel) {
      channel = options.channel;
    }

    const pubConnection = new RedisConnection(options);
    const subConnection = new RedisConnection(options);
    return new RedisWatcher(pubConnection, subConnection, channel);
  }

  /**
   * newWatcherCluster creates a watcher on the Redis cluster.
   * @param nodes - An array of nodes in the cluster, [{ port: number, host: string }]
   * @param clusterOptions - https://github.com/luin/ioredis/blob/master/API.md#new-clusterstartupnodes-options
   * @example
   * newWatcherCluster([{ port: 6380, host: "127.0.0.1"}, { port: 6381, host: "127.0.0.1"})
   */
  public static async newWatcherCluster(nodes: ClusterNode[] = [], clusterOptions: WatcherClusterOptions = {}): Promise<RedisWatcher> {
    const pubConnection = new RedisClusterConnection(nodes, clusterOptions);
    const subConnection = new RedisClusterConnection(nodes, clusterOptions);
    return new RedisWatcher(pubConnection, subConnection, clusterOptions.channel);
  }

  private constructor(pubConnection: RedisConnection | RedisClusterConnection, subConnection: RedisConnection | RedisClusterConnection, channel?: string) {
    this.pubConnection = pubConnection;
    this.subConnection = subConnection;

    if (channel) {
      this.channel = channel;
    }

    this.pubConnection.open();
    this.subConnection.open();

    // @ts-ignore - subscribe exists.
    this.subConnection.getRedisClient().subscribe(this.channel).catch(() => {});
    this.subConnection.getRedisClient().on('message', (chan, message) => {
      if (chan !== this.channel) {
        return;
      }
      if (this.callback) {
        this.callback();
      }
    });
  }

  public async update(): Promise<boolean> {
    // @ts-ignore - publish exists.
    await this.pubConnection.getRedisClient().publish(this.channel, 'casbin rules updated');
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
