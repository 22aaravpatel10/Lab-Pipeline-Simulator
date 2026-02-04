import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-full border text-sm font-medium transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
          variant === "primary" &&
            "border-terracotta bg-terracotta text-white hover:bg-[#c4684a]",
          variant === "ghost" &&
            "border-transparent bg-transparent text-ink hover:bg-neutral-100",
          variant === "outline" &&
            "border-neutral-300 bg-white text-ink hover:bg-neutral-100",
          size === "sm" && "h-8 px-3",
          size === "md" && "h-10 px-4",
          size === "lg" && "h-12 px-6 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
