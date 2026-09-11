export default function ConfirmDialog({ dialog, onConfirm, onCancel }) {
  if (!dialog) return null;
  const { title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false } = dialog;

  return (
    <div onClick={onCancel} className="fixed inset-0 z-[200] grid place-items-center bg-black/60 p-5 backdrop-blur-[10px]">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[min(420px,100%)] rounded-2xl bg-[#18181A] p-6 font-['Segoe_UI',system-ui,sans-serif] shadow-[0_8px_32px_rgba(0,0,0,.5)]"
      >
        <div className="text-[16px] font-semibold text-[#ffffff]">{title}</div>
        {message && <div className="mt-2 text-[13px] leading-[1.5] text-[#A5A4AB]">{message}</div>}
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-md bg-[#242426] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.1]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-9 rounded-md px-[18px] text-[13px] font-semibold transition-colors ${
              danger
                ? "bg-[#DB3B3D] text-[#ffffff] hover:bg-hover:bg-[#f05258]"
                : "bg-[#f0f0f0] text-black hover:bg-[#ffffff] hover:text-[#111827]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}