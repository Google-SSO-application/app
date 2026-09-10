import { useState } from "react";
import FileViewerPanel from "../panels/FileViewerPanel.jsx";
import DocumentResultCard from "../common/DocumentResultCard.jsx";

const SUGGESTION_CLASS = "h-8 rounded-[11px] border border-white/[0.14] bg-white/[0.07] px-3.5 text-[12.5px] text-white/[0.85] transition-colors hover:bg-white/[0.15]";
const TYPE_PILL_ACTIVE = "h-8 rounded-xl px-3.5 text-xs font-semibold border border-white/[0.28] bg-gradient-to-br from-white/[0.26] to-white/10 text-white";
const TYPE_PILL_INACTIVE = "h-8 rounded-xl px-3.5 text-xs font-semibold border border-white/[0.12] bg-white/[0.06] text-white/75";
const STATUS_PILL_ACTIVE = "h-8 rounded-xl px-3.5 text-xs font-semibold border border-[#a9b4ff]/40 bg-[#a9b4ff]/[0.22] text-[#dfe3ff]";
const STATUS_PILL_INACTIVE = "h-8 rounded-xl px-3.5 text-xs font-semibold border border-white/10 bg-white/5 text-white/[0.62]";

export default function SearchView({
  heroTitle, heroSub, suggestions,
  typeFilters, statusFilters,
  resultCount, project,
  results,
  searchLoading, searchError,
}) {
  const [viewingFile, setViewingFile] = useState(null);

  return (
    <>
      <div className="relative overflow-hidden rounded-[26px] border border-white/[0.14] bg-gradient-to-br from-white/[0.13] to-white/[0.045] p-[clamp(18px,2.6vw,30px)] shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_24px_60px_rgba(0,0,0,.42)] backdrop-blur-[30px] backdrop-saturate-[1.8]">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-2/5 animate-sheen bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
        <div className="text-[clamp(22px,3vw,32px)] font-bold tracking-[-.03em]">{heroTitle}</div>
        <div className="mt-2 text-sm text-white/[0.62]">{heroSub}</div>
        <div className="mt-[18px] flex flex-wrap gap-2">
          {suggestions.map((sg, i) => (
            <button key={i} onClick={sg.go} className={SUGGESTION_CLASS}>{sg.label}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {typeFilters.map((t) => (
          <button key={t.label} onClick={t.toggle} className={t.active ? TYPE_PILL_ACTIVE : TYPE_PILL_INACTIVE}>{t.label}</button>
        ))}
        <div className="flex-1" />
        {statusFilters.map((f) => (
          <button key={f.label} onClick={f.pick} className={f.active ? STATUS_PILL_ACTIVE : STATUS_PILL_INACTIVE}>{f.label}</button>
        ))}
      </div>

      <div className="flex items-baseline gap-2.5 px-1">
        <div className="text-[13px] text-white/60">
          {searchLoading ? "Searching…" : `${resultCount} results in`}{" "}
          <strong className="text-[#eef0ff]">{project}</strong>
        </div>
      </div>

      {searchError && (
        <div role="alert" className="rounded-lg border border-[#c42b1c]/40 bg-[#442726] p-3.5 text-[13px] text-[#ff99a4]">
          {searchError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {results.map((doc) => (
          <DocumentResultCard
            key={doc.id}
            doc={doc}
            onView={() => setViewingFile(doc)}
          />
        ))}
      </div>

      {viewingFile && <FileViewerPanel file={viewingFile} onClose={() => setViewingFile(null)} />}
    </>
  );
}