import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { login } from "../lib/api";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/auth-store";

export function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("admin@openschedulr.dev");
  const [password, setPassword] = useState("Admin@123");

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => setAuth(data.token, data.email, data.role)
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(217,108,61,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(31,92,75,0.22),_transparent_30%),linear-gradient(135deg,#f4efe6,#dce6e9)] px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/50 bg-white/75 shadow-panel backdrop-blur lg:grid-cols-[1.15fr_0.85fr]">
        <div className="bg-[linear-gradient(140deg,rgba(16,37,66,0.97),rgba(31,92,75,0.9))] p-8 text-white md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/65">OpenSchedulr</p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight">A calmer way to build and adjust faculty schedules.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
            Generate conflict-aware timetables, rebalance workload, and publish schedule changes without paid infrastructure or manual spreadsheet chaos.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">Java 21</p>
              <p className="mt-2 text-sm text-white/70">Spring Boot and OptaPlanner backend</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">Realtime</p>
              <p className="mt-2 text-sm text-white/70">Live notifications for every timetable change</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">Zero cost</p>
              <p className="mt-2 text-sm text-white/70">Free-tier and self-hosted deployment ready</p>
            </div>
          </div>
        </div>
        <div className="p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-moss">Sign in</p>
          <h2 className="mt-4 text-3xl font-semibold text-ink">Enter the scheduling workspace</h2>
          <p className="mt-3 text-sm leading-7 text-ink/70">Use the seeded credentials below or replace them with your own once the system is connected to your production database.</p>
          <div className="mt-8 space-y-4">
            <input className="w-full rounded-2xl border border-white/70 bg-sand/70 px-4 py-3 outline-none ring-0 transition focus:border-moss/40" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full rounded-2xl border border-white/70 bg-sand/70 px-4 py-3 outline-none ring-0 transition focus:border-moss/40" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button className="w-full py-3" onClick={() => mutation.mutate()}>
              {mutation.isPending ? "Signing in..." : "Access dashboard"}
            </Button>
            {mutation.isError ? <p className="rounded-2xl border border-ember/20 bg-ember/5 px-4 py-3 text-sm text-ember">Login failed. Check backend credentials or API availability.</p> : null}
          </div>
          <div className="mt-8 rounded-3xl border border-ink/8 bg-mist/35 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/50">Demo credentials</p>
            <div className="mt-4 space-y-3 text-sm text-ink/75">
              <p><span className="font-semibold text-ink">Admin:</span> admin@openschedulr.dev / Admin@123</p>
              <p><span className="font-semibold text-ink">Faculty:</span> faculty1@openschedulr.dev / Faculty@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
