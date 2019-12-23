# redis-watcher

Redis watcher for node-casbin

# Installation

```shell script
# NPM
npm install --save redis-watcher

# Yarn
yarn add redis-watcher
```

# Simple Example
```typescript
import { RedisWatcher } from './lib/watcher';
import { newEnforcer } from 'casbin';

// Initialize the watcher.
const watcher = await RedisWatcher.newWatcher('redis://localhost:6379/5');

// Initialize the enforcer.
const enforcer = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');

enforcer.setWatcher(watcher);

// By default, the watcher's callback is automatically set to the
// enforcer's loadPolicy() in the setWatcher() call.
// We can change it by explicitly setting a callback.
watcher.setUpdateCallback(() => console.log('Casbin need update'));

```

