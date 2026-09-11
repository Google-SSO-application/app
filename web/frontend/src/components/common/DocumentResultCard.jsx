import { FileTypeMark } from "../common/FileTypeIcon.jsx";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function statusClass(status) {
  if (status === "published") {
    return "bg-[#5fe3a1]/[0.14] border border-[#5fe3a1]/[0.2] text-[#5fe3a1]";
  }
  return "bg-[#ffb058]/[0.16] border border-[#ffb058]/[0.2] text-[#ffb058]";
}

export default function DocumentResultCard({ doc, onOpenDetail, onView }) {
  return (
    <div
      onClick={onOpenDetail}
      className="
        group relative flex cursor-pointer items-start gap-3.5
        rounded-[20px]
        border border-white/[0.12]
        bg-gradient-to-br from-white/10 to-white/[0.04]
        px-[18px] py-4
        shadow-[inset_0_1px_0_rgba(255,255,255,.24),0_16px_40px_rgba(0,0,0,.30)]
        backdrop-blur-2xl
        backdrop-saturate-[1.7]
        select-none
        transition-all duration-200 ease-out
        hover:-translate-y-[1px]
        hover:border-white/[0.22]
        hover:bg-gradient-to-br
        hover:from-white/[0.16]
        hover:to-white/[0.07]
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,.30),0_20px_48px_rgba(0,0,0,.38)]
      "
    >
      {/* File icon */}
      <div
        className="
          grid h-11 w-11 flex-none place-items-center rounded-xl
          border border-white/[0.11]
          bg-gradient-to-br from-white/[0.12] to-white/[0.025]
          shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_5px_14px_rgba(0,0,0,.22)]
          backdrop-blur-xl backdrop-saturate-[1.4]
          transition-all duration-200
          group-hover:border-white/[0.18]
          group-hover:bg-white/[0.14]
        "
      >
        <FileTypeMark
          fileType={doc.fileType || doc.file_type}
          size={22}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pr-7">
        {/* Title + status */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.();
            }}
            className="
              min-w-0 truncate text-left
              text-[15px] font-semibold
              leading-[1.35]
              tracking-[-0.01em]
              text-[#eef0ff]
              transition-colors duration-150
              hover:text-[#d8dcff]
            "
          >
            {doc.title || doc.file_name}
          </button>

          <span
            className={`
              rounded-lg px-2 py-0.5
              text-[11px] font-semibold
              tracking-[0.02em]
              ${statusClass(doc.status)}
            `}
          >
            {doc.status}
          </span>
        </div>

        {/* Filename */}
        <div
          className="
            mt-1 truncate
            text-[12px]
            leading-[1.45]
            text-white/[0.45]
          "
        >
          {doc.file_name}
        </div>

        {/* Tags */}
        {doc.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className="
                  rounded-md
                  border border-white/[0.08]
                  bg-white/[0.045]
                  px-2 py-[3px]
                  text-[11px] font-medium
                  leading-none
                  text-white/[0.60]
                  transition-colors duration-150
                  group-hover:border-white/[0.11]
                  group-hover:bg-white/[0.065]
                  group-hover:text-white/[0.68]
                "
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div
          className="
            mt-2 flex flex-wrap items-center gap-2
            font-mono text-[11px]
            leading-[1.4]
            text-white/[0.40]
            transition-colors duration-150
            group-hover:text-white/[0.48]
          "
        >
          <span>{doc.projectName || "Unassigned"}</span>
          <span>·</span>
          <span>
            {(doc.fileType || "file").toUpperCase()}
          </span>
          <span>·</span>
          <span>uploaded {formatDate(doc.createdAt)}</span>
        </div>
      </div>

      {/* Chevron */}
      <div className="absolute right-[18px] top-1/2 -translate-y-1/2">
        <button
          type="button"
          aria-label="Open document"
          onClick={(e) => {
            e.stopPropagation();
            onView?.();
          }}
          className="
            flex h-9 w-7 items-center justify-center
            rounded-md
            text-[26px] font-normal leading-none
            text-white/[0.30]
            opacity-70
            transition-all duration-200
            group-hover:translate-x-[2px]
            group-hover:text-white/[0.78]
            group-hover:opacity-100
            hover:bg-white/[0.06]
          "
        >
          <span>›</span>
        </button>
      </div>
    </div>
  );
}