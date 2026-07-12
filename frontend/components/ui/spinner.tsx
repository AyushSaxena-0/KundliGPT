import * as React from "react";
import { cn } from "../../lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "accent" | "white";
}

export function Spinner({ className, size = "md", variant = "primary", ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-t-transparent",
        {
          "h-4 w-4 border-w-1.5": size === "sm",
          "h-8 w-8 border-w-2": size === "md",
          "h-12 w-12 border-w-3": size === "lg",
        },
        {
          "border-primary": variant === "primary",
          "border-accent": variant === "accent",
          "border-white": variant === "white",
        },
        className
      )}
      {...props}
    />
  );
}

export default Spinner;
