import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Sparkles, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { login } from "../lib/api";
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
      <div className="aurora-orb left-[8%] top-[10%] h-56 w-56 bg-violet-300/55" />
      <div className="aurora-orb right-[10%] top-[14%] h-64 w-64 bg-sky-200/65" style={{ animationDelay: "1.2s" }} />

      <div className="grid w-full max-w-7xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/80 shadow-[0_30px_90px_rgba(18,27,44,0.12)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden border-b border-slate-200 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(123,97,255,0.12),transparent_24%),radial-gradient(circle_at_82%_8%,rgba(91,155,255,0.1),transparent_24%)]" />
          <div className="relative animate-rise">
            <div className="section-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              Scheduling studio
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">OpenSchedulr</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-5xl">
              A cleaner way to build and publish faculty schedules.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
              Generate conflict-aware timetables, review them in a modern board and table layout, and publish with the kind of calm visual flow teams expect from modern planning products.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">Board + table review</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">Realtime updates</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">Zero-cost deployable</span>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <ValueCard title="Java 21" text="Production-grade Spring backend" />
              <ValueCard title="Planner views" text="Faculty, room, section, batch, and program filters" />
              <ValueCard title="Schedule table" text="A proper audit view before publication" />
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-[#fafbff] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Workflow</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <FlowStep icon={<CheckCircle2 className="h-4 w-4" />} title="Set up" text="Configure faculty, rooms, subjects, sections, and teaching demand." />
                <FlowStep icon={<Zap className="h-4 w-4" />} title="Generate" text="Build a timetable draft and review it by board, table, room, or program." />
                <FlowStep icon={<Sparkles className="h-4 w-4" />} title="Publish" text="Lock the clean version once conflicts and workload look right." />
              </div>
            </div>
          </div>
        </section>

        <section className="mesh-card relative p-8 lg:p-12">
          <div className="relative animate-fade-delay">
            <div className="section-kicker">Sign in</div>
            <h2 className="mt-5 text-3xl font-semibold text-slate-900">Enter the workspace</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use the hosted credentials below or swap them for your own admin account after deployment.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_rgba(18,27,44,0.08)]">
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Email</label>
                  <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@openschedulr.dev" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Password</label>
                  <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
                </div>
                <Button className="w-full py-3 text-base" onClick={() => mutation.mutate()}>
                  {mutation.isPending ? "Signing in..." : "Access dashboard"}
                </Button>
                {mutation.isError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    Login failed. Check backend credentials or API availability.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Hosted credentials</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p><span className="font-semibold text-slate-900">Admin:</span> admin@openschedulr.dev / ChangeThisAdminPassword123!</p>
                  <p><span className="font-semibold text-slate-900">Fallback local:</span> admin@openschedulr.dev / Admin@123</p>
                  <p><span className="font-semibold text-slate-900">Note:</span> a Render env override still wins if `BOOTSTRAP_ADMIN_PASSWORD` is set.</p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">UI direction</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">Lighter, calmer, and closer to modern planner products.</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The product now leans into softer cards, cleaner spacing, brighter surfaces, and stronger schedule readability.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="card">
      <p className="text-2xl font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function FlowStep({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#6b57e7]">
        {icon}
        <p className="font-semibold text-slate-900">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
