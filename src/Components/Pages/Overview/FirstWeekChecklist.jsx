import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { API_URL } from '../../../config/envConfig';
import { useTranslation } from '../../../i18n/context';

const ADMIN_ROLES = ['Super Admin', 'Administrator'];

const get = async (path, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}${path}${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${Cookies.get('token')}` },
  });
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
};

// The list behind a response, whichever casing the API used; only its length matters.
const rowsOf = (body) => (Array.isArray(body) ? body : body?.data || body?.Data || []);

const findNode = (nodes, names) => {
  const node = nodes.find((candidate) => candidate.name === names[0]);
  if (!node) return null;
  return names.length === 1 ? node : findNode(node.children, names.slice(1));
};

// Each step needs its page in the menu (= the module is subscribed, or the role may use it)
// and a question the existing APIs can answer. `isDone` reads the rows the API returned.
const STEPS = [
  {
    key: 'Teachers',
    menu: ['Account', 'TeamMembers'],
    done: () => get('/api/v1/host/team/members'),
    // The admin is the first member: a second person means the team has started.
    isDone: (rows) => rows.length > 1,
  },
  {
    key: 'Learners',
    menu: ['Academic', 'Records', 'Student'],
    done: () => get('/api/v1/academic/student', { Page: 1, PerPage: 1 }),
    isDone: (rows) => rows.length > 0,
  },
  {
    key: 'RollCall',
    menu: ['Attendance', 'RollCall'],
    done: () => get('/api/v1/attendance/rollcall/records', { page: 1, perPage: 1 }),
    isDone: (rows) => rows.length > 0,
  },
];

/**
 * First-week checklist for a new company's admins. Renders nothing for other roles, while
 * loading, when a request fails, or once every step is done.
 */
const FirstWeekChecklist = ({ menu, onNavigate, firstLeaf }) => {
  const { t } = useTranslation();
  const [steps, setSteps] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const available = STEPS.map((step) => ({ ...step, node: findNode(menu, step.menu) })).filter((step) => step.node);
    if (available.length === 0) return undefined;
    get('/api/v1/host/account/profile')
      .then(async (profile) => {
        if (!ADMIN_ROLES.includes(profile?.role)) return [];
        // A step whose question cannot be answered (a role the API refuses) is left out, not shown wrong.
        const answers = await Promise.allSettled(available.map((step) => step.done()));
        return available
          .map((step, index) => ({ ...step, answer: answers[index] }))
          .filter((step) => step.answer.status === 'fulfilled')
          .map((step) => ({ ...step, complete: step.isDone(rowsOf(step.answer.value)) }));
      })
      .catch(() => [])
      .then((result) => {
        if (!cancelled) setSteps(result);
      });
    return () => {
      cancelled = true;
    };
    // The menu is read once per page load, like the rest of the Overview.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!steps || steps.length === 0 || steps.every((step) => step.complete)) return null;
  const doneCount = steps.filter((step) => step.complete).length;

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-semibold text-gray-900">{t('overview.checklistTitle')}</h3>
        <span className="text-sm text-gray-500">
          {t('overview.checklistDone', { n: doneCount, total: steps.length })}
        </span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-gray-100" role="presentation">
        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      <ul className="mt-4 space-y-3">
        {steps.map((step) => (
          <li key={step.key} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                step.complete ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300'
              }`}
            >
              {step.complete && (
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 6.5l2.5 2.5L10 3.5" />
                </svg>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`font-medium ${step.complete ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {t(`overview.step${step.key}`)}
              </p>
              {!step.complete && <p className="text-sm text-gray-500">{t(`overview.step${step.key}Hint`)}</p>}
            </div>
            {!step.complete && (
              <button
                type="button"
                onClick={() => onNavigate(firstLeaf(step.node))}
                className="shrink-0 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-100"
              >
                {t('overview.stepOpen')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FirstWeekChecklist;
