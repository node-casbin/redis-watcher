# Redis Watcher

[![CI](https://github.com/node-casbin/redis-watcher/actions/workflows/ci.yml/badge.svg)](https://github.com/node-casbin/redis-watcher/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/node-casbin/redis-watcher/badge.svg?branch=master)](https://coveralls.io/github/node-casbin/redis-watcher?branch=master)
[![NPM version][npm-image]][npm-url]
[![NPM download][download-image]][download-url]
[![Discord](https://img.shields.io/discord/1022748306096537660?logo=discord&label=discord&color=5865F2)](https://discord.gg/S5UjpzGZjN)

[npm-image]: https://img.shields.io/npm/v/@casbin/redis-watcher.svg?style=flat-square
[npm-url]: https://npmjs.com/package/@casbin/redis-watcher
[download-image]: https://img.shields.io/npm/dm/@casbin/redis-watcher.svg?style=flat-square
[download-url]: https://npmjs.com/package/@casbin/redis-watcher

Redis Watcher is the [Redis](https://redis.io/) watcher for [Node-Casbin](https://github.com/casbin/node-casbin). With this library, Node-Casbin can synchronize policy changes across multiple enforcer instances via Redis pub/sub.

This watcher is based on [ioredis](https://github.com/luin/ioredis) and supports both single Redis instances and Redis clusters.

## Installation

```bash
npm install @casbin/redis-watcher
```

**Note: The old package name `redis-watcher` has been deprecated on NPM. Please use `@casbin/redis-watcher` instead.**

## Simple Example

Using Redis:

```typescript
import { newEnforcer } from 'casbin';
import { RedisWatcher } from '@casbin/redis-watcher';

async function myFunction() {
    // Initialize the watcher
    // See https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
    const watcher = await RedisWatcher.newWatcher('redis://localhost:6379/5');

    // Initialize the enforcer
    const enforcer = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');

    // Set the watcher for the enforcer
    enforcer.setWatcher(watcher);

    // Update the policy
    await enforcer.addPolicy('alice', 'data1', 'read');
    
    // The policy change will be synchronized to other enforcers via Redis pub/sub
}
```

Using Redis Cluster:

```typescript
import { newEnforcer } from 'casbin';
import { RedisWatcher } from '@casbin/redis-watcher';

async function myFunction() {
    // Initialize the watcher with Redis cluster
    // See https://github.com/luin/ioredis/blob/master/API.md#new-clusterstartupnodes-options
    const watcher = await RedisWatcher.newWatcherWithCluster([
        { port: 7000, host: 'localhost' },
        { port: 7001, host: 'localhost' },
        { port: 7002, host: 'localhost' }
    ]);

    // Initialize the enforcer
    const enforcer = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');

    // Set the watcher for the enforcer
    enforcer.setWatcher(watcher);

    // Update the policy
    await enforcer.addPolicy('bob', 'data2', 'write');
    
    // The policy change will be synchronized to other enforcers via Redis pub/sub
}
```

## Getting Help

- [Node-Casbin](https://github.com/casbin/node-casbin)
- [Casbin Forum](https://forum.casbin.com/)

## License

This project is under Apache 2.0 License. See the [LICENSE](LICENSE) file for the full license text.

