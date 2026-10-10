// Which modules a person reaches without a plan of their own, and why. "Free" is the
// free-for-all plan, the same switch the Subscription page reads; no second flag.
const NO_OWN_PLAN_SOURCES = ['Company', 'Free'];

export const coveredEntries = (codes, answers) =>
  codes.flatMap((code, index) => {
    // The access answer is wrapped: { data: { HasAccess, Source, ... } }.
    const body = answers[index]?.status === 'fulfilled' ? answers[index].value : null;
    const access = body?.data ?? body;
    return access?.HasAccess && NO_OWN_PLAN_SOURCES.includes(access.Source) ? [{ code, source: access.Source }] : [];
  });

// True when the person reaches modules only through the free-for-all plan (no company cover).
export const isAllFree = (entries) => entries.length > 0 && entries.every((entry) => entry.source === 'Free');
