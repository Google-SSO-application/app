import React, { useState } from "react";
import { documents } from "../../api/index.js";
import { useConfirm } from "../../hooks/useConfirmDialog.jsx";

export default function GlobalTagModal({ closePanel, stop, onCreated, showToast }) {
  const confirm = useConfirm();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const createTag = async (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    const ok = await confirm({
      title: "Create tag?",
      message: `Create a new global tag "${cleanName}"?`,
      confirmLabel: "Create",
    });
    if (!ok) return;

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
    <div onClick={closePanel} className="fixed inset-0 z-[60] grid place-items-center bg-[#04050c]/60 p-5 backdrop-blur-[8px]">
      <div onClick={stop} className="w-[min(420px,100%)] rounded-3xl border border-white/[0.17] bg-gradient-to-br from-white/[0.14] to-white/5 p-[26px] shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_34px_80px_rgba(0,0,0,.6)] backdrop-blur-[34px] backdrop-saturate-[1.8]">
        <div className="text-xl font-bold">Create global tag</div>
        <div className="mt-1.5 text-[13.5px] text-white/[0.62]">Make a tag available across document uploads.</div>
        <form onSubmit={createTag}>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. security-v2"
            className="mt-[18px] h-[42px] w-full rounded-xl border border-white/[0.14] bg-white/[0.07] px-[13px] text-[13.5px] text-[#eef0ff] outline-none"
          />
          <div className="mt-5 flex justify-end gap-2.5">
            <button type="button" onClick={closePanel} className="h-10 rounded-xl border border-white/[0.16] bg-white/[0.07] px-4 text-inherit">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="h-10 rounded-xl border border-[#5fe3a1]/[0.35] bg-[#5fe3a1]/[0.18] px-[18px] font-semibold text-[#8ff0c0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Creating..." : "Create tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
