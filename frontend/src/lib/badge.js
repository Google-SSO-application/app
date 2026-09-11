const BASE =
  "inline-flex items-center h-[22px] px-[9px] rounded-lg text-[11px] font-semibold tracking-[.02em] border";

export const BADGE_MAP = {
  current: {
    label: "Current",
    className: `${BASE} text-[#5fe3a1] bg-[#5fe3a1]/[0.14] border-[#5fe3a1]/20`,
  },
  outdated: {
    label: "Outdated",
    className: `${BASE} text-[#ffb058] bg-[#ffb058]/[0.16] border-[#ffb058]/20`,
  },
  review: {
    label: "In review",
    className: `${BASE} text-[#a9b4ff] bg-[#a9b4ff]/[0.16] border-[#a9b4ff]/20`,
  },
  answered: {
    label: "Answered",
    className: `${BASE} text-[#5fe3a1] bg-[#5fe3a1]/[0.14] border-[#5fe3a1]/20`,
  },
  open: {
    label: "Open",
    className: `${BASE} text-[#ffb058] bg-[#ffb058]/[0.16] border-[#ffb058]/20`,
  },
};

export function badge(status) {
  const entry = BADGE_MAP[status] || BADGE_MAP.current;
  return { className: entry.className, label: entry.label };
}
