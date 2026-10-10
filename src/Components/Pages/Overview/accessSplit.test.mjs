// Run with: node --test --experimental-test-coverage src/Components/Pages/Overview/accessSplit.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { coveredEntries, isAllFree } from './accessSplit.js';

const ok = (Source, HasAccess = true) => ({ status: 'fulfilled', value: { data: { HasAccess, Source } } });

test('company cover and the free-for-all plan are both kept, with their source', () => {
  const answers = [ok('Company'), ok('Free'), ok('Own'), ok('Company', false)];
  assert.deepEqual(coveredEntries(['Quiz', 'Tools', 'Academic', 'Religion'], answers), [
    { code: 'Quiz', source: 'Company' },
    { code: 'Tools', source: 'Free' },
  ]);
});

test('an unwrapped answer works, a failed or empty one is skipped', () => {
  const answers = [{ status: 'fulfilled', value: { HasAccess: true, Source: 'Free' } }, { status: 'rejected' }, { status: 'fulfilled', value: null }];
  assert.deepEqual(coveredEntries(['A', 'B', 'C'], answers), [{ code: 'A', source: 'Free' }]);
});

test('no codes gives an empty list', () => {
  assert.deepEqual(coveredEntries([], []), []);
});

test('all-free is true only when every entry is the free plan', () => {
  assert.equal(isAllFree([{ code: 'A', source: 'Free' }, { code: 'B', source: 'Free' }]), true);
  assert.equal(isAllFree([{ code: 'A', source: 'Free' }, { code: 'B', source: 'Company' }]), false);
  assert.equal(isAllFree([{ code: 'B', source: 'Company' }]), false);
  assert.equal(isAllFree([]), false);
});
