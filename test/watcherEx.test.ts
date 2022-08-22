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
import { RedisWatcherEx } from '../src/watcherEx';

test('UpdateForAddpolicy', async () => {
  const AddPolicyCallback = async (args: { sec: string; ptype: string; params: string[] }) => {
    await e1.selfAddPolicy(args.sec, args.ptype, args.params);
    expect(await e2.enforce('alice', '/dataset2/resource2', 'POST')).toBe(true);
    expect(await e1.enforce('alice', '/dataset2/resource2', 'POST')).toBe(true);
    await watcherEx.close();
  };
  const e1 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const e2 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const watcherEx = await RedisWatcherEx.newWatcherEx({ addPolicyCb: AddPolicyCallback }, 'redis://localhost:6379/5');
  e1.setWatcherEx(watcherEx);
  e2.setWatcherEx(watcherEx);
  await e2.addPolicy('alice', '/dataset2/resource2', 'POST');
});

test('UpdateForRemovePolicy', async () => {
  const RemovePolicyCallback = async (args: { sec: string; ptype: string; params: string[] }) => {
    await e1.selfRemovePolicy(args.sec, args.ptype, args.params);
    expect(await e2.enforce('alice', '/dataset1/resource1', 'POST')).toBe(false);
    expect(await e1.enforce('alice', '/dataset1/resource1', 'POST')).toBe(false);
    await watcherEx.close();
  };
  const e1 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const e2 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const watcherEx = await RedisWatcherEx.newWatcherEx({ removePolicyCb: RemovePolicyCallback }, 'redis://localhost:6379/5');
  e1.setWatcherEx(watcherEx);
  e2.setWatcherEx(watcherEx);
  await e2.removePolicy('alice', '/dataset1/resource1', 'POST');
});

test('UpdateForRemoveFilteredPolicy', async () => {
  const RemovePolicyFilteredCallback = async (args: { sec: string; ptype: string; field: number; fieldValues: string[] }) => {
    await e1.selfRemoveFilteredPolicy(args.sec, args.ptype, args.field, args.fieldValues);
    expect(await e2.enforce('alice', '/dataset1/resource1', 'POST')).toBe(false);
    expect(await e2.enforce('alice', '/dataset1/any', 'POST')).toBe(false);
    expect(await e1.enforce('alice', '/dataset1/resource1', 'POST')).toBe(false);
    expect(await e1.enforce('alice', '/dataset1/any', 'POST')).toBe(false);
    await watcherEx.close();
  };
  const e1 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const e2 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const watcherEx = await RedisWatcherEx.newWatcherEx({ removeFilteredPolicyCb: RemovePolicyFilteredCallback }, 'redis://localhost:6379/5');
  e1.setWatcherEx(watcherEx);
  e2.setWatcherEx(watcherEx);
  await e2.removeFilteredPolicy(0, 'alice');
});

test('UpdateForAddPolicies', async () => {
  const AddPoliciesCallback = async (args: { sec: string; ptype: string; params: string[][] }) => {
    await e1.selfAddPolicies(args.sec, args.ptype, args.params);
    expect(await e2.enforce('alice', '/dataset3/resource3', 'POST')).toBe(true);
    expect(await e2.enforce('alice', '/dataset3/resource3', 'GET')).toBe(true);
    expect(await e1.enforce('alice', '/dataset3/resource3', 'POST')).toBe(true);
    expect(await e1.enforce('alice', '/dataset3/resource3', 'GET')).toBe(true);
    await watcherEx.close();
  };
  const e1 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const e2 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const watcherEx = await RedisWatcherEx.newWatcherEx({ addPoliciesCb: AddPoliciesCallback }, 'redis://localhost:6379/5');
  e1.setWatcherEx(watcherEx);
  e2.setWatcherEx(watcherEx);
  await e2.addPolicies([
    ['alice', '/dataset3/resource3', 'POST'],
    ['alice', '/dataset3/resource3', 'GET']
  ]);
});

test('UpdateForRemovePolicies', async () => {
  const RemovePoliciesCallback = async (args: { sec: string; ptype: string; params: string[][] }) => {
    await e1.selfRemovePolicies(args.sec, args.ptype, args.params);
    expect(await e2.enforce('alice', '/dataset1/any', 'GET')).toBe(false);
    expect(await e2.enforce('alice', '/dataset1/resource1', 'GET')).toBe(false);
    expect(await e1.enforce('alice', '/dataset1/any', 'GET')).toBe(false);
    expect(await e1.enforce('alice', '/dataset1/resource1', 'GET')).toBe(false);
    await watcherEx.close();
  };
  const e1 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const e2 = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');
  const watcherEx = await RedisWatcherEx.newWatcherEx({ removePoliciesCb: RemovePoliciesCallback }, 'redis://localhost:6379/5');
  e1.setWatcherEx(watcherEx);
  e2.setWatcherEx(watcherEx);
  await e2.removePolicies([
    ['alice', '/dataset1/*', 'GET'],
    ['alice', '/dataset1/resource1', 'GET']
  ]);
});

