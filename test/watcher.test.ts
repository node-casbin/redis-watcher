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

import { newEnforcer } from 'casbin';
import { RedisWatcher } from '../src/watcher';

test('Test1', async done => {
  const watcher = await RedisWatcher.newWatcher('redis://localhost:6379/5');
  const enforcer = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  enforcer.setWatcher(watcher);
  watcher.setUpdateCallback(done);
  await enforcer.savePolicy();
  await watcher.close();
});

test('Test2', async done => {
  const watcher = await RedisWatcher.newWatcher('redis://localhost:6379/5');
  const enforcer = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  enforcer.setWatcher(watcher);
  watcher.setUpdateCallback(done);

  const updater = await RedisWatcher.newWatcher('redis://localhost:6379/5');
  await updater.update();
  await updater.close();

  await watcher.close();
});
