import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-2xl px-4 py-2 text-sm font-medium transition",
        variant === "default" && "bg-ink text-white",
        variant === "outline" && "border border-white/20 bg-transparent text-current",
        variant === "secondary" && "bg-white text-ink",
        className
      )}
      {...props}
    />
  );
}
