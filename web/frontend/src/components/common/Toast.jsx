import React, { useEffect } from "react";

export default function Toast({ message, type = "success", onClose, duration = 2500 }) {
  useEffect(() => {
    if (!duration) return undefined;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === "success";

  return (
    <div role="alert" style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 2000,
      width: "min(360px, calc(100vw - 40px))", padding: "14px 16px 12px",
      borderRadius: 8, background: "#202020", border: "1px solid #3a3a3a",
      color: "#f5f5f5", boxShadow: "0 8px 28px rgba(0,0,0,.55)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      animation: "windowsToastIn .2s ease-out",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{
          flex: "0 0 auto", width: 28, height: 28, borderRadius: 6,
          display: "grid", placeItems: "center", fontSize: 16,
          color: isSuccess ? "#7ee787" : "#ff8b9e",
          background: isSuccess ? "#173b27" : "#421f27",
        }}>
        {isSuccess ? "✓" : "✕"}
        </span>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "#bdbdbd", marginBottom: 4 }}>
            Atlas Hub
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.4, wordBreak: "break-word" }}>{message}</div>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#bdbdbd", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      </div>
      {duration > 0 && (
        <div style={{ height: 2, marginTop: 12, overflow: "hidden", borderRadius: 2, background: "#333" }}>
          <div style={{
            height: "100%",
            background: isSuccess ? "#65c466" : "#e06c84",
            animation: `windowsToastProgress ${duration}ms linear forwards`,
          }} />
        </div>
      )}
      <style>{`
        @keyframes windowsToastIn {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes windowsToastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
