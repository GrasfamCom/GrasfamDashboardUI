import { useCallback, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { API_URL } from '../../../config/envConfig';
import { findNode } from './menuUtils';
import { SetupCard, SetupDone, SetupError, SetupHiddenBar, SetupSkeleton } from './SetupChecklistView';
import { buildSteps, isHidden, progress, setHidden, shouldShow } from './setupRules';

const PROFILE_LIFETIME_MS = 30000;
// Where each step's button goes (menu names); a step whose page is not in this person's menu shows no button.
const STEP_PAGES = {
  school: ['Academic', 'Records', 'Academic'],
  classes: ['Academic', 'Records', 'Class'],
  learners: ['Academic', 'Records', 'Student'],
  rollCall: ['Attendance', 'RollCall'],
  parentLink: ['Academic', 'Records', 'Student'],
};

const authorised = (path) =>
  fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${Cookies.get('token')}` } });

/** The profile, reusing the call the Host header just made (window.__grasfamProfile, 30 s). */
const loadProfile = async () => {
  const held = window.__grasfamProfile;
  if (held && Date.now() - held.at < PROFILE_LIFETIME_MS) return held.promise.then(({ data }) => data);
  const response = await authorised('/api/v1/host/account/profile');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

// loading | none (not for this person) | failed | ok. Nothing is ever ticked by guess.
const loadSetup = async () => {
  try {
    const profile = await loadProfile();
    if (!shouldShow(profile)) return { status: 'none' };
    const response = await authorised('/api/v1/dashboard/setup');
    if (response.status === 403) return { status: 'none' };
    if (!response.ok) return { status: 'failed' };
    return { status: 'ok', userId: profile.id, facts: await response.json() };
  } catch {
    return { status: 'failed' };
  }
};

const readStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/**
 * "Set up your school": five steps (four until parent links exist) that tick themselves from real
 * counts. Only a company administrator sees it; it can be hidden, undone and shown again.
 */
const SetupChecklist = ({ menu, onNavigate, firstLeaf }) => {
  const [state, setState] = useState({ status: 'loading' });
  const [hidden, setHiddenState] = useState(false);
  const [justHidden, setJustHidden] = useState(false);

  const load = useCallback(() => {
    setState({ status: 'loading' });
    loadSetup().then((next) => {
      setState(next);
      if (next.status === 'ok') setHiddenState(isHidden(readStorage(), next.userId));
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const steps = useMemo(() => (state.status === 'ok' ? buildSteps(state.facts) : []), [state]);
  const summary = useMemo(() => progress(steps), [steps]);

  const changeHidden = (value) => {
    setHidden(readStorage(), state.userId, value);
    setHiddenState(value);
    setJustHidden(value);
  };

  if (state.status === 'loading') return <SetupSkeleton />;
  if (state.status === 'none') return null;
  if (state.status === 'ok' && steps.length === 0) return null; // the company has none of the modules the steps need
  if (state.status === 'failed') return <SetupError onRetry={load} />;
  if (hidden) {
    if (summary.allDone) return null;
    return <SetupHiddenBar justHidden={justHidden} onUndo={() => changeHidden(false)} onShow={() => changeHidden(false)} />;
  }
  if (summary.allDone) return <SetupDone onHide={() => changeHidden(true)} />;

  return (
    <SetupCard
      steps={steps}
      summary={summary}
      facts={state.facts}
      nodeFor={(key) => findNode(menu, STEP_PAGES[key])}
      onOpen={(node) => onNavigate(firstLeaf(node))}
      onHide={() => changeHidden(true)}
    />
  );
};

export default SetupChecklist;
