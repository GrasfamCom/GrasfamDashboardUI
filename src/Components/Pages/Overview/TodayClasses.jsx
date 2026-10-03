import { useTranslation } from '../../../i18n/context';

// "Roll call by class": one line per class of the company, from the Absent card's `Classes`
// (counts and class names only). Classes not called yet come first, each group by class name.
// Below md each line stacks (name + pill, then four labelled numbers); from md up it is a table.
const DASH = '–';
const COUNTS = [
  ['Present', 'overview.colPresent', 'text-green-700'],
  ['Sick', 'overview.colSick', 'text-sky-700'],
  ['Excused', 'overview.colExcused', 'text-indigo-700'],
  ['Unexcused', 'overview.colUnexcused', 'text-red-700'],
];
const COLS = 'grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 md:grid-cols-[minmax(0,1fr)_6rem_repeat(4,6rem)]';
const ROW = `grid ${COLS} w-full px-4 py-3 text-left`;
const LINK_ROW = `${ROW} hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600`;

const byCalledThenName = (a, b) =>
  Number(Boolean(a.RollCallTaken)) - Number(Boolean(b.RollCallTaken)) ||
  String(a.Class ?? '').localeCompare(String(b.Class ?? ''), undefined, { numeric: true });

const TodayClasses = ({ absent, link }) => {
  const { t } = useTranslation();
  const classes = [...(absent.Classes ?? [])].sort(byCalledThenName);
  const more = absent.MoreClasses ?? 0;
  if (classes.length === 0 && more === 0) return null;

  const notYet = Math.max(0, absent.ClassesTotal - absent.ClassesDone);
  const notYetText = t('overview.notYet');

  const line = (row, index) => {
    const taken = Boolean(row.RollCallTaken);
    const content = (
      <>
        <span className="truncate font-medium text-gray-900">{row.Class}</span>
        <span
          className={`justify-self-end rounded-full px-2.5 py-0.5 text-xs font-semibold md:justify-self-start ${
            taken ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {taken ? t('overview.done') : notYetText}
        </span>
        <span className="col-span-2 flex flex-wrap gap-x-4 text-sm md:contents">
          {COUNTS.map(([field, label, color], i) => {
            if (!taken) {
              // Not called: one dash below md, a dash per column from md up; only the first is announced.
              return i === 0 ? (
                <span key={field} role="img" aria-label={notYetText} className="text-gray-500 md:text-right">
                  {DASH}
                </span>
              ) : (
                <span key={field} aria-hidden="true" className="hidden text-right text-gray-500 md:block">
                  {DASH}
                </span>
              );
            }
            return (
              <span key={field} className="tabular-nums md:text-right">
                <span className="text-gray-500 md:sr-only">{t(label)} </span>
                <span className={`font-semibold ${color}`}>{row[field] ?? DASH}</span>
              </span>
            );
          })}
        </span>
      </>
    );
    const key = `${row.Class}-${index}`;
    return (
      <li key={key}>
        {link ? (
          <button type="button" onClick={link.onClick} className={LINK_ROW}>
            {content}
          </button>
        ) : (
          <div className={ROW}>{content}</div>
        )}
      </li>
    );
  };

  return (
    <section className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5" aria-labelledby="today-classes-title">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 pb-3">
        <h4 id="today-classes-title" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {t('overview.byClass')}
        </h4>
        <p className="text-sm text-gray-500">{notYet > 0 ? t('overview.notYetCount', { n: notYet }) : t('overview.allCalled')}</p>
      </div>
      <div className={`hidden ${COLS} border-y border-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid`} aria-hidden="true">
        <span />
        <span />
        {COUNTS.map(([field, label]) => (
          <span key={field} className="text-right">
            {t(label)}
          </span>
        ))}
      </div>
      <ul className="divide-y divide-gray-100 border-t border-gray-100 md:border-t-0">{classes.map(line)}</ul>
      {more > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 text-sm">
          {link ? (
            <button
              type="button"
              onClick={link.onClick}
              className="rounded font-semibold text-emerald-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              {t('overview.moreClasses', { n: more })}
            </button>
          ) : (
            <span className="text-gray-500">{t('overview.moreClasses', { n: more })}</span>
          )}
        </div>
      )}
    </section>
  );
};

export default TodayClasses;
