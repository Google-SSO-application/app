import React, { useRef, useState } from "react";
import El from "../../lib/El.jsx";
import { documents, project } from "../../api/index.js";

const inactiveStyle = "padding:6px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:inherit";
const activeStyle = "padding:6px 12px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(95,227,161,.4);background:rgba(95,227,161,.14);color:#8ff0c0";

export default function UploadModal({ closePanel, stop, projectChips, target, onUploaded }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [localProjects, setLocalProjects] = useState([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectError, setProjectError] = useState("");

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
      previous.map((item) => ({ ...item, active: false, style: inactiveStyle }))
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
      style: item.name === name ? activeStyle : inactiveStyle,
    })));
  };

  const createProject = async (event) => {
    event.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;

    setProjectError("");
    try {
      const response = await project.createProject(name);
      if (!response.ok) throw new Error((await response.text()) || "Failed to create project.");
      
      const created = await response.json();
      const finalName = created.name || name;

      // Deselect all current active parent options
      projectChips.forEach((chip) => {
        if (chip.active) chip.pick();
      });

      // Insert new project into local view collection state and mark it as active
      const newChipObject = {
        name: finalName,
        active: true,
        style: activeStyle
      };

      setLocalProjects((prev) => {
        const cleanedPrev = prev.map(item => ({
          ...item,
          active: false,
          style: inactiveStyle
        }));
        return [...cleanedPrev, newChipObject];
      });

      setNewProjectName("");
      setIsCreatingProject(false);
    } catch (error) {
      setProjectError(error.message || "Failed to create project.");
    }
  };

  const uploadOrIndex = async () => {
    const activeLocalProject = localProjects.find((item) => item.active);
    const activeParentProject = projectChips.find((item) => item.active);
    const projectName = activeLocalProject?.name || activeParentProject?.name || target;

    if (selectedFiles.length) {
      setIsUploading(true);
      try {
        await Promise.all(selectedFiles.map(async (file) => {
          const title = file.name.replace(/\.[^/.]+$/, "");
          const response = await documents.uploadDocument(file, title, projectName);
          if (!response.ok) throw new Error((await response.text()) || `Failed to upload ${file.name}`);
          return response.json();
        }));
        
        // Pass up active local project state context to update parent layout registers
        await onUploaded?.();
        closePanel();
      } catch (error) {
        alert(`Upload error: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (urlInput.trim()) closePanel();
  };

  return (
    <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={stop} style={{ width: "min(520px,100%)", maxHeight: "calc(100vh - 40px)", overflowY: "auto", padding: "clamp(20px,3vw,30px)", borderRadius: 28, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(180%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 34px 80px rgba(0,0,0,.6)" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Add to the hub</div>
        <div style={{ marginTop: 6, fontSize: 13.5, color: "rgba(238,240,255,.62)" }}>Upload files or paste a link.</div>

        <input ref={fileInputRef} type="file" onChange={(event) => handleFiles(event.target.files)} multiple accept=".pdf,.md" style={{ display: "none" }} />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => { event.preventDefault(); setDragActive(false); handleFiles(event.dataTransfer.files); }}
          style={{ marginTop: 18, padding: 28, borderRadius: 20, cursor: "pointer", textAlign: "center", border: dragActive ? "1px dashed rgba(169,180,255,.75)" : "1px dashed rgba(255,255,255,.25)", background: dragActive ? "rgba(169,180,255,.1)" : "rgba(255,255,255,.05)" }}
        >
          <div style={{ fontSize: 24 }}>⤒</div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Drop PDFs or Markdown files</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "rgba(238,240,255,.55)" }}>or click to browse, up to 50 MB each</div>
        </div>

        {selectedFiles.length > 0 && <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {selectedFiles.map((file, index) => <div key={`${file.name}-${index}`} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,.04)", fontSize: 12.5 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {file.name}</span>
            <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedFiles((previous) => previous.filter((_, itemIndex) => itemIndex !== index)); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer" }}>×</button>
          </div>)}
        </div>}

        <El as="input" placeholder="https://medium.com…" value={urlInput} onChange={(event) => setUrlInput(event.target.value)} style="margin-top:12px;width:100%;height:44px;padding:0 16px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);outline:none;font-size:13.5px;color:#eef0ff" />

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(238,240,255,.7)" }}>Target project</div>
          <button type="button" onClick={() => setIsCreatingProject((value) => !value)} style={{ fontSize: 12, fontWeight: 600, background: "none", color: "#8ff0c0", cursor: "pointer", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(95,227,161,.2)" }}>{isCreatingProject ? "Cancel" : "+ Create project"}</button>
        </div>

        {isCreatingProject && <form onSubmit={createProject} style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <input type="text" placeholder="New project name..." value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} autoFocus style={{ flex: 1, height: 32, borderRadius: 8, background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "0 10px", fontSize: 12.5 }} />
          <button type="submit" style={{ height: 32, padding: "0 12px", borderRadius: 8, background: "#8ff0c0", color: "#12142a", border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Save</button>
        </form>}
        {projectError && <div role="alert" style={{ marginTop: 6, color: "#ff6aa8", fontSize: 11.5 }}>{projectError}</div>}

        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {projectChips.map((chip) => <El as="button" key={chip.name} onClick={() => handleParentChipClick(chip)} style={chip.style}>{chip.name}</El>)}
          {localProjects.map((chip) => <El as="button" key={chip.name} onClick={() => selectLocalProject(chip.name)} style={chip.style}>{chip.name}</El>)}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" onClick={closePanel} style={{ height: 42, padding: "0 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.07)", cursor: "pointer", color: "inherit" }}>Cancel</button>
            <button 
                type="button" 
                onClick={uploadOrIndex} 
                disabled={isUploading} 
                style={{ height: 42, padding: "0 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,.22)", background: "rgba(255,255,255,.92)", color: "#12142a", fontWeight: 600, cursor: isUploading ? "wait" : "pointer" }}
                >
                {isUploading ? "Uploading..." : `Add to ${localProjects.find((item) => item.active)?.name || projectChips.find((item) => item.active)?.name || target}`}
            </button>
        </div>
      </div>
    </div>
  );
}