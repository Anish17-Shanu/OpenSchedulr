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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="aurora-orb left-[8%] top-[10%] h-56 w-56 bg-indigo-500/28" />
      <div className="aurora-orb right-[10%] top-[15%] h-64 w-64 bg-sky-400/18" style={{ animationDelay: "1.2s" }} />
      <div className="aurora-orb bottom-[10%] left-[22%] h-72 w-72 bg-emerald-500/18" style={{ animationDelay: "2.3s" }} />

      <div className="grid w-full max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_36px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(99,102,241,0.22),transparent_24%),radial-gradient(circle_at_82%_8%,rgba(56,189,248,0.16),transparent_24%),linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]" />
          <div className="relative animate-rise">
            <div className="section-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              Scheduling studio
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-white/48">OpenSchedulr</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              A modern control room for faculty scheduling.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/64">
              Build, review, and publish conflict-aware timetables with a cleaner interface, richer filtering, and a workflow that feels closer to a real product than a basic admin panel.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/64">
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">Realtime updates</span>
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">Drag-and-drop review</span>
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">Free deployment</span>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="card">
                <p className="text-2xl font-semibold text-white">Java 21</p>
                <p className="mt-2 text-sm text-white/58">Spring Boot and scheduling backend</p>
              </div>
              <div className="card">
                <p className="text-2xl font-semibold text-white">Planner views</p>
                <p className="mt-2 text-sm text-white/58">Faculty, room, section, batch, and program filters</p>
              </div>
              <div className="card">
                <p className="text-2xl font-semibold text-white">Zero cost</p>
                <p className="mt-2 text-sm text-white/58">Self-hosted or free-tier deployable</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/6 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">What the flow looks like</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <FlowStep
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Set up"
                  text="Configure faculty, courses, rooms, slots, batches, and lecture demand."
                />
                <FlowStep
                  icon={<Zap className="h-4 w-4" />}
                  title="Generate"
                  text="Create a timetable draft quickly, then inspect it through sorted timetable views."
                />
                <FlowStep
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Publish"
                  text="Finalize the schedule once conflicts, workload, and room usage look clean."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mesh-card relative p-8 lg:p-12">
          <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22),transparent_68%)]" />
          <div className="relative animate-fade-delay">
            <div className="section-kicker">Sign in</div>
            <h2 className="mt-5 text-3xl font-semibold text-white">Enter the workspace</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              Use the hosted credentials below or replace them with your own environment-specific admin account.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-[0_28px_60px_rgba(0,0,0,0.24)]">
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-white/48">Email</label>
                  <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@openschedulr.dev" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-white/48">Password</label>
                  <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
                </div>
                <Button className="w-full py-3 text-base" onClick={() => mutation.mutate()}>
                  {mutation.isPending ? "Signing in..." : "Access dashboard"}
                </Button>
                {mutation.isError ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    Login failed. Check backend credentials or API availability.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Hosted credentials</p>
                <div className="mt-4 space-y-3 text-sm text-white/72">
                  <p><span className="font-semibold text-white">Admin:</span> admin@openschedulr.dev / ChangeThisAdminPassword123!</p>
                  <p><span className="font-semibold text-white">Fallback local:</span> admin@openschedulr.dev / Admin@123</p>
                  <p><span className="font-semibold text-white">Note:</span> a Render env override still wins if `BOOTSTRAP_ADMIN_PASSWORD` is set.</p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Experience goal</p>
                <p className="mt-3 text-lg font-semibold text-white">Cleaner, more premium, more understandable.</p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  This UI pass aims to make OpenSchedulr feel like a modern scheduling product, not a plain CRUD screen.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FlowStep({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-white/78">
        {icon}
        <p className="font-semibold text-white">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
    </div>
  );
}
