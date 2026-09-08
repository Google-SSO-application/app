import El from "../../lib/El.jsx";
import { cssToObj } from "../../lib/style.js";

export default function Sidebar({
  sidebarStyle, sectionStyle, syncCardStyle,
  nav, projectList, mini, wide, goSources, openProjectModal
}) {
  return (
    <El as="aside" style={sidebarStyle}>
      <div style={{ padding: 14, borderRadius: 22, background: "linear-gradient(165deg, rgba(255,255,255,.11), rgba(255,255,255,.045))", backdropFilter: "blur(26px) saturate(170%)", WebkitBackdropFilter: "blur(26px) saturate(170%)", border: "1px solid rgba(255,255,255,.13)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.28), 0 20px 50px rgba(0,0,0,.4)" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map((n) => (
            <El as="button" key={n.id} onClick={n.go} title={n.title} style={n.style}>
              <span style={{ width: 22, textAlign: "center", opacity: .9, flex: "0 0 auto" }}>{n.icon}</span>
              <span style={cssToObj(n.labelStyle)}>{n.label}</span>
              <span style={cssToObj(n.countStyle)}>{n.count}</span>
            </El>
          ))}
        </div>

        <div style={cssToObj(sectionStyle)}>Projects</div>
        <div style={{ height: 14 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {projectList.map((p) => (
            <El as="button" key={p.name} onClick={p.pick} title={p.title} style={p.style}>
              <span style={cssToObj(p.dot)} />
              <span style={cssToObj(p.labelStyle)}>{p.name}</span>
              <span style={cssToObj(p.countStyle)}>{p.count}</span>
            </El>
          ))}
        </div>
      </div>

      <div style={cssToObj(syncCardStyle)}>
        {mini && (
          <button 
            onClick={openProjectModal} 
            title="Create new project hub"
            style={{ width: 38, height: 38, borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center", color: "#8ff0c0" }}
          >
            +
          </button>
        )}
        {wide && (
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
              Projects Workspace
            </div>
            <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5, color: "rgba(238,240,255,.6)" }}>
              Organize and group document indexes cleanly.
            </div>
            <button 
              onClick={openProjectModal} 
              style={{ marginTop: 12, width: "100%", height: 34, borderRadius: 11, border: "1px solid rgba(95,227,161,.32)", background: "rgba(95,227,161,.12)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#8ff0c0", transition: "all 0.15s ease" }}
            >
              + Add project
            </button>
          </div>
        )}
      </div>

      <div style={cssToObj(syncCardStyle)}>
        {mini && (
          <button onClick={goSources} title="Drive sync — manage sources"
            style={{ width: 38, height: 38, borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", cursor: "pointer", fontSize: 14, position: "relative", color: "inherit" }}>
            ◲<span style={{ position: "absolute", top: 5, right: 5, width: 6, height: 6, borderRadius: "50%", background: "#5fe3a1", boxShadow: "0 0 8px #5fe3a1" }} />
          </button>
        )}
        {wide && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
              Drive sync <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5fe3a1", boxShadow: "0 0 10px #5fe3a1" }} />
            </div>
            <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5, color: "rgba(238,240,255,.6)" }}>3 folders · last synced 12 min ago</div>
            <button onClick={goSources} style={{ marginTop: 12, width: "100%", height: 34, borderRadius: 11, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.09)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "inherit" }}>Manage sources</button>
          </div>
        )}
      </div>
    </El>
  );
}
