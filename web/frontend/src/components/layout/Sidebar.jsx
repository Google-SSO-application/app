export default function Sidebar({
  narrow, navOpen, mini, wide,
  nav, projectList, goAssigned, openProjectModal
}) {
  const asideClass = narrow
    ? navOpen
      ? "fixed left-3 right-3 top-[70px] z-30 max-h-[76vh] overflow-y-auto"
      : "hidden"
    : `sticky top-[88px] flex-none transition-[flex-basis] duration-200 ease-in-out ${mini ? "basis-[68px]" : "basis-[262px]"}`;

  const cardClass = mini
    ? "mt-3.5 flex justify-center rounded-[20px] border border-white/[0.12] bg-gradient-to-br from-[#38d0d6]/[0.16] to-white/[0.04] py-3 backdrop-blur-2xl"
    : "mt-3.5 rounded-[20px] border border-white/[0.12] bg-gradient-to-br from-[#38d0d6]/[0.16] to-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.25)] backdrop-blur-2xl";

  return (
    <aside className={asideClass}>
      <div className="rounded-[22px] border border-white/[0.13] bg-gradient-to-br from-white/[0.11] to-white/[0.045] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_20px_50px_rgba(0,0,0,.4)] backdrop-blur-[26px] backdrop-saturate-[1.7]">

        <div className="flex flex-col gap-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={n.go}
              title={n.title}
              className={`flex h-11 items-center gap-2.5 rounded-xl px-3 text-[13.5px] font-semibold transition-colors ${
                n.active
                  ? "border border-white/20 bg-gradient-to-br from-white/[0.22] to-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,.3)]"
                  : "border border-transparent bg-transparent text-white/[0.72] hover:bg-white/[0.06]"
              }`}
            >
              <span className="w-[22px] flex-none text-center opacity-90">{n.icon}</span>
              {!mini && <span className="flex-1 text-left">{n.label}</span>}
              {!mini && <span className="font-mono text-[11px] opacity-50">{n.count}</span>}
            </button>
          ))}
        </div>

        {!mini && (
          <div className="mx-1 mb-2 mt-4 text-[11px] uppercase tracking-[.12em] text-white/[0.42]">
            Projects
          </div>
        )}
        <div className="h-3.5" />

        <div
          className={
            mini
              ? "flex flex-col gap-1"
              : "flex max-h-[240px] flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/[0.18] hover:scrollbar-thumb-white/[0.28]"
          }
        >
          {projectList.map((p) => (
            <button
              key={p.name}
              onClick={p.pick}
              title={p.title}
              className={`flex h-11 flex-none items-center gap-2.5 rounded-xl px-3 text-[13.5px] font-semibold transition-colors ${
                p.active
                  ? "border border-white/[0.16] bg-white/[0.13]"
                  : "border border-transparent bg-transparent text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              <span
                className="h-2 w-2 flex-none rounded-full"
                style={{
                  background: p.dotColor,
                  boxShadow: `0 0 8px ${p.dotColor}88`,
                }}
              />

              {!mini && (
                <span className="flex-1 truncate text-left">
                  {p.name}
                </span>
              )}

              {!mini && (
                <span className="font-mono text-[11px] opacity-50">
                  {p.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        {mini && (
          <button
            onClick={openProjectModal}
            title="Create new project hub"
            className="grid h-[38px] w-[38px] place-items-center rounded-xl border border-white/[0.16] bg-white/[0.08] text-base text-[#8ff0c0]"
          >
            +
          </button>
        )}
        {wide && (
          <div className="w-full">
            <div className="flex items-center gap-2 text-[13px] font-semibold">Projects Workspace</div>
            <div className="mt-1.5 text-xs leading-[1.5] text-white/60">
              Organize and group document indexes cleanly.
            </div>
            <button
              onClick={openProjectModal}
              className="mt-3 h-[34px] w-full rounded-[11px] border border-[#5fe3a1]/[0.32] bg-[#5fe3a1]/[0.12] text-[12.5px] font-semibold text-[#8ff0c0] transition-colors hover:bg-[#5fe3a1]/20"
            >
              + Add project
            </button>
          </div>
        )}
      </div>

      <div className={cardClass}>
        {mini && (
          <button
            onClick={goAssigned}
            title="Assigned to me"
            className="relative grid h-[38px] w-[38px] place-items-center rounded-xl border border-white/[0.16] bg-white/[0.08] text-sm text-inherit"
          >
            ✓
          </button>
        )}
        {wide && (
          <div>
            <div className="flex items-center gap-2 text-[13px] font-semibold">Assigned to me</div>
            <div className="mt-1.5 text-xs leading-[1.5] text-white/60">Review documents assigned to you.</div>
            <button
              onClick={goAssigned}
              className="mt-3 h-[34px] w-full rounded-[11px] border border-white/[0.18] bg-white/[0.09] text-[12.5px] font-semibold text-inherit transition-colors hover:bg-white/[0.16]"
            >
              View assigned docs
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
