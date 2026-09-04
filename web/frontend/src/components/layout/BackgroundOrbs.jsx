export default function BackgroundOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      <div style={{ position: "absolute", top: "-18vh", left: "-6vw", width: "52vw", height: "52vw", borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, rgba(139,123,255,.85), rgba(139,123,255,0) 68%)", filter: "blur(30px)", animation: "drift1 26s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "-24vh", right: "-10vw", width: "56vw", height: "56vw", borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(56,208,214,.6), rgba(56,208,214,0) 70%)", filter: "blur(40px)", animation: "drift2 32s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "28vh", right: "22vw", width: "34vw", height: "34vw", borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(255,106,168,.45), rgba(255,106,168,0) 70%)", filter: "blur(40px)", animation: "drift3 22s ease-in-out infinite" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 0%, rgba(5,6,12,0) 20%, rgba(5,6,12,.75) 100%)" }} />
    </div>
  );
}
