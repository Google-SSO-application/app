import React, { useRef, useState } from "react";
import El from "../../lib/El.jsx";

export default function UploadModal({ closePanel, stop, projectChips, target }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [urlInput, setUrlInput] = useState("");

  // Open file browser on click
  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  // Handle files from browser selection or drop
  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    const allowedExtensions = /(\.pdf|\.md)$/i;
    const maxSizeBytes = 50 * 1024 * 1024; // 50 MB
    const validFiles = [];

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeBytes) {
        alert(`${file.name} exceeds the 50 MB limit.`);
        return;
      }
      if (!allowedExtensions.exec(file.name)) {
        alert(`${file.name} is not a valid PDF or Markdown file.`);
        return;
      }
      // Check for duplicates
      if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) return;
      
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // Drag-and-drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (indexToRemove, e) => {
    e.stopPropagation(); // Prevent opening file selection
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddAction = () => {
    console.log("Submitting URLs:", urlInput);
    console.log("Submitting Files:", selectedFiles);
    // TODO: Perform your actual upload logic / context update here
    closePanel();
  };

  return (
    <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={stop} style={{ width: "min(520px,100%)", maxHeight: "calc(100vh - 40px)", overflowY: "auto", padding: "clamp(20px,3vw,30px)", borderRadius: 28, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 34px 80px rgba(0,0,0,.6)" }}>

        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>Add to the hub</div>
        <div style={{ marginTop: 6, fontSize: 13.5, color: "rgba(238,240,255,.62)" }}>
          Upload files or paste a link — Medium, dev.to and Drive URLs are indexed automatically.
        </div>

        {/* Hidden Input File Element */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          multiple
          accept=".pdf,.md"
          style={{ display: "none" }}
        />

        {/* Dynamic Drop zone */}
        <div
          onClick={handleDropzoneClick}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            marginTop: 18,
            padding: 28,
            borderRadius: 20,
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.2s ease-in-out",
            border: dragActive ? "1px dashed rgba(169,180,255,.75)" : "1px dashed rgba(255,255,255,.25)",
            background: dragActive ? "rgba(169,180,255,.1)" : "rgba(255,255,255,.05)"
          }}
        >
          <div style={{ fontSize: 24 }}>⤒</div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Drop PDFs, .md or README files</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "rgba(238,240,255,.55)" }}>or click to browse — up to 50 MB each</div>
        </div>

        {/* Selected Files Staging List */}
        {selectedFiles.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {selectedFiles.map((file, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", fontSize: 12.5 }}>
                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "80%" }}>
                  📄 {file.name} <span style={{ color: "rgba(255,255,255,.35)", fontSize: 11 }}>({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </span>
                <button onClick={(e) => removeFile(idx, e)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: 14, fontWeight: "bold" }}>×</button>
              </div>
            ))}
          </div>
        )}

        <El as="input" placeholder="https://medium.com/@team/post…"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          style="margin-top:12px;width:100%;height:44px;padding:0 16px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);outline:none;font-size:13.5px;color:#eef0ff"
          focusStyle="border-color:rgba(169,180,255,.55)" />

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {projectChips.map((c) => (
            <El as="button" key={c.name} onClick={c.pick} style={c.style}>{c.name}</El>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={closePanel} style={{ height: 42, padding: "0 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.07)", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "inherit" }}>Cancel</button>
          <button onClick={handleAddAction} style={{ height: 42, padding: "0 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,.22)", background: "linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.72))", color: "#12142a", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Add to {target}</button>
        </div>
      </div>
    </div>
  );
}
