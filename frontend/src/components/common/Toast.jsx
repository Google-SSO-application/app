import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose, duration = 2500 }) {
  useEffect(() => {
    if (!duration) return undefined;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-5 z-[2000] w-[min(360px,calc(100vw-40px))] mx-auto animate-toast-in rounded-lg border border-[#3a3a3a] bg-[#202020] px-4 pb-3 pt-3.5 font-['Segoe_UI',system-ui,sans-serif] text-[#f5f5f5] shadow-[0_8px_28px_rgba(0,0,0,.55)]"
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-7 w-7 flex-none place-items-center rounded-md text-base ${
            isSuccess ? "bg-[#173b27] text-[#7ee787]" : "bg-[#421f27] text-[#ff8b9e]"
          }`}
        >
          {isSuccess ? "✓" : "✕"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs text-[#bdbdbd]">Atlas Hub</div>
          <div className="break-words text-[13.5px] leading-[1.4]">{message}</div>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onClose}
          className="border-none bg-transparent p-0 text-lg leading-none text-[#bdbdbd]"
        >
          ×
        </button>
      </div>
      {duration > 0 && (
        <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-[#333]">
          <div
            className={`h-full animate-toast-progress ${isSuccess ? "bg-[#65c466]" : "bg-[#e06c84]"}`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}
