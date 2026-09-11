export default function AppHeader({ query, onQuery, toggleNav, openUpload, openGlobalTag, signOut, currentUser }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/[0.09] bg-gradient-to-b from-[#0c0e1c]/75 to-[#0c0e1c]/45 px-[clamp(14px,3vw,28px)] py-3 backdrop-blur-2xl backdrop-saturate-[1.7]">
      <button
        onClick={toggleNav}
        className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.07] text-[15px] text-inherit"
      >
        ☰
      </button>

      <div className="flex flex-none items-center gap-2.5">
        <div className="grid h-[30px] w-[30px] place-items-center rounded-[10px] border border-white/[0.22] bg-gradient-to-br from-white/40 to-white/[0.08] text-sm">
          ◈
        </div>
        <div className="whitespace-nowrap text-[15px] font-bold tracking-[-.02em]">Atlas</div>
      </div>

      <div className="relative flex max-w-[640px] flex-1 items-center">
        <span className="absolute left-4 text-sm opacity-50">⌕</span>
        <input
          value={query}
          onChange={onQuery}
          placeholder="Search docs, READMEs, threads…"
          className="h-[42px] w-full rounded-2xl border border-white/[0.14] bg-white/[0.07] py-0 pl-10 pr-[84px] text-sm text-[#eef0ff] outline-none backdrop-blur-lg transition-colors focus:border-[#a9b4ff]/[0.55] focus:bg-white/[0.11]"
        />
        <span className="absolute right-3.5 rounded-lg border border-white/[0.14] px-2 py-1 font-mono text-[11px] text-white/50">
          ⌘K
        </span>
      </div>

      <div className="ml-auto flex flex-none items-center gap-2.5">
        <button
          onClick={openGlobalTag}
          title="Create global tag"
          className="h-[38px] whitespace-nowrap rounded-xl border border-[#5fe3a1]/[0.28] bg-[#5fe3a1]/10 px-3.5 text-[13px] font-semibold text-[#8ff0c0] transition-colors hover:bg-[#5fe3a1]/[0.18]"
        >
          Create Tag
        </button>
        <button
          onClick={openUpload}
          className="h-[38px] whitespace-nowrap rounded-xl border border-white/20 bg-gradient-to-br from-white/20 to-white/[0.07] px-4 text-[13px] font-semibold text-inherit transition-colors hover:bg-white/[0.18]"
        >
          ＋ Upload
        </button>
        <button
          onClick={signOut}
          title="Sign out"
          className="grid h-[34px] w-[34px] place-items-center overflow-hidden rounded-full text-xs font-bold transition-[filter] hover:brightness-110"
        >
          {currentUser.picture ? (
                <img src={currentUser.picture} alt={currentUser.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-[#8b7bff] to-[#38d0d6] text-xs font-semibold text-[#0b0c18]">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
        </button>
      </div>
    </header>
  );
}
