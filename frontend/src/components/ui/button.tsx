import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "default" && "bg-[linear-gradient(135deg,#7b61ff,#5b9bff)] text-white shadow-[0_14px_30px_rgba(91,155,255,0.22)] hover:shadow-[0_18px_36px_rgba(123,97,255,0.24)]",
        variant === "outline" && "border border-slate-200 bg-white text-slate-700 shadow-[0_8px_24px_rgba(18,27,44,0.05)] hover:bg-slate-50",
        variant === "secondary" && "bg-slate-900 text-white shadow-[0_12px_28px_rgba(18,27,44,0.14)] hover:bg-slate-800",
        className
      )}
      {...props}
    />
  );
}
