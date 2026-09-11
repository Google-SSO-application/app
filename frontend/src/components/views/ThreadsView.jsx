export default function ThreadsView({ threads, openAsk }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-[clamp(20px,2.6vw,26px)] font-bold tracking-[-.02em]">Threads</div>
        <div className="text-[13px] text-white/[0.55]">Ask the team — accepted answers become searchable docs.</div>
        <div className="flex-1" />
        <button
          onClick={openAsk}
          className="h-[38px] rounded-xl border border-white/20 bg-gradient-to-br from-white/20 to-white/[0.07] px-4 text-[13px] font-semibold text-inherit"
        >
          ＋ Ask a question
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
        {threads.map((t) => (
          <div
            key={t.id}
            onClick={t.open}
            className="cursor-pointer rounded-[22px] border border-white/[0.13] bg-gradient-to-br from-white/[0.11] to-white/[0.045] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,.26),0_18px_44px_rgba(0,0,0,.36)] backdrop-blur-[26px] backdrop-saturate-[1.7] transition-[transform,background] duration-[180ms] ease-in-out hover:-translate-y-[3px] hover:bg-white/[0.14]"
          >
            <div className="flex items-center gap-2">
              <span className={t.badgeClassName}>{t.badge}</span>
              <span className="font-mono text-[11px] text-white/45">{t.project}</span>
            </div>
            <div className="mt-2.5 text-base font-semibold leading-[1.35] tracking-[-.01em] [text-wrap:pretty]">{t.q}</div>
            <div className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-white/60">{t.preview}</div>
            <div className="mt-3.5 flex items-center gap-2 font-mono text-[11.5px] text-white/50">{t.meta}</div>
          </div>
        ))}
      </div>
    </>
  );
}
