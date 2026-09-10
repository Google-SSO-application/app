import React, { useRef, useState } from "react";
import { documents, project } from "../../api/index.js";
import { useConfirm } from "../../hooks/useConfirmDialog.jsx";

const CHIP_INACTIVE =
  "px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border border-white/[0.12] bg-white/[0.05] text-white/75";
const CHIP_ACTIVE =
  "px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border border-[#4cc2ff]/50 bg-[#4cc2ff]/[0.16] text-[#8fd8ff]";

export default function UploadModal({
  closePanel,
  stop,
  projectChips,
  target,
  onUploaded,
  onProjectSelected,
  showToast,

  masterTags = [],
  newTagFields = [],
  tagError,
  setTagError,
  toggleMasterTagSelection,
  handleTagFieldChange,
  addAnotherTagField,
  removeTagField,
  resetTagFieldsForm
}) {
  const fileInputRef = useRef(null);
  const confirm = useConfirm();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [localProjects, setLocalProjects] = useState([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [projectError, setProjectError] = useState("");

  const handleClose = () => {
    resetTagFieldsForm?.();
    closePanel();
  };

  const handleFiles = (files) => {
    if (!files?.length) return;
    const validFiles = [];
    Array.from(files).forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} exceeds the 50 MB limit.`);
      } else if (!/(\.pdf|\.md)$/i.test(file.name)) {
        alert(`${file.name} is not a valid PDF or Markdown file.`);
      } else if (!selectedFiles.some((item) => item.name === file.name && item.size === file.size)) {
        validFiles.push(file);
      }
    });
    if (validFiles.length) setSelectedFiles((previous) => [...previous, ...validFiles]);
  };

  const handleParentChipClick = (chip) => {
    // Clear all local/newly created project selections first
    setLocalProjects((previous) =>
      previous.map((item) => ({ ...item, active: false }))
    );
    chip.pick();
  };

  const selectLocalProject = (name) => {
    // Deselect all parent chips to let the custom local project selection take priority
    projectChips.forEach((chip) => {
      if (chip.active) chip.pick();
    });
    setLocalProjects((previous) => previous.map((item) => ({
      ...item,
      active: item.name === name,
    })));
  };

  const createProject = async (event) => {
    event.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;

    setProjectError("");
    try {
      const response = await project.createProject(name, newProjectDescription.trim());
      if (!response.ok) throw new Error((await response.text()) || "Failed to create project.");

      const created = await response.json();
      const finalName = created.name || name;

      onProjectSelected?.(finalName);

      // Insert new project into local view collection state and mark it as active
      const newChipObject = {
        name: finalName,
        active: true,
      };

      setLocalProjects((prev) => {
        const cleanedPrev = prev.map(item => ({
          ...item,
          active: false,
        }));
        return [...cleanedPrev, newChipObject];
      });

      setNewProjectName("");
      setNewProjectDescription("");
      setIsCreatingProject(false);
      showToast?.("Project created successfully.");
    } catch (error) {
      showToast?.(error.message || "Unable to create project.", "error");
      setProjectError(error.message || "Failed to create project.");
    }
  };

  const uploadOrIndex = async () => {
    const activeLocalProject = localProjects.find((item) => item.active);
    const activeParentProject = projectChips.find((item) => item.active);
    const projectName = activeLocalProject?.name || activeParentProject?.name || target;

    const chosenExistingTags = masterTags.filter(t => t.active).map(t => t.name);
    const customInputTags = newTagFields.map(f => f.trim()).filter(f => f !== "");
    const finalMergedTagsArray = [...new Set([...chosenExistingTags, ...customInputTags])];

    if (selectedFiles.length) {
      const ok = await confirm({
        title: "Upload document(s)?",
        message: `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} to "${projectName}"?`,
        confirmLabel: "Upload",
      });
      if (!ok) return;

      setIsUploading(true);
      try {
        await Promise.all(customInputTags.map(async (tagName) => {
          const response = await documents.createGlobalTag(tagName);
          if (!response.ok) {
            throw new Error((await response.text()) || `Failed to create tag ${tagName}`);
          }
        }));

        await Promise.all(selectedFiles.map(async (file) => {
          const title = file.name.replace(/\.[^/.]+$/, "");
          const response = await documents.uploadDocument(file, title, projectName);
          if (!response.ok) throw new Error((await response.text()) || `Failed to upload ${file.name}`);
          const document = await response.json();

          if (finalMergedTagsArray.length > 0) {
            const tagResponse = await documents.applyTagsToDocument(document.id, finalMergedTagsArray);
            if (!tagResponse.ok) {
              throw new Error((await tagResponse.text()) || `Failed to apply tags to ${file.name}`);
            }
          }

          return document;
        }));

        // Pass up active local project state context to update parent layout registers
        await onUploaded?.();
        showToast?.("Document uploaded successfully.");
        handleClose();
      } catch (error) {
        showToast?.(error.message || "Unable to upload document.", "error");
        alert(`Upload error: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (urlInput.trim()) handleClose();
  };

  return (
    <div onClick={handleClose} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-5 backdrop-blur-[3px]">
      <div
        onClick={stop}
        className="max-h-[calc(100vh-40px)] w-[min(520px,100%)] overflow-y-auto rounded-lg border border-white/10 bg-[#2b2b2b] p-6 font-['Segoe_UI',system-ui,sans-serif] shadow-[0_8px_32px_rgba(0,0,0,.5)]"
      >
        <div className="text-[17px] font-semibold text-[#f5f5f5]">Add to the hub</div>
        <div className="mt-1 text-[13px] text-white/55">Upload files or paste a link.</div>

        <input ref={fileInputRef} type="file" onChange={(event) => handleFiles(event.target.files)} multiple accept=".pdf,.md" className="hidden" />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => { event.preventDefault(); setDragActive(false); handleFiles(event.dataTransfer.files); }}
          className={`mt-[18px] cursor-pointer rounded-lg border border-dashed p-7 text-center transition-colors ${
            dragActive ? "border-[#4cc2ff]/70 bg-[#4cc2ff]/[0.08]" : "border-white/20 bg-white/[0.03]"
          }`}
        >
          <div className="text-2xl">⤒</div>
          <div className="mt-2 text-sm font-semibold text-white/90">Drop PDFs or Markdown files</div>
          <div className="mt-1 text-xs text-white/50">or click to browse, up to 50 MB each</div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex justify-between rounded-md bg-[#1f1f1f] px-3 py-2 text-[12.5px] text-white/85">
                <span className="truncate">📄 {file.name}</span>
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); setSelectedFiles((previous) => previous.filter((_, itemIndex) => itemIndex !== index)); }}
                  className="border-none bg-transparent text-white/45 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          placeholder="https://medium.com…"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          className="mt-3 h-10 w-full rounded-md border border-white/10 bg-[#1f1f1f] px-3.5 text-[13.5px] text-[#f5f5f5] outline-none transition-colors focus:border-[#4cc2ff]/60"
        />

        {/* --- Dynamic Tags Section --- */}
        <div className="mt-[18px] border-t border-white/[0.08] pt-4">
          <div className="mb-2 text-[13px] font-semibold text-white/70">Select Existing Hub Tags</div>

          {masterTags.length === 0 ? (
            <div className="py-1 text-xs text-white/40">No global tags registered yet. Create one below!</div>
          ) : (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {masterTags.map((tag) => (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => toggleMasterTagSelection(tag.name)}
                  className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                    tag.active
                      ? "border border-[#4cc2ff]/50 bg-[#4cc2ff]/[0.16] text-[#8fd8ff]"
                      : "border border-white/[0.1] bg-white/[0.04] text-white/70"
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}
          <div className="mb-2 mt-3 text-[13px] font-semibold text-white/70">
            Create &amp; Apply New Tags
          </div>

          <div className="flex flex-col gap-1.5">
            {newTagFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter tag value (e.g. security-v2)..."
                  value={field}
                  onChange={(e) => handleTagFieldChange(idx, e.target.value)}
                  className="h-8 flex-1 rounded-md border border-white/10 bg-[#1f1f1f] px-2.5 text-[12.5px] text-white outline-none focus:border-[#4cc2ff]/60"
                />
                <button
                  type="button"
                  onClick={() => removeTagField(idx)}
                  title="Remove field slot"
                  className="border-none bg-transparent px-1 text-base text-white/40 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addAnotherTagField}
            className="mt-2 inline-block border-none bg-transparent py-1 text-xs font-semibold text-[#8fd8ff]"
          >
            + Add another tag input
          </button>

          {tagError && (
            <div role="alert" className="mt-1.5 text-[11.5px] text-[#ff99a4]">
              {tagError}
            </div>
          )}
        </div>

        {/* --- Target Project Section --- */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[13px] font-semibold text-white/65">Target project</div>
          <button
            type="button"
            onClick={() => setIsCreatingProject((value) => !value)}
            className="rounded-md border border-[#4cc2ff]/30 bg-transparent px-2 py-1 text-xs font-semibold text-[#8fd8ff]"
          >
            {isCreatingProject ? "Cancel" : "+ Create project"}
          </button>
        </div>

        {isCreatingProject && (
          <form onSubmit={createProject} className="mt-2 flex flex-col gap-2">
            <input
              type="text"
              placeholder="New project name..."
              value={newProjectName}
              onChange={(event) => setNewProjectName(event.target.value)}
              autoFocus
              className="h-8 w-full rounded-md border border-white/10 bg-[#1f1f1f] px-2.5 text-[12.5px] text-white"
            />
            <textarea
              placeholder="Project description..."
              value={newProjectDescription}
              onChange={(event) => setNewProjectDescription(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-white/10 bg-[#1f1f1f] px-2.5 py-2 font-sans text-[12.5px] text-white"
            />
            <button type="submit" className="h-8 self-end rounded-md border-none bg-[#4cc2ff] px-3 text-xs font-semibold text-[#0b1a24] hover:bg-[#7ad4ff]">
              Save
            </button>
          </form>
        )}
        {projectError && <div role="alert" className="mt-1.5 text-[11.5px] text-[#ff99a4]">{projectError}</div>}

        <div className="mt-2.5 flex flex-wrap gap-2">
          {projectChips.map((chip) => (
            <button key={chip.name} onClick={() => handleParentChipClick(chip)} className={chip.active ? CHIP_ACTIVE : CHIP_INACTIVE}>
              {chip.name}
            </button>
          ))}
          {localProjects.map((chip) => (
            <button key={chip.name} onClick={() => selectLocalProject(chip.name)} className={chip.active ? CHIP_ACTIVE : CHIP_INACTIVE}>
              {chip.name}
            </button>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" onClick={handleClose} className="h-9 rounded-md border border-white/[0.12] bg-white/[0.05] px-4 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/[0.1] hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={uploadOrIndex}
            disabled={isUploading}
            className="h-9 rounded-md border border-[#4cc2ff]/50 bg-[#4cc2ff] px-[18px] text-[13px] font-semibold text-[#0b1a24] transition-colors hover:bg-[#7ad4ff] disabled:cursor-wait disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : `Add to ${localProjects.find((item) => item.active)?.name || projectChips.find((item) => item.active)?.name || target}`}
          </button>
        </div>
      </div>
    </div>
  );
}
