import React, { useState } from "react";
import { documents } from "../../api/index.js";

export default function GlobalTagModal({ closePanel, stop, onCreated, showToast }) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const createTag = async (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    setIsSaving(true);
    try {
      const response = await documents.createGlobalTag(cleanName);
      if (!response.ok) throw new Error((await response.text()) || "Unable to create global tag.");
      await onCreated?.();
      showToast?.("Global tag created successfully.");
      closePanel();
    } catch (error) {
      showToast?.(error.message || "Unable to create global tag.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={stop} style={{ width: "min(420px,100%)", padding: 26, borderRadius: 24, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(180%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 34px 80px rgba(0,0,0,.6)" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Create global tag</div>
        <div style={{ marginTop: 6, fontSize: 13.5, color: "rgba(238,240,255,.62)" }}>Make a tag available across document uploads.</div>
        <form onSubmit={createTag}>
          <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. security-v2" style={{ marginTop: 18, width: "100%", height: 42, padding: "0 13px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.07)", outline: "none", fontSize: 13.5, color: "#eef0ff" }} />
          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={closePanel} style={{ height: 40, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.07)", cursor: "pointer", color: "inherit" }}>Cancel</button>
            <button type="submit" disabled={isSaving || !name.trim()} style={{ height: 40, padding: "0 18px", borderRadius: 12, border: "1px solid rgba(95,227,161,.35)", background: "rgba(95,227,161,.18)", color: "#8ff0c0", fontWeight: 600, cursor: isSaving ? "wait" : "pointer" }}>{isSaving ? "Creating..." : "Create tag"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
