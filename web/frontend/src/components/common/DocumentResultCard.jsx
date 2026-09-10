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

export default function DocumentResultCard({ doc, onView }) {

  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-white/[0.12] bg-gradient-to-br from-white/10 to-white/[0.04] px-[18px] py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.24),0_16px_40px_rgba(0,0,0,.25)] backdrop-blur-2xl backdrop-saturate-[1.7]">
      <button type="button" onClick={onView} className="grid h-10 w-10 flex-none place-items-center rounded-md border border-white/[0.1] bg-[#242424] text-base text-white/80">
        {doc.file_type === "pdf" ? "▤" : "≡"}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onView} className="truncate text-left text-[15px] font-semibold text-[#f5f5f5] transition-colors hover:text-[#8fd8ff] hover:underline">
            {doc.title || doc.file_name}
          </button>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(doc.status)}`}>
            {doc.status}
          </span>
        </div>
        <div className="mt-1 truncate text-[12px] text-white/[0.5]">{doc.file_name}</div>
        {doc.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {doc.tags.map((tag) => (
              <span key={tag} className="rounded border border-[#4cc2ff]/30 bg-[#4cc2ff]/10 px-2 py-[3px] text-[11px] font-semibold text-[#8fd8ff]">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-white/40">
          <span>{doc.project_name || "Unassigned"}</span><span>·</span>
          <span>{(doc.file_type || "file").toUpperCase()}</span><span>·</span>
          <span>uploaded {formatDate(doc.created_at)}</span>
        </div>
      </div>

      <div className="ml-auto flex flex-none items-center gap-2">
        <button type="button" onClick={onView} className="h-8 rounded-md border border-[#4cc2ff]/40 bg-[#4cc2ff]/10 px-3 text-xs font-semibold text-[#8fd8ff] transition-colors hover:bg-[#4cc2ff]/20">
          View
        </button>
      </div>
    </div>
  );
}