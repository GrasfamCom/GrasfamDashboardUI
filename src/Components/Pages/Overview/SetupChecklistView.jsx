import { useTranslation } from '../../../i18n/context';
import { evidenceOf, showsOpenButton } from './setupRules';

// The pieces of the "Set up your school" card that only draw. State and data live in SetupChecklist.jsx.

const STEP_TEXT = { school: 'school', classes: 'class', learners: 'learn', rollCall: 'roll', parentLink: 'link' };
const REASON_KEY = {
  addSchoolFirst: 'checklist.step.class.block',
  addClassFirst: 'checklist.step.learn.block',
  addClassAndLearnersFirst: 'checklist.step.roll.block',
  addLearnersFirst: 'checklist.step.link.block',
};
const CARD = 'mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5';

const Tick = ({ done }) => (
  <span
    aria-hidden="true"
    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
      done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300'
    }`}
  >
    {done && (
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 6.5l2.5 2.5L10 3.5" />
      </svg>
    )}
  </span>
);

export const SetupSkeleton = () => <div className={`${CARD} h-56 animate-pulse bg-white/70`} aria-busy="true" />;

export const SetupError = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <div role="alert" className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-red-50 p-4 text-red-800">
      <div>
        <p className="font-semibold">{t('checklist.loadFailed')}</p>
        <p className="text-sm">{t('checklist.loadFailedBody')}</p>
      </div>
      <button type="button" onClick={onRetry} className="shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100">
        {t('overview.tryAgain')}
      </button>
    </div>
  );
};

/** Shown in place of the card after Hide (with Undo), and later as a quiet "Show" button. */
export const SetupHiddenBar = ({ justHidden, onUndo, onShow }) => {
  const { t } = useTranslation();
  if (justHidden) {
    return (
      <div role="status" className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
        <span>
          {t('checklist.hidden')} <span className="text-gray-500">{t('checklist.hiddenHint')}</span>
        </span>
        <button type="button" onClick={onUndo} className="shrink-0 font-semibold text-sky-700 hover:underline">
          {t('checklist.undo')}
        </button>
      </div>
    );
  }
  return (
    <div className="mt-4 text-right">
      <button type="button" onClick={onShow} className="text-sm font-semibold text-sky-700 hover:underline">
        {t('checklist.show')}
      </button>
    </div>
  );
};

export const SetupDone = ({ onHide }) => {
  const { t } = useTranslation();
  return (
    <div className={`${CARD} flex items-center justify-between gap-4`}>
      <div>
        <p className="font-semibold text-gray-900">{t('checklist.doneTitle')}</p>
        <p className="text-sm text-gray-500">{t('checklist.doneBody')}</p>
      </div>
      <button type="button" onClick={onHide} className="shrink-0 text-sm font-semibold text-gray-600 hover:underline">
        {t('checklist.hide')}
      </button>
    </div>
  );
};

const Row = ({ step, active, node, facts, onOpen }) => {
  const { t } = useTranslation();
  const text = STEP_TEXT[step.key];
  const note = evidenceOf(step, facts);
  const evidence = note && t(`checklist.evidence.${note.name}${note.one ? 'One' : ''}`, { n: note.n });
  const buttonKey = step.key === 'school' ? 'checklist.school.self' : `checklist.step.${text}.btn`;
  return (
    <li className={`flex flex-wrap items-start gap-x-3 gap-y-2 rounded-xl p-2 sm:flex-nowrap ${active ? 'bg-sky-50' : ''}`}>
      <Tick done={step.done} />
      <div className="min-w-0 flex-1 basis-[calc(100%-2rem)] sm:basis-0">
        <p className={`font-medium ${step.done ? 'text-gray-400 line-through' : step.blocked ? 'text-gray-400' : 'text-gray-900'}`}>
          {t(`checklist.step.${text}`)}
          {evidence && <span className="ml-2 text-sm font-normal no-underline text-gray-500">{evidence}</span>}
        </p>
        {!step.done && <p className="text-sm text-gray-500">{t(`checklist.step.${text}.desc`)}</p>}
        {step.blocked && <p className="text-sm font-medium text-gray-500">{t(REASON_KEY[step.reason])}</p>}
      </div>
      {showsOpenButton(step, node) && (
        <button
          type="button"
          onClick={() => onOpen(node)}
          className={`min-h-[44px] w-full shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold sm:min-h-0 sm:w-auto ${
            active ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
          }`}
        >
          {t(buttonKey)}
        </button>
      )}
    </li>
  );
};

export const SetupCard = ({ steps, summary, facts, nodeFor, onOpen, onHide }) => {
  const { t } = useTranslation();
  const progressKey = summary.minutesLeft === 1 ? 'checklist.progressOne' : 'checklist.progress';
  return (
    <section className={CARD} aria-label={t('checklist.title')}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-semibold text-gray-900">{t('checklist.title')}</h3>
        <button type="button" onClick={onHide} className="shrink-0 text-sm font-semibold text-gray-500 hover:underline">
          {t('checklist.hide')}
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {t(progressKey, { n: summary.done, total: summary.total, m: summary.minutesLeft })}
      </p>
      <div className="mt-3 h-1.5 rounded-full bg-gray-100" role="progressbar" aria-valuemin={0} aria-valuemax={summary.total} aria-valuenow={summary.done}>
        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${(summary.done / summary.total) * 100}%` }} />
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <Row key={step.key} step={step} active={step.key === summary.nextKey} node={nodeFor(step.key)} facts={facts} onOpen={onOpen} />
        ))}
      </ul>
      <p className="mt-4 text-sm text-gray-500">{t('checklist.teachersTip')}</p>
    </section>
  );
};
