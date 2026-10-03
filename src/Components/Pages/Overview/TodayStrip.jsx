import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { API_URL } from '../../../config/envConfig';
import { useTranslation } from '../../../i18n/context';
import { findPath, firstLeaf, menuLabel } from './menuUtils';
import TodayClasses from './TodayClasses';

// "Today": the numbers a school admin opens the dashboard for. They come from one call
// (dashboard/overview), counts only. Each card is `ok`, `unavailable` (shown as a dash)
// or `hidden` (not drawn); `Scope` says which cards this person gets. The figures are
// fetched again when the browser tab regains focus, so a roll call saved meanwhile shows up.
const COLORS = { learners: '#10b981', absent: '#14b8a6', seats: '#f97316', myClass: '#10b981' };
const DASH = '–';

const StatCard = ({ label, value, sub, color, link }) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </p>
    <p className="mt-2 truncate text-3xl font-bold text-gray-900">{value}</p>
    {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
    {link && (
      <button type="button" onClick={link.onClick} className="mt-2 text-sm font-semibold hover:underline" style={{ color }}>
        {link.text}
      </button>
    )}
  </div>
);

const SKELETON_CARD = 'h-28 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-900/5';

// The last block stands in for the "Roll call by class" panel, so the page does not jump when it draws.
const Skeleton = () => (
  <div className="mt-6" aria-busy="true">
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className={SKELETON_CARD} />
      ))}
    </div>
    <div className={`mt-4 ${SKELETON_CARD}`} />
  </div>
);

