export default function SourcesView({ sources, openUpload }) {
  return (
    <>
      <div className="text-[clamp(20px,2.6vw,26px)] font-bold tracking-[-.02em]">Sources</div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
        {sources.map((src) => (
          <div
            key={src.name}
            className="rounded-[22px] border border-white/[0.13] bg-gradient-to-br from-white/[0.11] to-white/[0.045] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,.26)] backdrop-blur-[26px] backdrop-saturate-[1.7]"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[13px] border border-white/[0.14] bg-white/[0.09] text-[15px]">
                {src.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] font-semibold">{src.name}</div>
                <div className="text-xs text-white/[0.55]">{src.detail}</div>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#5fe3a1] shadow-[0_0_10px_#5fe3a1]" />
            </div>
            <div className="mt-3.5 flex gap-2">
              <button onClick={src.act} className="h-[34px] flex-1 rounded-xl border border-white/[0.18] bg-white/[0.09] text-[12.5px] font-semibold text-inherit">
                {src.action}
              </button>
            </div>
          </div>
        ))}

        {/* Upload drop zone */}
        <div
          onClick={openUpload}
          className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-white/[0.22] bg-white/[0.03] p-[18px] text-center transition-colors hover:bg-white/[0.08]"
        >
          <div className="text-[22px]">⤒</div>
          <div className="text-sm font-semibold">Upload documents</div>
          <div className="max-w-[220px] text-xs text-white/[0.55]">Drop PDFs, READMEs or Markdown — we index the text and tag the project.</div>
        </div>
      </div>
    </>
  );
}
