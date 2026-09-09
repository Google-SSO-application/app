export default function DocPanel({ docV, closePanel, toggleOutdated }) {
  const outdatedLabel = docV.isOutdated ? "Restore as current" : "Mark as outdated";
  const outdatedClass = docV.isOutdated
    ? "border-[#5fe3a1]/40 bg-[#5fe3a1]/[0.16] text-[#8ff0c0]"
    : "border-[#ffb058]/40 bg-[#ffb058]/[0.16] text-[#ffcf94]";

  return (
    <>
      <div onClick={closePanel} className="fixed inset-0 z-40 bg-[#04050c]/[0.55] backdrop-blur-[6px]" />
      <div className="fixed bottom-0 right-0 top-0 z-[41] w-[min(560px,100%)] overflow-y-auto border-l border-white/[0.14] bg-gradient-to-b from-[#16182c]/[0.9] to-[#0c0d1a]/[0.92] p-[clamp(18px,3vw,30px)] shadow-[-30px_0_80px_rgba(0,0,0,.6)] backdrop-blur-[34px] backdrop-saturate-[1.8]">

        {/* Header row */}
        <div className="flex items-center gap-2.5">
          <span className={docV.badgeClassName}>{docV.badge}</span>
          <span className="font-mono text-[11.5px] text-white/50">{docV.type} · {docV.project}</span>
          <div className="flex-1" />
          <button onClick={closePanel} className="h-[34px] w-[34px] rounded-[11px] border border-white/[0.16] bg-white/[0.08] text-inherit">✕</button>
        </div>

        <div className="mt-4 text-[clamp(20px,3vw,26px)] font-bold leading-[1.25] tracking-[-.025em] [text-wrap:pretty]">{docV.title}</div>
        <div className="mt-2.5 text-[13.5px] leading-[1.65] text-white/[0.66] [text-wrap:pretty]">{docV.excerpt}</div>

        {docV.isOutdated && (
          <div className="mt-4 rounded-2xl border border-[#ffb058]/[0.35] bg-gradient-to-br from-[#ffb058]/[0.22] to-white/[0.04] px-4 py-3.5 text-[13px] leading-[1.55]">
            <strong>Marked outdated</strong> by Priya M. — superseded by v{docV.version} of the platform runbook.
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-[18px] flex flex-wrap gap-2">
          <button onClick={toggleOutdated} className={`h-[38px] rounded-xl border px-[15px] text-[13px] font-semibold ${outdatedClass}`}>
            {outdatedLabel}
          </button>
          <button className="h-[38px] rounded-xl border border-white/[0.18] bg-white/[0.08] px-[15px] text-[13px] font-semibold text-inherit">Open source</button>
          <button className="h-[38px] rounded-xl border border-white/[0.18] bg-white/[0.08] px-[15px] text-[13px] font-semibold text-inherit">Ask about this</button>
        </div>

        {/* Version history */}
        <div className="mt-[26px] text-[11px] uppercase tracking-[.12em] text-white/[0.42]">Version history</div>
        <div className="mt-3 flex flex-col gap-2">
          {docV.versions.map((v, i) => (
            <div key={i} className="flex gap-3 rounded-2xl border border-white/[0.11] bg-white/[0.06] px-[15px] py-[13px]">
              <div className="flex-none font-mono text-[12.5px] text-[#a9b4ff]">{v.v}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] leading-[1.5]">{v.note}</div>
                <div className="mt-1 font-mono text-[11.5px] text-white/45">{v.who} · {v.date}</div>
              </div>
              <div className="self-center text-[11.5px] text-white/50">{v.tag}</div>
            </div>
          ))}
        </div>

        {/* Linked threads */}
        <div className="mt-[26px] text-[11px] uppercase tracking-[.12em] text-white/[0.42]">Linked threads</div>
        <div className="mt-3 flex flex-col gap-2">
          {docV.links.map((l, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.11] bg-white/[0.06] px-[15px] py-[13px] text-[13.5px] leading-[1.5]">
              {l.q}
              <div className="mt-1 font-mono text-[11.5px] text-white/45">{l.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
