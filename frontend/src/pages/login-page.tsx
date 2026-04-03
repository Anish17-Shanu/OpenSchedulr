// SAME IMPORTS (UNCHANGED)

export function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("admin@openschedulr.dev");
  const [password, setPassword] = useState("ChangeThisAdminPassword123!");

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => setAuth(data.token, data.email, data.role)
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_80%_90%,rgba(34,197,94,0.15),transparent_30%),#05070f] text-white">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[10%] h-60 w-60 bg-indigo-500/30 blur-[120px] rounded-full" />
        <div className="absolute right-[10%] bottom-[10%] h-72 w-72 bg-emerald-500/25 blur-[140px] rounded-full" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.6)] lg:grid-cols-[1.2fr_0.8fr]">

        {/* LEFT HERO */}
        <div className="relative p-10 md:p-12 space-y-6">

          <div className="section-kicker bg-white/10 text-white/70">
            Scheduling studio
          </div>

          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            A calmer way to build and adjust schedules.
          </h1>

          <p className="text-white/60 leading-7 max-w-lg">
            Generate conflict-aware timetables, rebalance workload, and publish schedule changes with a modern experience.
          </p>

          {/* FEATURE TAGS */}
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-widest text-white/60">
            <span className="px-3 py-2 rounded-full bg-white/10">Modern UI</span>
            <span className="px-3 py-2 rounded-full bg-white/10">Realtime</span>
            <span className="px-3 py-2 rounded-full bg-white/10">Zero cost</span>
          </div>

          {/* METRICS */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <div className="card">
              <p className="text-xl font-semibold">Java 21</p>
              <p className="text-sm text-white/60">Backend</p>
            </div>

            <div className="card">
              <p className="text-xl font-semibold">Realtime</p>
              <p className="text-sm text-white/60">Live updates</p>
            </div>

            <div className="card">
              <p className="text-xl font-semibold">Free</p>
              <p className="text-sm text-white/60">Deployment</p>
            </div>
          </div>

          {/* FLOW SECTION */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase text-white/50">Workflow</p>

            <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm text-white/70">
              <div>
                <p className="text-lg font-semibold">1</p>
                <p>Setup data</p>
              </div>

              <div>
                <p className="text-lg font-semibold">2</p>
                <p>Generate timetable</p>
              </div>

              <div>
                <p className="text-lg font-semibold">3</p>
                <p>Publish schedule</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN */}
        <div className="relative p-10 md:p-12 space-y-6">

          <h2 className="text-3xl font-semibold">Sign in</h2>

          <div className="space-y-4">
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />

            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <Button
            className="w-full py-3 text-lg"
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Signing in..." : "Access Dashboard"}
          </Button>

          {mutation.isError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
              Login failed. Check credentials.
            </div>
          )}

          {/* INFO CARDS */}
          <div className="grid gap-4 pt-4">
            <div className="card text-sm text-white/70">
              <p className="font-semibold">Admin</p>
              <p>admin@openschedulr.dev</p>
            </div>

            <div className="card text-sm text-white/70">
              <p className="font-semibold">Product feel</p>
              <p>Designed as a modern scheduling studio.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}