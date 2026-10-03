import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { API_URL } from '../../../config/envConfig';
import { useTranslation } from '../../../i18n/context';
import FirstWeekChecklist from './FirstWeekChecklist';

// The desktop twin of the host's mobile home (MobileHome.jsx): subscriptions, module
// tiles and the recently opened pages. Colours and the recent list are the host's own
// (mobileTheme.js), so both shells look and behave alike. No greeting, by owner rule.
const BRAND_GRADIENT = 'linear-gradient(135deg,#009dff 0%,#34f4f4 100%)';
const MODULE_COLORS = {
  Dashboard: '#0ea5e9',
  Quiz: '#8b5cf6',
  Academic: '#10b981',
  Tools: '#f59e0b',
  AI: '#ec4899',
  PoS: '#6366f1',
  Religion: '#059669',
  Subscription: '#f97316',
  SubscriptionGroup: '#f97316',
  Attendance: '#14b8a6',
  Account: '#64748b',
};
const HIDDEN = ['Dashboard', 'Account'];
const RECENT_KEY = 'mobileRecent';

const moduleColor = (path) => MODULE_COLORS[path.split('/').filter(Boolean)[0]] || '#0ea5e9';
const tint = (hex) => `${hex}1f`;
// "Quiz" -> "Qu", "Subscription Group" -> "SG": two letters, as in the design.
const initials = (text) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 1) return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  const [first = '', second = ''] = Array.from(words[0] || '');
  return first.toUpperCase() + second.toLowerCase();
};

const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
};

/** The login menu from localStorage, as a tree of `{ name, label, path, children }`. */
const readMenuTree = () => {
  let items = [];
  try {
    items = decodeURIComponent(localStorage.getItem('menu') || '')
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => JSON.parse(item));
  } catch {
    return [];
  }
  const build = (parentId, parentPath) =>
    items
      .filter((item) => (item.ParentMenuId || null) === parentId)
      .sort((a, b) => a.SequenceNo - b.SequenceNo)
      .map((item) => {
        const path = `${parentPath}/${item.MenuName}`;
        return { name: item.MenuName, label: item.MenuDesc || item.MenuName, path, children: build(item.Id, path) };
      });
  return build(null, '');
};

const firstLeaf = (node) => (node.children.length ? firstLeaf(node.children[0]) : node.path);

/** Moves the host to another page; a remote cannot use the host's router. */
const navigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const Overview = () => {
  const { t, lang } = useTranslation();
  const [subscriptions, setSubscriptions] = useState(null);
  const fullMenu = readMenuTree();
  const modules = fullMenu.filter((node) => !HIDDEN.includes(node.name));
  const subscriptionGroup = modules.find((node) => node.name === 'SubscriptionGroup');
  const recent = readRecent();
  const signedIn = Boolean(Cookies.get('token'));

  useEffect(() => {
    if (!signedIn) return undefined;
    const controller = new AbortController();
    fetch(`${API_URL}/api/v1/host/subscription/my-subscriptions`, {
      headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then((body) => setSubscriptions((body.data || []).filter((s) => String(s.Status).toLowerCase() === 'active')))
      .catch(() => {
        if (!controller.signal.aborted) setSubscriptions([]);
      });
    return () => controller.abort();
  }, [signedIn]);

  const moduleLabel = (node) => {
    const key = `menu.${node.name}`;
    const text = t(key);
    return text === key ? node.label : text;
  };
  const endDate = (s) =>
    s.EndDate && !s.IsLifetime && !s.EndDate.startsWith('9999')
      ? new Date(s.EndDate).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB')
      : null;

  return (
    <div className="relative">
      <h6 className="text-2xl font-semibold text-center">{t('overview.title')}</h6>

      {signedIn && <FirstWeekChecklist menu={fullMenu} onNavigate={navigate} firstLeaf={firstLeaf} />}

      {signedIn && (
      <div className="mt-6 rounded-2xl text-white p-5 shadow-lg" style={{ background: BRAND_GRADIENT }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide opacity-80">{t('overview.subscription')}</p>
            {subscriptions === null ? (
              <p className="mt-1 h-6 w-48 rounded bg-white/30 animate-pulse" />
            ) : subscriptions.length === 0 ? (
              <p className="text-lg font-bold">{t('overview.noSubscription')}</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {subscriptions.map((s) => (
                  <li key={s.Id} className="flex flex-wrap items-baseline gap-x-3">
                    <span className="text-lg font-bold">{`${s.PlanName} · ${s.Status}`}</span>
                    {endDate(s) && <span className="text-sm opacity-90">{t('overview.renews', { date: endDate(s) })}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {subscriptionGroup && (
            <button
              type="button"
              onClick={() => navigate(firstLeaf(subscriptionGroup))}
              className="shrink-0 bg-white/25 hover:bg-white/35 px-4 py-1.5 rounded-full text-sm font-semibold"
            >
              {t('overview.manage')}
            </button>
          )}
        </div>
      </div>
      )}

      <h3 className="mt-6 mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('overview.modules')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {modules.map((node) => {
          const color = moduleColor(node.path);
          return (
            <button
              key={node.path}
              type="button"
              onClick={() => navigate(firstLeaf(node))}
              className="bg-white rounded-2xl p-4 text-left shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition"
            >
              <span
                className="inline-flex items-center justify-center w-11 h-11 rounded-2xl text-sm font-bold"
                style={{ background: tint(color), color }}
              >
                {initials(moduleLabel(node))}
              </span>
              <p className="mt-3 font-semibold text-gray-900">{moduleLabel(node)}</p>
              {node.children.length > 0 && (
                <p className="text-xs text-gray-400">{t(node.children.length === 1 ? 'overview.section' : 'overview.sections', { count: node.children.length })}</p>
              )}
            </button>
          );
        })}
      </div>

      {recent.length > 0 && (
        <>
          <h3 className="mt-6 mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('overview.recent')}</h3>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
            {recent.map((entry) => {
              const color = moduleColor(entry.path);
              return (
                <button
                  key={entry.path}
                  type="button"
                  onClick={() => navigate(entry.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: tint(color), color }}
                  >
                    {initials(entry.label)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-gray-800 truncate">{entry.label}</span>
                    <span className="block text-xs text-gray-400">{entry.path.split('/').filter(Boolean)[0]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
