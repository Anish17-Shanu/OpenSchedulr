import type { PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-3xl border border-white/40 bg-white/85 p-5 shadow-panel", className)}>{children}</div>;
}
