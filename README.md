# Redis-watcher

[![NPM version][npm-image]][npm-url]
[![NPM download][download-image]][download-url]
[![codebeat badge](https://codebeat.co/badges/28cafe94-1852-48c0-bcc2-09a7d4b81c87)](https://codebeat.co/projects/github-com-node-casbin-redis-watcher-master)
[![ci](https://github.com/node-casbin/redis-watcher/actions/workflows/main.yml/badge.svg)](https://github.com/node-casbin/redis-watcher/actions/workflows/main.yml)
[![Coverage Status](https://coveralls.io/repos/github/node-casbin/redis-watcher/badge.svg?branch=master)](https://coveralls.io/github/node-casbin/redis-watcher?branch=master)
[![Discord](https://img.shields.io/discord/1022748306096537660?logo=discord&label=discord&color=5865F2)](https://discord.gg/S5UjpzGZjN)

[npm-image]: https://img.shields.io/npm/v/redis-watcher.svg?style=flat-square
[npm-url]: https://npmjs.com/package/redis-watcher
[download-image]: https://img.shields.io/npm/dm/redis-watcher.svg?style=flat-square
[download-url]: https://npmjs.com/package/redis-watcher

Redis watcher for node-casbin based on [ioredis](https://github.com/luin/ioredis).

# Installation

```shell script
# NPM
npm install --save @casbin/redis-watcher

# Yarn
yarn add @casbin/redis-watcher
```

**Note: redis-watcher has been deprecated on NPM.**

# Example
Using Redis:

```typescript
import { RedisWatcher } from '@casbin/redis-watcher';
import { newEnforcer } from 'casbin';

// Initialize the watcher, see https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
const watcher = await RedisWatcher.newWatcher('redis://localhost:6379/5');

// Initialize the enforcer.
const enforcer = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');

enforcer.setWatcher(watcher);
```

Using Redis cluster:

```typescript
import { RedisWatcher } from '@casbin/redis-watcher';
import { newEnforcer } from 'casbin';

// Initialize the watcher, see https://github.com/luin/ioredis/blob/master/API.md#new-clusterstartupnodes-options.
const watcher = await RedisWatcher.newWatcherWithCluster([{ port: 7000, host: 'localhost' }]);

// Initialize the enforcer.
const enforcer = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');

enforcer.setWatcher(watcher);
```

