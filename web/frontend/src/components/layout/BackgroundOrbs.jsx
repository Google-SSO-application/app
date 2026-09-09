export default function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -left-[6vw] -top-[18vh] h-[52vw] w-[52vw] animate-drift1 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(139,123,255,.85),rgba(139,123,255,0)_68%)] blur-[30px]" />
      <div className="absolute -bottom-[24vh] -right-[10vw] h-[56vw] w-[56vw] animate-drift2 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,208,214,.6),rgba(56,208,214,0)_70%)] blur-[40px]" />
      <div className="absolute right-[22vw] top-[28vh] h-[34vw] w-[34vw] animate-drift3 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,106,168,.45),rgba(255,106,168,0)_70%)] blur-[40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(5,6,12,0)_20%,rgba(5,6,12,.75)_100%)]" />
    </div>
  );
}