const TodayStrip = ({ menu, onNavigate }) => {
  const { t, lang } = useTranslation();
  // loading | none (nothing to show) | failed | ok
  const [state, setState] = useState({ status: 'loading', data: null });

  // `shared`: on first load, reuse the call the Host's phone home just made (window.__grasfamOverview,
  // 30 s), so opening the phone dashboard sends one request, not two.
  const load = useCallback((signal, shared) => {
    const held = shared ? window.__grasfamOverview : null;
    const reused = held && Date.now() - held.at < 30000;
    (reused
      ? held.promise
      : fetch(`${API_URL}/api/v1/dashboard/overview`, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
          signal,
        }).then(async (response) => ({ status: response.status, data: response.ok ? await response.json() : null }))
    )
      // 403: this person has no strip. Anything else that is not a success: say so, and offer to try again.
      .catch(() => ({ status: 0, data: null }))
      .then(({ status, data }) => {
        if (status === 403) return { status: 'none', data: null };
        if (status < 200 || status >= 300) return { status: 'failed', data: null };
        return data?.Scope === 'company' || data?.Scope === 'homeroom' ? { status: 'ok', data } : { status: 'none', data: null };
      })
      .then((next) => {
        if (!signal?.aborted) setState(next);
      });
  }, []);

  useEffect(() => {
    let controller = new AbortController();
    load(controller.signal, true);
    const refresh = () => {
      controller.abort();
      controller = new AbortController();
      load(controller.signal, false);
    };
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      controller.abort();
    };
  }, [load]);

  const retry = () => {
    setState({ status: 'loading', data: null });
    load(undefined, false);
  };

  if (state.status === 'none') return null;
  if (state.status === 'loading') return <Skeleton />;

  const errorRow = (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-l-4 border-red-400 bg-red-50 px-4 py-3">
      <div>
        <p className="font-semibold text-red-800">{t('overview.todayError')}</p>
        <p className="text-sm text-red-700">{t('overview.todayErrorHint')}</p>
      </div>
      <button type="button" onClick={retry} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100">
        {t('overview.tryAgain')}
      </button>
    </div>
  );

  if (state.status === 'failed') {
    return (
      <>
        <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{t('overview.today')}</h3>
        {errorRow}
      </>
    );
  }

  const { data } = state;
  const date = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // A link to a page of the menu: the menu labels joined with " › ", unless a text is given.
  const linkTo = (names, text) => {
    const path = findPath(menu, names);
    if (!path) return null;
    return { text: text ?? path.map((node) => menuLabel(t, node)).join(' › '), onClick: () => onNavigate(firstLeaf(path[path.length - 1])) };
  };
  const rollCallLink = (done) => linkTo(['Attendance', 'RollCall'], done ? undefined : t('overview.takeRollCall'));

  const cards = [];
  let unavailable = false;
  let classes = null;

  if (data.Scope === 'company') {
    const { Learners: learners, Absent: absent, Seats: seats } = data;
    if (learners.Status !== 'hidden') {
      const ok = learners.Status === 'ok';
      unavailable ||= !ok;
      cards.push(
        <StatCard
          key="learners"
          label={t('overview.learners')}
          value={ok ? learners.Learners : DASH}
          sub={ok ? (learners.Learners === 0 ? t('overview.noLearners') : t(learners.Classes === 1 ? 'overview.classOne' : 'overview.classes', { n: learners.Classes })) : null}
          color={COLORS.learners}
          link={ok ? linkTo(['Academic', 'Records', 'Student'], learners.Learners === 0 ? t('overview.addLearners') : undefined) : null}
        />,
      );
    }
    if (absent.Status !== 'hidden') {
      const ok = absent.Status === 'ok';
      unavailable ||= !ok;
      const done = ok && absent.ClassesDone > 0;
      let sub = null;
      if (done) {
        sub = [
          t('overview.absentBreakdown', { sick: absent.Sick, excused: absent.Excused, unexcused: absent.Unexcused }),
          t(absent.ClassesTotal === 1 ? 'overview.classesDoneOne' : 'overview.classesDone', { done: absent.ClassesDone, total: absent.ClassesTotal }),
        ].join(' · ');
      } else if (ok) {
        sub = t('overview.noRollCall');
      }
      cards.push(
        <StatCard
          key="absent"
          label={t('overview.absentToday')}
          value={done ? absent.Sick + absent.Excused + absent.Unexcused : DASH}
          sub={sub}
          color={COLORS.absent}
          link={ok ? rollCallLink(done) : null}
        />,
      );
      if (ok && absent.ClassesTotal > 0) {
        classes = <TodayClasses absent={absent} link={linkTo(['Attendance', 'RollCall'])} />;
      }
    }
    if (seats.Status !== 'hidden') {
      const ok = seats.Status === 'ok';
      unavailable ||= !ok;
      const used = seats.Max === null ? seats.Used : t('overview.seatsOf', { used: seats.Used, max: seats.Max });
      cards.push(
        <StatCard
          key="seats"
          label={t('overview.seats')}
          value={ok ? used : DASH}
          sub={ok ? [seats.Plan, seats.Max === null ? t('overview.noSeatLimit') : null].filter(Boolean).join(' · ') : null}
          color={COLORS.seats}
          link={ok ? linkTo(['SubscriptionGroup']) : null}
        />,
      );
    }
  } else {
    const home = data.Homeroom;
    const ok = home?.Status === 'ok';
    unavailable ||= !ok;
    let rollCall = t('overview.rollCallNotTaken');
    if (ok && home.RollCallTaken) {
      // An older Dashboard API sends no day counts: keep the plain "taken" text then.
      rollCall = home.Present === undefined
        ? t('overview.rollCallTaken')
        : t('overview.dayBreakdown', { present: home.Present, sick: home.Sick ?? 0, excused: home.Excused ?? 0, unexcused: home.Unexcused ?? 0 });
    }
    cards.push(
      <StatCard
        key="myClass"
        label={t('overview.myClass')}
        value={ok ? home.ClassName : DASH}
        sub={ok ? `${t(home.Learners === 1 ? 'overview.classLearnerOne' : 'overview.classLearners', { n: home.Learners })} · ${rollCall}` : null}
        color={COLORS.myClass}
        link={ok ? rollCallLink(home.RollCallTaken) : null}
      />,
      <StatCard
        key="absent"
        label={t('overview.absentToday')}
        value={ok && home.RollCallTaken ? home.Absent : DASH}
        sub={ok ? t('overview.yourClassOnly') : null}
        color={COLORS.absent}
      />,
    );
  }

  return (
    <>
      <h3 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {t('overview.today')} · <span className="font-normal normal-case">{date}</span>
      </h3>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{cards}</div>
      {classes}
      {unavailable && errorRow}
    </>
  );
};

export default TodayStrip;
