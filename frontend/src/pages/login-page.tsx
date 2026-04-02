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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(31,92,75,0.18),_transparent_30%),linear-gradient(135deg,#f4efe6,#dce6e9)] px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white/40 bg-white/85 p-8 shadow-panel backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-moss">OpenSchedulr</p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Faculty scheduling without paid infrastructure.</h1>
        <p className="mt-3 text-sm text-ink/70">Sign in with the seeded admin or faculty credentials and manage the timetable in real time.</p>
        <div className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-mist bg-sand px-4 py-3 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-2xl border border-mist bg-sand px-4 py-3 outline-none" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full py-3" onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Signing in..." : "Access dashboard"}
          </Button>
          {mutation.isError ? <p className="text-sm text-ember">Login failed. Check backend credentials or API availability.</p> : null}
        </div>
      </div>
    </div>
  );
}
