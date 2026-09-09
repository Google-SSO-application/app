const SUGGESTION_CLASS =
  "h-8 rounded-[11px] border border-white/[0.14] bg-white/[0.07] px-3.5 text-[12.5px] text-white/[0.85] transition-colors hover:bg-white/[0.15]";

const TYPE_PILL_ACTIVE =
  "h-8 rounded-xl px-3.5 text-xs font-semibold border border-white/[0.28] bg-gradient-to-br from-white/[0.26] to-white/10 text-white";
const TYPE_PILL_INACTIVE =
  "h-8 rounded-xl px-3.5 text-xs font-semibold border border-white/[0.12] bg-white/[0.06] text-white/75";

const STATUS_PILL_ACTIVE =
  "h-8 rounded-xl px-3.5 text-xs font-semibold border border-[#a9b4ff]/40 bg-[#a9b4ff]/[0.22] text-[#dfe3ff]";
const STATUS_PILL_INACTIVE =
  "h-8 rounded-xl px-3.5 text-xs font-semibold border border-white/10 bg-white/5 text-white/[0.62]";

export default function SearchView({
  heroTitle, heroSub, suggestions,
  typeFilters, statusFilters,
  resultCount, project,
  results,
}) {
  return (
    <>
      {/* Hero / search prompt card */}
      <div className="relative overflow-hidden rounded-[26px] border border-white/[0.14] bg-gradient-to-br from-white/[0.13] to-white/[0.045] p-[clamp(18px,2.6vw,30px)] shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_24px_60px_rgba(0,0,0,.42)] backdrop-blur-[30px] backdrop-saturate-[1.8]">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-2/5 animate-sheen bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
        <div className="text-[clamp(22px,3vw,32px)] font-bold tracking-[-.03em]">{heroTitle}</div>
        <div className="mt-2 text-sm text-white/[0.62]">{heroSub}</div>
        <div className="mt-[18px] flex flex-wrap gap-2">
          {suggestions.map((sg, i) => (
            <button key={i} onClick={sg.go} className={SUGGESTION_CLASS}>
              {sg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {typeFilters.map((t) => (
          <button key={t.label} onClick={t.toggle} className={t.active ? TYPE_PILL_ACTIVE : TYPE_PILL_INACTIVE}>
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        {statusFilters.map((f) => (
          <button key={f.label} onClick={f.pick} className={f.active ? STATUS_PILL_ACTIVE : STATUS_PILL_INACTIVE}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      <div className="flex items-baseline gap-2.5 px-1">
        <div className="text-[13px] text-white/60">
          {resultCount} results in <strong className="text-[#eef0ff]">{project}</strong>
        </div>
      </div>

      {/* Result cards */}
      <div className="flex flex-col gap-2.5">
        {results.map((r) => (
          <div
            key={r.id}
            onClick={r.open}
            className="flex cursor-pointer gap-3.5 rounded-[20px] border border-white/[0.12] bg-gradient-to-br from-white/10 to-white/[0.04] px-[18px] py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.24),0_16px_40px_rgba(0,0,0,.3)] backdrop-blur-2xl backdrop-saturate-[1.7] transition-[transform,background] duration-[180ms] ease-in-out hover:-translate-y-0.5 hover:bg-white/[0.13]"
          >
            <div className="grid h-11 w-11 flex-none place-items-center rounded-2xl border border-white/[0.14] bg-white/[0.09] text-base">
              {r.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-[9px]">
                <div className="text-[15.5px] font-semibold tracking-[-.01em]">{r.title}</div>
                <span className={r.badgeClassName}>{r.badge}</span>
              </div>
              <div className="mt-[5px] line-clamp-2 text-[13.5px] leading-[1.55] text-white/[0.62] [text-wrap:pretty]">
                {r.excerpt}
              </div>
              {r.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.tags.map((tag) => (
                    <span key={tag} className="rounded-lg border border-[#a9b4ff]/25 bg-[#a9b4ff]/[0.12] px-2 py-[3px] text-[11px] font-semibold text-[#dfe3ff]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-[9px] flex flex-wrap gap-2 font-mono text-[11.5px] text-white/50">
                <span>{r.type}</span><span>·</span><span>{r.project}</span><span>·</span><span>{r.meta}</span>
              </div>
            </div>
            <div className="flex-none self-center text-[15px] opacity-40">›</div>
          </div>
        ))}
      </div>
    </>
  );
}
