export const BADGE_MAP = {
  current:  ["#5fe3a1", "rgba(95,227,161,.14)",  "Current"],
  outdated: ["#ffb058", "rgba(255,176,88,.16)",   "Outdated"],
  review:   ["#a9b4ff", "rgba(169,180,255,.16)",  "In review"],
  answered: ["#5fe3a1", "rgba(95,227,161,.14)",   "Answered"],
  open:     ["#ffb058", "rgba(255,176,88,.16)",   "Open"],
};

export function badge(status) {
  const [fg, bg, label] = BADGE_MAP[status] || BADGE_MAP.current;
  return {
    style: `display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:8px;font-size:11px;font-weight:600;letter-spacing:.02em;color:${fg};background:${bg};border:1px solid ${fg}33`,
    label,
  };
}
