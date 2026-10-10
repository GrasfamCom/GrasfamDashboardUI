// Pure rules for the "Set up your school" card (plan 2026-10-10-admin-setup-checklist.md).
// No React, no network: the card passes in the counts from GET /api/v1/dashboard/setup, the
// profile and a storage object, and gets plain data back.

const ADMIN_ROLES = ['Super Admin', 'Administrator'];
const HIDDEN_KEY_PREFIX = 'grasfam.setupChecklist.hidden.';

const has = (count) => Number.isFinite(count) && count > 0;

const STEPS = [
  { key: 'school', minutes: 1, count: 'Schools', block: () => null },
  { key: 'classes', minutes: 1, count: 'Classes', block: (f) => (has(f.Schools) ? null : 'addSchoolFirst') },
  { key: 'learners', minutes: 2, count: 'Learners', block: (f) => (has(f.Classes) ? null : 'addClassFirst') },
  {
    key: 'rollCall',
    minutes: 1,
    count: 'RollCalls',
    block: (f) => {
      if (!has(f.Classes)) return has(f.Learners) ? 'addClassFirst' : 'addClassAndLearnersFirst';
      return has(f.Learners) ? null : 'addLearnersFirst';
    },
  },
  { key: 'parentLink', minutes: 1, count: 'ParentLinks', block: (f) => (has(f.Learners) ? null : 'addLearnersFirst') },
];

// The parent-link step exists only once the API sends its count (PA1 is live).
const included = (step, facts) => step.key !== 'parentLink' || Number.isFinite(facts?.ParentLinks);

/** One entry per step: { key, done, minutes, blocked, reason }. A step that is done is never blocked. */
export const buildSteps = (facts) => {
  const safe = facts ?? {};
  return STEPS.filter((step) => included(step, safe)).map((step) => {
    const done = has(safe[step.count]);
    const reason = done ? null : step.block(safe);
    return { key: step.key, done, minutes: step.minutes, blocked: reason !== null, reason };
  });
};

export const progress = (steps) => {
  const open = steps.filter((step) => !step.done);
  return {
    done: steps.length - open.length,
    total: steps.length,
    minutesLeft: open.reduce((sum, step) => sum + step.minutes, 0),
    nextKey: open[0]?.key ?? null,
    allDone: open.length === 0,
  };
};

/** Only the administrator of a Business company sees the card (the API says 403 to everyone else). */
export const shouldShow = (profile) =>
  Boolean(profile && ADMIN_ROLES.includes(profile.role) && profile.userType !== 'Individual' && profile.companyId);

export const hiddenKey = (userId) => `${HIDDEN_KEY_PREFIX}${userId}`;

// Browser storage can be missing or throw (private window, blocked site data): the card then
// simply cannot remember being hidden.
export const isHidden = (storage, userId) => {
  if (!storage || !userId) return false;
  try {
    return storage.getItem(hiddenKey(userId)) === '1';
  } catch {
    return false;
  }
};

export const setHidden = (storage, userId, hidden) => {
  if (!storage || !userId) return;
  try {
    if (hidden) storage.setItem(hiddenKey(userId), '1');
    else storage.removeItem(hiddenKey(userId));
  } catch {
    // Nothing to do: the card is hidden or shown for this visit only.
  }
};
