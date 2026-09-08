import React, { useState } from "react";
import { project } from "../../api/index.js";

export default function ProjectCreateModal({ closePanel, stop, onCreated }) {
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
      closePanel();
    } catch (err) {
      setError(err.message || "An unexpected error occurred while communicating with database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      onClick={closePanel} 
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20 }}
    >
      <div 
        onClick={stop} 
        style={{ width: "min(620px,100%)", padding: 28, borderRadius: 24, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 34px 80px rgba(0,0,0,.6)" }}
      >
        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.02em" }}>Create new project workspace</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "rgba(238,240,255,.6)" }}>
          Spin up a fresh repository index target group area.
        </div>

        {error && (
          <div role="alert" style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(255,106,168,.12)", border: "1px solid rgba(255,106,168,.3)", color: "#ff6aa8", fontSize: 12.5 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "rgba(238,240,255,.7)", marginBottom: 6 }}>
              Project Label Title Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Infrastructure, Security V3..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              autoFocus
              style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 11, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.07)", outline: "none", fontSize: 13.5, color: "#eef0ff" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "rgba(238,240,255,.7)", marginBottom: 6 }}>
              Description
            </label>
            <textarea
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={4}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 11, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.07)", outline: "none", resize: "vertical", fontSize: 13.5, color: "#eef0ff", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button 
              type="button" 
              onClick={closePanel} 
              disabled={isSaving}
              style={{ height: 38, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.07)", cursor: "pointer", fontSize: 13, color: "inherit", fontWeight: 600 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving || !name.trim()}
              style={{ height: 38, padding: "0 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,.22)", background: "linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.72))", color: "#12142a", fontWeight: 600, fontSize: 13, cursor: isSaving ? "wait" : "pointer" }}
            >
              {isSaving ? "Creating..." : "Save space"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
