const CHIP_BASE = "h-8 rounded-xl px-3.5 text-xs font-semibold";
const CHIP_ACTIVE = `${CHIP_BASE} border border-white/30 bg-white/[0.22]`;
const CHIP_INACTIVE = `${CHIP_BASE} border border-white/[0.12] bg-white/[0.06] text-white/[0.72]`;

export default function AskModal({ closePanel, stop, projectChips, target }) {
  return (
    <div onClick={closePanel} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#04050c]/60 p-5 backdrop-blur-[8px]">
      <div onClick={stop} className="w-[min(560px,100%)] max-h-[calc(100vh-40px)] overflow-y-auto rounded-[28px] border border-white/[0.17] bg-gradient-to-br from-white/[0.14] to-white/5 p-[clamp(20px,3vw,30px)] shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_34px_80px_rgba(0,0,0,.6)] backdrop-blur-[34px] backdrop-saturate-[1.8]">

        <div className="text-xl font-bold tracking-[-.02em]">Ask the team</div>
        <div className="mt-1.5 text-[13.5px] text-white/[0.62]">
          Once an answer is accepted, the thread becomes searchable alongside the docs.
        </div>

        <input
          placeholder="Question — e.g. Why do payouts stall at 'pending_capture'?"
          className="mt-[18px] h-[46px] w-full rounded-2xl border border-white/[0.14] bg-white/[0.07] px-4 text-sm text-[#eef0ff] outline-none transition-colors focus:border-[#a9b4ff]/[0.55] focus:bg-white/[0.11]"
        />

        <textarea
          placeholder="Add context: what you tried, error messages, which environment…"
          rows={5}
          className="mt-2.5 w-full resize-y rounded-2xl border border-white/[0.14] bg-white/[0.07] px-4 py-3.5 font-sans text-[13.5px] leading-[1.6] text-[#eef0ff] outline-none transition-colors focus:border-[#a9b4ff]/[0.55] focus:bg-white/[0.11]"
        />

        <div className="mt-4 text-[11px] uppercase tracking-[.12em] text-white/[0.42]">Project</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {projectChips.map((c) => (
            <button key={c.name} onClick={c.pick} className={c.active ? CHIP_ACTIVE : CHIP_INACTIVE}>
              {c.name}
            </button>
          ))}
        </div>

        <input
          placeholder="Tags — payouts, retry, settlement"
          className="mt-3.5 h-[42px] w-full rounded-2xl border border-white/[0.14] bg-white/[0.07] px-4 text-[13.5px] text-[#eef0ff] outline-none transition-colors focus:border-[#a9b4ff]/[0.55]"
        />

        <div className="mt-2.5 flex items-center gap-2.5 text-[12.5px] text-white/60">
          <span className="h-2 w-2 rounded-full bg-[#5fe3a1] shadow-[0_0_8px_#5fe3a1]" />
          3 docs in {target} look related — they'll be suggested to responders.
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <button onClick={closePanel} className="h-[42px] rounded-2xl border border-white/[0.16] bg-white/[0.07] px-[18px] text-[13.5px] font-semibold text-inherit">Cancel</button>
          <button onClick={closePanel} className="h-[42px] rounded-2xl border border-white/[0.22] bg-gradient-to-br from-white/90 to-white/70 px-5 text-[13.5px] font-semibold text-[#12142a]">Post to {target}</button>
        </div>
      </div>
    </div>
  );
}
