// Copyright 2018 The Casbin Authors. All Rights Reserved.
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

import casbin from 'casbin';
import RedisWatcher from '../src/watcher';

describe(('Test Watcher'), () => {
  test('Test1', async () => {
    const watcher = await RedisWatcher.newWatcher('redis://localhost:6379/5');
    watcher.setUpdateCallback(() => console.log('[New revision detected: X]'));
    const enforcer = await casbin.newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
    enforcer.setWatcher(watcher);
    await enforcer.savePolicy();
  });

  test('Test2', async () => {
    const updater = await RedisWatcher.newWatcher('redis://localhost:6379/5');
    const watcher = await RedisWatcher.newWatcher('redis://localhost:6379/5');
    watcher.setUpdateCallback(() => console.log('[New revision detected: X]'));
    const enforcer = await casbin.newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
    enforcer.setWatcher(watcher);

    await updater.update();
  });
});
