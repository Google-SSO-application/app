export default function ConfirmDialog({ dialog, onConfirm, onCancel }) {
  if (!dialog) return null;
  const { title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false } = dialog;

  return (
    <div onClick={onCancel} className="fixed inset-0 z-[200] grid place-items-center bg-black/60 p-5 backdrop-blur-[3px]">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[min(420px,100%)] rounded-lg border border-white/10 bg-[#2b2b2b] p-6 font-['Segoe_UI',system-ui,sans-serif] shadow-[0_8px_32px_rgba(0,0,0,.5)]"
      >
        <div className="text-[16px] font-semibold text-[#f5f5f5]">{title}</div>
        {message && <div className="mt-2 text-[13px] leading-[1.5] text-white/60">{message}</div>}
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-md border border-white/[0.12] bg-white/[0.05] px-4 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-9 rounded-md px-[18px] text-[13px] font-semibold transition-colors ${
              danger
                ? "border border-[#ff6aa8]/50 bg-[#ff6aa8]/90 text-[#2b0714] hover:bg-[#ff85b8]"
                : "border border-[#4cc2ff]/50 bg-[#4cc2ff] text-[#0b1a24] hover:bg-[#7ad4ff]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}