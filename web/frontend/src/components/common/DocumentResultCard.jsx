import { FileTypeMark } from "../common/FileTypeIcon.jsx";

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

export default function DocumentResultCard({ doc, onOpenDetail, onView }) {
  return (
    <div
      onClick={onOpenDetail}
      className="relative flex items-start gap-3.5 rounded-3xl border border-white/[0.12] bg-gradient-to-br from-white/10 to-white/[0.04] px-[18px] py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.24),0_16px_40px_rgba(0,0,0,.25)] backdrop-blur-2xl backdrop-saturate-[1.7] cursor-pointer hover:border-white/20 transition-all group select-none"
    >
      <div
        className="
          grid
          h-11
          w-11
          flex-none
          place-items-center
          rounded-xl
          border
          border-white/[0.11]
          bg-gradient-to-br
          from-white/[0.12]
          to-white/[0.025]
          shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_5px_14px_rgba(0,0,0,.22)]
          backdrop-blur-xl
          backdrop-saturate-[1.4]
        "
      >
        <FileTypeMark
          fileType={doc.fileType || doc.file_type}
          size={22}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onOpenDetail} className="truncate text-left text-[15px] font-semibold text-[#f5f5f5] transition-colors hover:text-[#8fd8ff] hover:underline">
            {doc.title || doc.file_name}
          </button>
          <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${statusClass(doc.status)}`}>
            {doc.status}
          </span>
        </div>
        <div className="mt-1 truncate text-[12px] text-white/[0.5]">{doc.file_name}</div>
        {doc.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {doc.tags.map((tag) => (
              <span key={tag} className="rounded border border-white/[0.08] bg-white/[0.05] px-2 py-[3px] text-[11px] font-semibold text-white/[0.65]">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-white/40">
          <span>{doc.projectName || "Unassigned"}</span>
          <span>·</span>
          <span>{(doc.fileType || "file").toUpperCase()}</span>
          <span>·</span>
          <span>uploaded {formatDate(doc.createdAt)}</span>
        </div>
      </div>

      <div className="absolute right-[18px] top-1/2 -translate-y-1/2">
        <button
          type="button"
          aria-label="Open document"
          onClick={(e) => {
            e.stopPropagation();
            onView?.();
          }}
          className="
            flex
            h-9
            w-7
            items-center
            justify-center
            rounded-md
            text-[26px]
            font-normal
            leading-none
            text-white/40
            transition-all
            group-hover:text-white/70
            hover:bg-white/[0.05]
          "
        >
          <span>›</span>
        </button>
      </div>
    </div>
  );
}