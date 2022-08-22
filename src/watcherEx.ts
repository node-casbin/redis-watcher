// Copyright 2022 The Casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { RedisClusterConnection, RedisConnection, RedisClient } from './redis';
import { ClusterNode, ClusterOptions, RedisOptions } from 'ioredis';
import { Model, WatcherEx } from 'casbin';

export interface WatcherExOptions extends RedisOptions {
  channel?: string;
}

export interface WatcherExClusterOptions extends ClusterOptions {
  channel?: string;
}

export interface WatcherExCallBackOptions {
  addPolicyCb?: (args: { sec: string; ptype: string; params: string[] }) => Promise<void>;
  removePolicyCb?: (args: { sec: string; ptype: string; params: string[] }) => Promise<void>;
  removeFilteredPolicyCb?: (args: { sec: string; ptype: string; field: number; fieldValues: string[] }) => Promise<void>;
  savePolicyCb?: (args: { policies: string[][]; gPolciies: string[][] }) => Promise<void>;
  addPoliciesCb?: (args: { sec: string; ptype: string; params: string[][] }) => Promise<void>;
  removePoliciesCb?: (args: { sec: string; ptype: string; params: string[][] }) => Promise<void>;
}

export interface WatcherExMessage {
  updateType: string;
  args: any;
}

export class RedisWatcherEx implements WatcherEx {
  private pubConnection: RedisConnection | RedisClusterConnection;
  private subConnection: RedisConnection | RedisClusterConnection;
  private channel = 'casbin';

  /**
   * newWatcherEx creates a watcherEx on the single Redis.
   * @param options - https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
   * @example
   * newWatcherEx('redis://user:password@redis-service.com:6379')
   * newWatcherEx('//localhost:6379')
   * newWatcherEx({
   *   port: 6379, // Redis port
   *   host: "127.0.0.1", // Redis host
   *   family: 4, // 4 (IPv4) or 6 (IPv6)
   *   password: "auth",
   *   db: 0,
   *   channel: "casbin"
   * })
   */
  public static async newWatcherEx(
    callBackOptions: WatcherExCallBackOptions,
    options?: WatcherExOptions | string
  ): Promise<RedisWatcherEx> {
    let channel = '';
    if (typeof options === 'object' && options.channel) {
      channel = options.channel;
    }

    const pubConnection = new RedisConnection(options);
    const subConnection = new RedisConnection(options);
    return this.init(callBackOptions, pubConnection, subConnection, channel);
  }

  /**
   * newWatcherExWithCluster creates a watcherEx on the Redis cluster.
   * @param nodes - An array of nodes in the cluster, [{ port: number, host: string }]
   * @param clusterOptions - https://github.com/luin/ioredis/blob/master/API.md#new-clusterstartupnodes-options
   * @example
   * newWatcherExWithCluster([{ port: 6380, host: "127.0.0.1"}, { port: 6381, host: "127.0.0.1"})
   */
  public static async newWatcherExWithCluster(
    nodes: ClusterNode[] = [],
    clusterOptions: WatcherExClusterOptions = {},
    callBackOptions: WatcherExCallBackOptions
  ): Promise<RedisWatcherEx> {
    const pubConnection = new RedisClusterConnection(nodes, clusterOptions);
    const subConnection = new RedisClusterConnection(nodes, clusterOptions);
    return this.init(callBackOptions, pubConnection, subConnection, clusterOptions.channel);
  }

