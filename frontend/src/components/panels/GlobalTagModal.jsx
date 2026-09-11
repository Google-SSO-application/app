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
    <div
      onClick={closePanel}
      className="
        fixed inset-0 z-[200]
        grid place-items-center
        bg-black/60
        p-5
        backdrop-blur-[10px]
      "
    >
      <div
        onClick={stop}
        className="
          w-[min(420px,100%)]
          rounded-2xl
          bg-[#18181A]
          p-6
          font-['Segoe_UI',system-ui,sans-serif]
          shadow-[0_8px_32px_rgba(0,0,0,.5)]
        "
      >
        <div className="text-[16px] font-semibold text-white">
          Create global tag
        </div>

        <div className="mt-1.5 text-[13px] text-[#A5A4AB]">
          Make a tag available across document uploads.
        </div>

        <form onSubmit={createTag}>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. security-v2"
            className="
              mt-[18px]
              h-10
              w-full
              rounded-lg
              border border-white/[0.12]
              bg-[#242426]
              px-3
              text-[13px]
              text-white
              outline-none
              placeholder:text-[#77777D]
              focus:border-white/[0.22]
              focus:bg-[#29292B]
            "
          />

          <div className="mt-5 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={closePanel}
              className="
                h-9
                rounded-lg
                bg-[#242426]
                px-4
                text-[13px]
                font-semibold
                text-white
                transition-colors
                hover:bg-[#2d2d30]
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="
                h-9
                rounded-lg
                bg-[#f0f0f0]
                px-[18px]
                text-[13px]
                font-semibold
                text-black
                transition-colors
                hover:bg-[#d8d8d8]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isSaving ? "Creating..." : "Create tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}