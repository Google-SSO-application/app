import React, { useState } from "react";
import { project } from "../../api/index.js";

export default function ProjectCreateModal({ closePanel, stop, onCreated, showToast }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await project.createProject(cleanName, description.trim());
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to create the requested project workspace registry.");
      }

      // Successfully registered to PostgreSQL backend database layer context!
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
      className="fixed inset-0 z-[100] grid place-items-center bg-[#04050c]/60 p-5 backdrop-blur-[8px]"
    >
      <div
        onClick={stop}
        className="w-[min(620px,100%)] rounded-3xl border border-white/[0.17] bg-gradient-to-br from-white/[0.14] to-white/5 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_34px_80px_rgba(0,0,0,.6)] backdrop-blur-[34px] backdrop-saturate-[1.8]"
      >
        <div className="text-[19px] font-bold tracking-[-.02em]">Create new project workspace</div>
        <div className="mt-1.5 text-[13px] text-white/60">
          Spin up a fresh repository index target group area.
        </div>

        {error && (
          <div role="alert" className="mt-3.5 rounded-xl border border-[#ff6aa8]/30 bg-[#ff6aa8]/[0.12] p-3 text-[12.5px] text-[#ff6aa8]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-[18px] flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-white/70">
              Project Label Title Name
            </label>
            <input
              type="text"
              placeholder="e.g. Infrastructure, Security V3..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              autoFocus
              className="h-10 w-full rounded-[11px] border border-white/[0.14] bg-white/[0.07] px-3 text-[13.5px] text-[#eef0ff] outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-white/70">
              Description
            </label>
            <textarea
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={4}
              className="w-full resize-y rounded-[11px] border border-white/[0.14] bg-white/[0.07] px-3 py-2.5 font-sans text-[13.5px] text-[#eef0ff] outline-none"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={closePanel}
              disabled={isSaving}
              className="h-[38px] rounded-xl border border-white/[0.16] bg-white/[0.07] px-4 text-[13px] font-semibold text-inherit"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="h-[38px] rounded-xl border border-white/[0.22] bg-gradient-to-br from-white/[0.92] to-white/[0.72] px-[18px] text-[13px] font-semibold text-[#12142a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Creating..." : "Save space"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
