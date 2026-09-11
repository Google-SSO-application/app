export default function ThreadPanel({ threadV, closePanel }) {
  return (
    <>
      <div onClick={closePanel} className="fixed inset-0 z-40 bg-[#04050c]/[0.55] backdrop-blur-[6px]" />
      <div className="fixed bottom-0 right-0 top-0 z-[41] w-[min(560px,100%)] overflow-y-auto border-l border-white/[0.14] bg-gradient-to-b from-[#16182c]/[0.9] to-[#0c0d1a]/[0.92] p-[clamp(18px,3vw,30px)] shadow-[-30px_0_80px_rgba(0,0,0,.6)] backdrop-blur-[34px] backdrop-saturate-[1.8]">

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <span className={threadV.badgeClassName}>{threadV.badge}</span>
          <span className="font-mono text-[11.5px] text-white/50">Thread · {threadV.project}</span>
          <div className="flex-1" />
          <button onClick={closePanel} className="h-[34px] w-[34px] rounded-[11px] border border-white/[0.16] bg-white/[0.08] text-inherit">✕</button>
        </div>

        <div className="mt-4 text-[clamp(19px,3vw,25px)] font-bold leading-[1.3] tracking-[-.025em] [text-wrap:pretty]">{threadV.q}</div>
        <div className="mt-2 font-mono text-[11.5px] text-white/45">{threadV.meta}</div>
        <div className="mt-3.5 text-[13.5px] leading-[1.65] text-white/[0.66] [text-wrap:pretty]">{threadV.body}</div>

        {/* Accepted answer */}
        {threadV.answer && (
          <div className="mt-[22px] rounded-[20px] border border-[#5fe3a1]/[0.32] bg-gradient-to-br from-[#5fe3a1]/[0.16] to-white/[0.04] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,.24)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8ff0c0]">✓ Accepted answer</div>
            <div className="mt-2.5 text-sm leading-[1.65] [text-wrap:pretty]">{threadV.answer}</div>
            <div className="mt-3 font-mono text-[11.5px] text-white/50">{threadV.answerMeta}</div>
          </div>
        )}

        {/* Replies */}
        <div className="mt-5 flex flex-col gap-2">
          {threadV.replies.map((rp, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.11] bg-white/[0.06] px-4 py-[14px]">
              <div className="text-[13.5px] leading-[1.6] text-white/80">{rp.body}</div>
              <div className="mt-1.5 font-mono text-[11.5px] text-white/45">{rp.who}</div>
            </div>
          ))}
        </div>

        {/* Reply composer */}
        <div className="mt-[18px] flex items-center gap-2">
          <input
            placeholder="Write an answer…"
            className="h-11 flex-1 rounded-2xl border border-white/[0.14] bg-white/[0.07] px-4 text-[13.5px] text-[#eef0ff] outline-none transition-colors focus:border-[#a9b4ff]/[0.55]"
          />
          <button className="h-11 rounded-2xl border border-white/[0.22] bg-gradient-to-br from-white/90 to-white/70 px-[18px] text-[13.5px] font-semibold text-[#12142a]">
            Post
          </button>
        </div>
      </div>
    </>
  );
}
