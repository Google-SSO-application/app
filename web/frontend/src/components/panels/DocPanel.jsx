import { useState } from "react";
import { FileTypeMark } from "../common/FileTypeIcon.jsx";
import FileViewerPanel from "../panels/FileViewerPanel.jsx";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function statusClass(status) {
  if (status === "published") {
    return "bg-[#0f3321] border border-[#6ccb5f]/40 text-[#8fdc82]";
  }
  return "bg-[#3a2a10] border border-[#ffb84d]/40 text-[#ffcf87]";
}

export default function DocPanel({ docV, closePanel }) {
  const [viewingFile, setViewingFile] = useState(null);

  if (!docV) return null;

  return (
    <>
      {/* Background Mask Shield Overlay */}
      <div onClick={closePanel} className="fixed inset-0 z-40 bg-[#04050c]/[0.55] backdrop-blur-[6px]" />
      
      {/* Slide-out Panel Layer Frame */}
      <div className="fixed bottom-0 right-0 top-0 z-50 w-[min(560px,100%)] overflow-y-auto border-l border-white/[0.14] bg-gradient-to-b from-[#16182c]/[0.9] to-[#0c0d1a]/[0.92] p-[clamp(18px,3vw,30px)] shadow-[-30px_0_80px_rgba(0,0,0,.6)] backdrop-blur-[34px] backdrop-saturate-[1.8]">

        {/* Header row metadata markers */}
        <div className="flex items-center gap-2.5">
          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold border ${statusClass(docV.status)}`}>
            {docV.status || "pending"}
          </span>
          <span className="font-mono text-[11.5px] text-white/50">
            {(docV.fileType || "file").toUpperCase()} · {docV.projectName || "Unassigned"}
          </span>
          <div className="flex-1" />
          <button 
            onClick={closePanel} 
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] border border-white/[0.16] bg-white/[0.08] text-inherit transition-colors hover:bg-white/[0.16]"
          >
            ✕
          </button>
        </div>

        {/* Primary Meta Title & File Indicators Layout Section */}
        <div className="mt-5 flex items-start gap-3.5">
          <div className="grid h-12 w-12 flex-none place-items-center rounded-xl border border-white/[0.1] bg-[#242424]/60 shadow-inner">
            <FileTypeMark fileType={docV.fileType} size={26} />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="text-[clamp(19px,2.6vw,24px)] font-bold leading-[1.25] tracking-[-.025em] text-[#f5f5f5] [text-wrap:pretty]">
              {docV.title || docV.fileName}
            </div>
            <div className="mt-1 truncate font-mono text-[12px] text-white/40">
              {docV.fileName}
            </div>
          </div>
        </div>

        {/* Dynamic Tag Repository Collections Badge Layout Row */}
        {docV.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-b border-white/[0.06] py-3">
            {docV.tags.map((tag) => (
              <span 
                key={tag} 
                className="rounded border border-white/[0.08] bg-white/[0.05] px-2 py-[3px] text-[11px] font-semibold text-white/[0.65]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Lower Metadata Index Staging Specifications Table Container */}
        <div className="mt-[26px] text-[11px] uppercase tracking-[.12em] text-white/[0.42]">
          Document Metadata Properties
        </div>
        
        <div className="mt-3 flex flex-col gap-2 font-sans text-[13px]">
          <div className="flex justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <span className="text-white/40">Project Hub Target</span>
            <span className="font-semibold text-white/85">{docV.projectName || "Unassigned Workspace"}</span>
          </div>
          
          <div className="flex justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <span className="text-white/40">Remote Staging Uploaded Date</span>
            <span className="font-mono text-white/75">{formatDate(docV.createdAt)}</span>
          </div>

          <div className="flex justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <span className="text-white/40">Unique Identity Primary Key</span>
            <span className="font-mono text-[11.5px] text-white/50 truncate max-w-[240px]" title={docV.id}>
              {docV.id}
            </span>
          </div>
        </div>

        {/* Action button controls layout footer tier bar */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/[0.08] pt-5">
          <button 
            type="button"
            onClick={() => setViewingFile(docV)}
            className="h-[38px] rounded-xl border border-white/[0.18] bg-white/[0.08] px-[18px] text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.16]"
          >
            Open Source Document File
          </button>
          
          <button 
            type="button"
            className="h-[38px] rounded-xl border border-[#4cc2ff]/40 bg-[#4cc2ff]/10 px-[18px] text-[13px] font-semibold text-[#8fd8ff] transition-colors hover:bg-[#4cc2ff]/20"
          >
            Ask Model Vector Agent
          </button>
        </div>

      </div>

      {/* Render the file viewer panel directly on top if activated */}
      {viewingFile && (
        <div className="fixed inset-0 z-[60]">
          <FileViewerPanel
            file={viewingFile}
            onClose={() => setViewingFile(null)}
          />
        </div>
      )}
    </>
  );
}