  private static async init(
    callBackOptions: WatcherExCallBackOptions,
    pubConnection: RedisConnection | RedisClusterConnection,
    subConnection: RedisConnection | RedisClusterConnection,
    channel?: string
  ): Promise<RedisWatcherEx> {
    const watcherEx = new RedisWatcherEx();

    watcherEx.pubConnection = pubConnection;
    watcherEx.subConnection = subConnection;

    if (channel) {
      watcherEx.channel = channel;
    }

    const watcherExCallBackMethods: any = {
      updateForAddPolicy: callBackOptions.addPolicyCb,
      updateForRemovePolicy: callBackOptions.removePolicyCb,
      updateForRemoveFilteredPolicy: callBackOptions.removeFilteredPolicyCb,
      updateForSavePolicy: callBackOptions.savePolicyCb,
      updateForAddPolicies: callBackOptions.addPoliciesCb,
      updateForRemovePolicies: callBackOptions.removePoliciesCb
    };

    const client = await watcherEx.subConnection.getRedisClient();
    // @ts-ignore - subscribe is exists.
    await client.subscribe(watcherEx.channel);
    client.on('message', (chan: string, msg: any) => {
      if (chan !== watcherEx.channel) {
        return;
      }
      msg = JSON.parse(JSON.stringify(msg));
      switch (msg.updateType) {
        case 'UpdateForAddPolicy':
          watcherExCallBackMethods.updateForAddPolicy(msg.args);
          break;
        case 'UpdateForRemovePolicy':
          watcherExCallBackMethods.updateForRemovePolicy(msg.args);
          break;
        case 'UpdateForRemoveFilteredPolicy':
          watcherExCallBackMethods.updateForRemoveFilteredPolicy(msg.args);
          break;
        case 'UpdateForSavePolicy':
          watcherExCallBackMethods.updateForSavePolicy(msg.args);
          break;
        case 'UpdateForAddPolicies':
          watcherExCallBackMethods.updateForAddPolicies(msg.args);
          break;
        case 'UpdateForRemovePolicies':
          watcherExCallBackMethods.updateForRemovePolicies(msg.args);
          break;
      }
    });

    return watcherEx;
  }

  private constructor() {}

  public async updateForAddPolicy(sec: string, ptype: string, ...params: string[]): Promise<void> {
    const client = await this.pubConnection.getRedisClient();
    const message = {
      updateType: 'UpdateForAddPolicy',
      args: {
        sec,
        ptype,
        params
      }
    };
    // @ts-ignore - publish is exists.
    await client.publish(this.channel, JSON.stringify(message));
  }

  public async updateForRemovePolicy(sec: string, ptype: string, ...params: string[]): Promise<void> {
    const client = await this.pubConnection.getRedisClient();
    const message = {
      updateType: 'UpdateForRemovePolicy',
      args: {
        sec,
        ptype,
        params
      }
    };
    // @ts-ignore - publish is exists.
    await client.publish(this.channel, JSON.stringify(message));
  }

  public async updateForRemoveFilteredPolicy(sec: string, ptype: string, field: number, ...fieldValues: string[]): Promise<void> {
    const client = await this.pubConnection.getRedisClient();
    const message = {
      updateType: 'UpdateForRemoveFilteredPolicy',
      args: {
        sec,
        ptype,
        field,
        fieldValues
      }
    };
    // @ts-ignore - publish is exists.
    await client.publish(this.channel, JSON.stringify(message));
  }

  public async updateForSavePolicy(model: Model): Promise<boolean> {
    const client = await this.pubConnection.getRedisClient();
    const policies = model.getPolicy('p', 'p');
    const gPolicies = model.getPolicy('g', 'g');
    const message = {
      updateType: 'UpdateForSavePolicy',
      args: {
        policies,
        gPolicies
      }
    };
    // @ts-ignore - publish is exists.
    return await client.publish(this.channel, JSON.stringify(message));
  }

  public async updateForAddPolicies(sec: string, ptype: string, ...params: string[][]): Promise<void> {
    const client = await this.pubConnection.getRedisClient();
    const message = {
      updateType: 'UpdateForAddPolicies',
      args: {
        sec,
        ptype,
        params
      }
    };
    // @ts-ignore - publish is exists.
    await client.publish(this.channel, JSON.stringify(message));
  }

  public async updateForRemovePolicies(sec: string, ptype: string, ...params: string[][]): Promise<void> {
    const client = await this.pubConnection.getRedisClient();
    const message = {
      updateType: 'UpdateForRemovePolicies',
      args: {
        sec,
        ptype,
        params
      }
    };
    // @ts-ignore - publish is exists.
    await client.publish(this.channel, JSON.stringify(message));
  }

  public async close(): Promise<void> {
    this.pubConnection.close();
    this.subConnection.close();
  }
}
