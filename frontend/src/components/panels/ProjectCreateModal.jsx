import React, { useState } from "react";
import { project } from "../../api/index.js";
import { useConfirm } from "../../hooks/useConfirmDialog.jsx";

export default function ProjectCreateModal({ closePanel, stop, onCreated, showToast }) {
  const confirm = useConfirm();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    const ok = await confirm({
      title: "Create project?",
      message: `Create a new project workspace named "${cleanName}"?`,
      confirmLabel: "Create",
    });
    if (!ok) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await project.createProject(cleanName, description.trim());
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to create the requested project workspace registry.");
      }

      await onCreated?.();
      showToast?.("Project created successfully.");
      closePanel();
    } catch (err) {
      showToast?.(err.message || "Unable to create project.", "error");
      setError(err.message || "An unexpected error occurred while communicating with database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={closePanel}
      className="
        fixed inset-0 z-[100]
        grid place-items-center
        bg-black/60
        p-5
        backdrop-blur-[10px]
      "
    >
      <div
        onClick={stop}
        className="
          w-[min(640px,100%)]
          rounded-2xl
          bg-[#18181A]
          p-6
          font-['Segoe_UI',system-ui,sans-serif]
          shadow-[0_8px_32px_rgba(0,0,0,.5)]
        "
      >
        {/* Header */}
        <div>
          <div className="text-[17px] font-semibold tracking-[-.01em] text-[#ffffff]">
            Create new project workspace
          </div>

          <div className="mt-1 text-[13px] text-[#A5A4AB]">
            Spin up a fresh repository index target group area.
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="
              mt-3
              rounded-md
              border border-[#c42b1c]/40
              bg-[#442726]
              p-2.5
              text-xs
              text-[#ff99a4]
            "
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-[18px] flex flex-col gap-3.5"
        >
          {/* Project name */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-[12.5px]
                font-semibold
                text-white/65
              "
            >
              Project Label Title Name
            </label>

            <input
              type="text"
              placeholder="e.g. Infrastructure, Security V3..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              autoFocus
              className="
                h-9
                w-full
                rounded-md
                border border-white/10
                bg-[#242426]
                px-3
                text-[13.5px]
                text-[#f5f5f5]
                placeholder:text-white/[0.30]
                outline-none
                transition-colors
                focus:border-[#4cc2ff]/60
              "
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-[12.5px]
                font-semibold
                text-white/65
              "
            >
              Description
            </label>

            <textarea
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={4}
              className="
                w-full
                resize-y
                rounded-md
                border border-white/10
                bg-[#242426]
                px-3
                py-2.5
                font-sans
                text-[13.5px]
                text-[#f5f5f5]
                placeholder:text-white/[0.30]
                outline-none
                transition-colors
                focus:border-[#4cc2ff]/60
              "
            />
          </div>

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={closePanel}
              disabled={isSaving}
              className="
                h-8
                rounded-md
                border border-white/[0.12]
                bg-white/[0.05]
                px-3.5
                text-[12.5px]
                font-semibold
                text-white/80
                transition-colors
                hover:bg-white/[0.1]
                hover:text-white
                disabled:cursor-wait
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="
    h-8
    rounded-md
    border border-[#4cc2ff]/50
    bg-[#f0f0f0]
    px-[18px]
    text-[12.5px]
    font-semibold
    text-black
    transition-all
    duration-150
    hover:border-[#4cc2ff]
    hover:bg-white
    hover:shadow-[0_0_12px_rgba(76,194,255,0.3)]
    hover:-translate-y-[1px]
    hover:text-[#111827]
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
            >
              {isSaving ? "Creating..." : "Save space"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}