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
        variant === "default" && "bg-[linear-gradient(135deg,#102542,#1f5c4b)] text-white shadow-[0_18px_32px_rgba(16,37,66,0.18)] hover:shadow-[0_22px_38px_rgba(16,37,66,0.24)]",
        variant === "outline" && "border border-white/30 bg-white/8 text-current backdrop-blur-sm hover:bg-white/14",
        variant === "secondary" && "bg-white/92 text-ink shadow-[0_10px_28px_rgba(16,37,66,0.12)] hover:bg-white",
        className
      )}
      {...props}
    />
  );
}
