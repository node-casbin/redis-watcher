import Redis, { RedisOptions, Cluster, ClusterNode, ClusterOptions } from 'ioredis';

export interface Connection {
  open(): void;
  close(): void;
  getRedisClient(): Redis.Cluster | Redis.Redis;
}

export class RedisConnection implements Connection {
  private readonly options?: Redis.RedisOptions | string;
  private redisClient: Redis.Redis;

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

  public getRedisClient(): Redis.Redis {
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
  }

  public open() {
    this.redisClient = new Redis.Cluster(this.nodes, this.options);
  }

  public close() {
    this.redisClient.disconnect();
  }

  public getRedisClient(): Redis.Cluster {
    return this.redisClient;
  }
}
