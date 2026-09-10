export default function FileViewerPanel({ file, onClose }) {
  if (!file) return null;

  const url = `/web/uploads/${file.fileName}`;
  const label = file.title || file.fileName;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#1b1b1b] font-['Segoe_UI',system-ui,sans-serif]">
      {/* Tab strip */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#202020] px-3 pt-2">
        <div className="flex max-w-[280px] items-center gap-2 rounded-t-lg border border-b-0 border-white/10 bg-[#2b2b2b] px-3 py-2 text-[13px] text-[#f5f5f5]">
          <span className="flex-none text-sm opacity-80">{file.fileType === "pdf" ? "▤" : "≡"}</span>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tab"
            className="flex-none rounded p-0.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3 pb-2 pr-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/45 transition-colors hover:text-[#8fd8ff]"
          >
            Open in browser ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            className="h-7 rounded-md border border-white/12 bg-white/[0.05] px-3 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>

      {/* File content */}
      <iframe
        src={url}
        title={label}
        className="w-full flex-1 border-0 bg-white"
      />
    </div>
  );
}
