/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Styling dictionaries
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";
    
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-500 text-white border border-blue-600 shadow shadow-blue-950/20 active:scale-[0.98]",
      secondary: "bg-[#1a1a1a] hover:bg-[#252525] text-neutral-200 border border-neutral-800 hover:border-neutral-700 active:scale-[0.98]",
      outline: "bg-transparent hover:bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-700 active:scale-[0.98]",
      ghost: "bg-transparent hover:bg-[#111111] text-zinc-400 hover:text-white border border-transparent",
      danger: "bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900/30 active:scale-[0.98]",
    };

    const sizes = {
      xs: "px-2.5 py-1 text-[10px] gap-1.5",
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-xs gap-2",
      lg: "px-5 py-2.5 text-sm gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
