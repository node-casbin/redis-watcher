# Redis-watcher

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

