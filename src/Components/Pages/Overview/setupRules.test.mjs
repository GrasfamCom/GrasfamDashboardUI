// Run with: node --test --experimental-test-coverage src/Components/Pages/Overview/setupRules.test.mjs
// Plan: docs/product/plans/2026-10-10-admin-setup-checklist.md (acceptance criteria 3-7, 8, D3, D4, D5).
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSteps, hiddenKey, isHidden, progress, setHidden, shouldShow } from './setupRules.js';

const facts = (over = {}) => ({ Schools: 0, Classes: 0, Learners: 0, RollCalls: 0, ParentLinks: null, ...over });
const keys = (steps) => steps.map((s) => s.key);
const byKey = (steps, key) => steps.find((s) => s.key === key);

test('a brand-new school: 4 steps, only the school step can be done now', () => {
  const steps = buildSteps(facts());
  assert.deepEqual(keys(steps), ['school', 'classes', 'learners', 'rollCall']);
  assert.equal(byKey(steps, 'school').blocked, false);
  assert.equal(byKey(steps, 'classes').reason, 'addSchoolFirst');
  assert.equal(byKey(steps, 'learners').reason, 'addClassFirst');
  assert.equal(byKey(steps, 'rollCall').reason, 'addClassAndLearnersFirst');
  assert.deepEqual(progress(steps), { done: 0, total: 4, minutesLeft: 5, nextKey: 'school', allDone: false });
});

test('each step ticks from its own count, in any order', () => {
  const steps = buildSteps(facts({ Schools: 1, Learners: 12 }));
  assert.equal(byKey(steps, 'school').done, true);
  assert.equal(byKey(steps, 'learners').done, true);
  assert.equal(byKey(steps, 'classes').done, false);
  assert.equal(byKey(steps, 'classes').blocked, false);
  assert.equal(byKey(steps, 'rollCall').reason, 'addClassFirst');
  assert.deepEqual(progress(steps), { done: 2, total: 4, minutesLeft: 2, nextKey: 'classes', allDone: false });
});

test('roll call waits for learners once there is a class', () => {
  const steps = buildSteps(facts({ Schools: 1, Classes: 2 }));
  assert.equal(byKey(steps, 'learners').blocked, false);
  assert.equal(byKey(steps, 'rollCall').reason, 'addLearnersFirst');
});

test('a done step is never blocked, even if the data looks out of order', () => {
  const steps = buildSteps(facts({ Classes: 1, RollCalls: 3 }));
  assert.equal(byKey(steps, 'classes').blocked, false);
  assert.equal(byKey(steps, 'rollCall').blocked, false);
  assert.equal(byKey(steps, 'rollCall').done, true);
});

test('the parent-link step appears only when the API sends its count', () => {
  assert.equal(keys(buildSteps(facts({ ParentLinks: null }))).includes('parentLink'), false);
  assert.equal(keys(buildSteps(facts({}))).includes('parentLink'), false);
  const five = buildSteps(facts({ Schools: 1, Classes: 1, ParentLinks: 0 }));
  assert.deepEqual(keys(five), ['school', 'classes', 'learners', 'rollCall', 'parentLink']);
  assert.equal(byKey(five, 'parentLink').reason, 'addLearnersFirst');
  assert.equal(progress(five).total, 5);
  assert.equal(progress(five).minutesLeft, 4);
  const ready = buildSteps(facts({ Schools: 1, Classes: 1, Learners: 5, ParentLinks: 0 }));
  assert.equal(byKey(ready, 'parentLink').blocked, false);
});

test('all done', () => {
  const steps = buildSteps(facts({ Schools: 1, Classes: 1, Learners: 9, RollCalls: 1 }));
  assert.deepEqual(progress(steps), { done: 4, total: 4, minutesLeft: 0, nextKey: null, allDone: true });
  const five = buildSteps(facts({ Schools: 1, Classes: 1, Learners: 9, RollCalls: 1, ParentLinks: 2 }));
  assert.equal(progress(five).allDone, true);
  assert.equal(progress(five).total, 5);
});

test('missing or odd counts count as not done, never as done by guess', () => {
  const steps = buildSteps({ Schools: undefined, Classes: null, Learners: 'x', RollCalls: -1 });
  assert.equal(progress(steps).done, 0);
});

test('only a company administrator sees the card', () => {
  assert.equal(shouldShow({ role: 'Administrator', userType: 'Business', companyId: 'c1' }), true);
  assert.equal(shouldShow({ role: 'Super Admin', userType: 'Business', companyId: 'c1' }), true);
  for (const profile of [
    { role: 'Member', userType: 'Business', companyId: 'c1' },
    { role: 'Moderator', userType: 'Business', companyId: 'c1' },
    { role: 'Visitor', userType: 'Business', companyId: 'c1' },
    { role: 'Master Admin', userType: 'Business', companyId: 'c1' },
    { role: 'Administrator', userType: 'Individual', companyId: 'c1' },
    { role: 'Administrator', userType: 'Business', companyId: null },
    null,
    undefined,
  ]) {
    assert.equal(shouldShow(profile), false, JSON.stringify(profile));
  }
});

const fakeStorage = () => {
  const map = new Map();
  return { getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, v), removeItem: (k) => map.delete(k) };
};

test('hide is remembered per administrator', () => {
  const storage = fakeStorage();
  assert.equal(hiddenKey('u1'), 'grasfam.setupChecklist.hidden.u1');
  assert.equal(isHidden(storage, 'u1'), false);
  setHidden(storage, 'u1', true);
  assert.equal(isHidden(storage, 'u1'), true);
  assert.equal(isHidden(storage, 'u2'), false, 'another admin on the same browser is not affected');
  setHidden(storage, 'u1', false);
  assert.equal(isHidden(storage, 'u1'), false);
});

test('storage that is missing or throws never breaks the card', () => {
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
  assert.equal(isHidden(broken, 'u1'), false);
  assert.doesNotThrow(() => setHidden(broken, 'u1', true));
  assert.doesNotThrow(() => setHidden(broken, 'u1', false));
  assert.equal(isHidden(null, 'u1'), false);
  assert.doesNotThrow(() => setHidden(undefined, 'u1', true));
  assert.equal(isHidden(fakeStorage(), null), false);
});
