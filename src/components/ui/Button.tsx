/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";
import { TYPOGRAPHY, RADIUS } from "../../utils/themeTokens";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
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
    const { colors } = useMilitaryTheme();
    
    // Base tactical styles - sharp corners, geometric focus, monospace feel
    const baseStyles = `inline-flex items-center justify-center font-mono font-bold tracking-wider uppercase transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.98] border`;
    
    // Variant styles referencing the centralized theme tokens
    const variants = {
      primary: `${colors.primary} focus-visible:ring-[#8cb891]`,
      secondary: `bg-transparent hover:bg-neutral-800/40 text-neutral-300 ${colors.border} hover:border-neutral-500 shadow-sm`,
      outline: `bg-transparent text-neutral-400 ${colors.border} hover:text-white hover:bg-white/[0.02]`,
      ghost: `bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-white/[0.04]`,
      danger: `${colors.critical} shadow-sm font-bold`,
      success: `${colors.completed} shadow-sm font-bold`,
    };

    const sizes = {
      xs: "px-2.5 py-1 text-[9px] gap-1.5",
      sm: "px-3.5 py-1.5 text-[10px] gap-1.5",
      md: "px-4.5 py-2 text-[11px] gap-2",
      lg: "px-5.5 py-2.5 text-xs gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseStyles} ${RADIUS.sm} ${variants[variant]} ${sizes[size]} ${className}`}
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
