import Redis, { RedisOptions, Cluster, ClusterNode, ClusterOptions } from 'ioredis';

export type RedisClient = Redis.Cluster | Redis.Redis;

export interface Connection {
  close(): void;

  getRedisClient(): Promise<RedisClient>;
}

export class RedisConnection implements Connection {
  private readonly options?: Redis.RedisOptions | string;
  private redisClient: Redis.Redis;

  constructor(options?: RedisOptions | string) {
    this.options = options;
    // @ts-ignore - it works fine.
    this.redisClient = new Redis(this.options);
  }

  public close() {
    this.redisClient.disconnect();
  }

  public async getRedisClient(): Promise<Redis.Redis> {
    return this.redisClient;
  }
}

export class RedisClusterConnection implements Connection {
  private readonly options?: Redis.ClusterOptions;
  public redisClient: Redis.Cluster;
  public nodes: ClusterNode[];

  constructor(nodes: ClusterNode[] = [], options: ClusterOptions = {}) {
    this.nodes = nodes;
    this.options = options;
    this.redisClient = new Redis.Cluster(this.nodes, this.options);
  }

  public close() {
    this.redisClient.disconnect();
  }

  public async getRedisClient(): Promise<Redis.Cluster> {
    return this.redisClient;
  }
}
