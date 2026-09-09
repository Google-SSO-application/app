export default function LoginPage({ loginPoints, signIn }) {
  return (
    <div className="relative z-[2] flex min-h-screen items-center justify-center p-[clamp(20px,4vw,48px)]">
      <div className="flex w-[min(1080px,100%)] flex-wrap items-stretch gap-[clamp(18px,3vw,32px)]">

        {/* Left: marketing copy */}
        <div className="flex min-w-[300px] flex-[1_1_380px] flex-col justify-center p-[clamp(8px,2vw,20px)]">
          <div className="flex items-center gap-[11px]">
            <div className="grid h-[38px] w-[38px] place-items-center rounded-[13px] border border-white/[0.24] bg-gradient-to-br from-white/40 to-white/[0.08] text-[17px]">
              ◈
            </div>
            <div className="text-[17px] font-bold tracking-[-.02em]">Atlas</div>
          </div>

          <div className="mt-[26px] text-[clamp(30px,4.6vw,46px)] font-bold leading-[1.08] tracking-[-.035em] [text-wrap:pretty]">
            Every answer your team already wrote down.
          </div>
          <div className="mt-3.5 max-w-[44ch] text-[15px] leading-[1.6] text-white/[0.62] [text-wrap:pretty]">
            Atlas indexes your uploads, Drive folders, READMEs and saved articles — plus the threads your colleagues have already answered.
          </div>

          <div className="mt-7 flex flex-col gap-3">
            {loginPoints.map((p, i) => (
              <div key={i} className="flex items-start gap-[13px]">
                <div className="grid h-[34px] w-[34px] flex-none place-items-center rounded-xl border border-white/[0.14] bg-white/[0.08] text-sm">
                  {p.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{p.t}</div>
                  <div className="mt-[3px] text-[13px] leading-[1.55] text-white/[0.58] [text-wrap:pretty]">{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: sign-in card */}
        <div className="flex min-w-[300px] flex-[0_1_400px]">
          <div className="relative flex w-full flex-col justify-center overflow-hidden rounded-[30px] border border-white/[0.17] bg-gradient-to-br from-white/[0.14] to-white/5 p-[clamp(24px,3vw,36px)_clamp(22px,3vw,32px)_28px] shadow-[inset_0_1px_0_rgba(255,255,255,.38),0_34px_80px_rgba(0,0,0,.55)] backdrop-blur-[34px] backdrop-saturate-[1.85]">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-[45%] animate-sheen bg-gradient-to-r from-white/0 via-white/[0.09] to-white/0" />

            <div className="text-[22px] font-bold tracking-[-.025em]">Sign in</div>
            <div className="mt-[7px] text-[13.5px] leading-[1.55] text-white/60">
              Use your work Google account. Access follows your existing project groups.
            </div>

            <button
              onClick={signIn}
              className="mt-6 flex h-[52px] w-full items-center justify-center gap-[11px] rounded-2xl border border-white/[0.22] bg-gradient-to-br from-white/[0.94] to-white/[0.74] text-[15px] font-semibold text-[#12142a] shadow-[0_14px_34px_rgba(0,0,0,.42)] transition-[filter] hover:brightness-[1.06]"
            >
              <span className="inline-block h-[22px] w-[22px] rounded-full bg-[conic-gradient(from_-35deg,#ea4335,#fbbc05,#34a853,#4285f4,#ea4335)]" />
              Continue with Google
            </button>

            <div className="mt-[22px] flex items-center gap-[9px] text-xs leading-[1.5] text-white/50">
              <span className="h-[7px] w-[7px] flex-none rounded-full bg-[#5fe3a1] shadow-[0_0_8px_#5fe3a1]" />
              Drive stays read-only until you choose folders to sync.
            </div>
            <div className="mt-3.5 text-[11.5px] leading-[1.6] text-white/[0.38]">
              By continuing you agree to the internal <a href="#terms">usage policy</a>. Trouble signing in? <a href="#help">Ask IT</a>.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
