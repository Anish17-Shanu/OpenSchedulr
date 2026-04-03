import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { login } from "../lib/api";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/auth-store";

export function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("admin@openschedulr.dev");
  const [password, setPassword] = useState("ChangeThisAdminPassword123!");

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => setAuth(data.token, data.email, data.role)
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="aurora-orb left-[6%] top-[9%] h-44 w-44 bg-ember/35" />
      <div className="aurora-orb right-[8%] top-[12%] h-52 w-52 bg-sky-200/55" style={{ animationDelay: "1.3s" }} />
      <div className="aurora-orb bottom-[10%] left-[20%] h-56 w-56 bg-moss/25" style={{ animationDelay: "2.1s" }} />
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/50 bg-white/75 shadow-[0_28px_80px_rgba(16,37,66,0.16)] backdrop-blur lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative bg-[linear-gradient(140deg,rgba(16,37,66,0.97),rgba(31,92,75,0.9))] p-8 text-white md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(217,108,61,0.28),transparent_28%)]" />
          <div className="relative animate-rise">
            <div className="section-kicker w-fit bg-white/12 text-white/72 shadow-none">Scheduling studio</div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-white/65">OpenSchedulr</p>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight md:text-5xl">A calmer way to build and adjust faculty schedules.</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
              Generate conflict-aware timetables, rebalance workload, and publish schedule changes without paid infrastructure or manual spreadsheet chaos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-2">Modern planner UI</span>
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-2">Faculty-first workflow</span>
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-2">Free deployment ready</span>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="hero-metric rounded-3xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-semibold">Java 21</p>
                <p className="mt-2 text-sm text-white/70">Spring Boot and OptaPlanner backend</p>
              </div>
              <div className="hero-metric rounded-3xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-semibold">Realtime</p>
                <p className="mt-2 text-sm text-white/70">Live notifications for every timetable change</p>
              </div>
              <div className="hero-metric rounded-3xl border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-semibold">Zero cost</p>
                <p className="mt-2 text-sm text-white/70">Free-tier and self-hosted deployment ready</p>
              </div>
            </div>
            <div className="mt-8 rounded-[1.75rem] border border-white/12 bg-white/8 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">How the product flows</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xl font-semibold">1</p>
                  <p className="mt-2 text-sm text-white/72">Set up faculty, rooms, sections, and subject demand from one control surface.</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">2</p>
                  <p className="mt-2 text-sm text-white/72">Generate a draft and review it through filtered timetable views.</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">3</p>
                  <p className="mt-2 text-sm text-white/72">Publish a cleaner weekly plan with less spreadsheet back-and-forth.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mesh-card relative p-8 md:p-10">
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(217,108,61,0.18),transparent_65%)]" />
          <div className="animate-fade-delay">
            <div className="section-kicker">Sign in</div>
            <h2 className="mt-4 text-3xl font-semibold text-ink">Enter the scheduling workspace</h2>
            <p className="mt-3 text-sm leading-7 text-ink/70">Use the deployment credentials below or replace them with your own once the system is connected to your production database.</p>
            <div className="mt-8 rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-[0_24px_45px_rgba(16,37,66,0.08)]">
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-ink/48">Email</label>
                  <input className="w-full rounded-2xl border border-white/70 bg-sand/70 px-4 py-3 outline-none ring-0 transition focus:border-moss/40" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-ink/48">Password</label>
                  <input className="w-full rounded-2xl border border-white/70 bg-sand/70 px-4 py-3 outline-none ring-0 transition focus:border-moss/40" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full py-3" onClick={() => mutation.mutate()}>
                  {mutation.isPending ? "Signing in..." : "Access dashboard"}
                </Button>
                {mutation.isError ? <p className="rounded-2xl border border-ember/20 bg-ember/5 px-4 py-3 text-sm text-ember">Login failed. This deployment is usually fixed by verifying the Render admin password override and the Vercel API base URL.</p> : null}
              </div>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-ink/8 bg-mist/35 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/50">Hosted credentials</p>
                <div className="mt-4 space-y-3 text-sm text-ink/75">
                  <p><span className="font-semibold text-ink">Admin:</span> admin@openschedulr.dev / ChangeThisAdminPassword123!</p>
                  <p><span className="font-semibold text-ink">Fallback local default:</span> admin@openschedulr.dev / Admin@123</p>
                  <p><span className="font-semibold text-ink">Tip:</span> if Render still has `BOOTSTRAP_ADMIN_PASSWORD` set, that hosted value overrides the built-in project default.</p>
                </div>
              </div>
              <div className="rounded-3xl border border-ink/8 bg-white/72 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/50">Product feel</p>
                <p className="mt-3 text-lg font-semibold text-ink">Built to feel more like a scheduling studio than a form-heavy admin panel.</p>
                <p className="mt-3 text-sm leading-6 text-ink/68">Richer surfaces, clearer action states, and a stronger visual rhythm make the planner easier to scan and more pleasant to use.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
