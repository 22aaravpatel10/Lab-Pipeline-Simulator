import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={checked}
      className={cn(
        "relative h-6 w-11 rounded-full border border-neutral-200 transition",
        checked ? "bg-terracotta" : "bg-neutral-200",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  )
);
Switch.displayName = "Switch";
