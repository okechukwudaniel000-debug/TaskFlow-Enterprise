/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";
import { RADIUS, TYPOGRAPHY } from "../../utils/themeTokens";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = "text",
      id,
      ...props
    },
    ref
  ) => {
    const { colors } = useMilitaryTheme();
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className={`text-[9px] font-mono font-bold tracking-widest uppercase ${colors.textMuted} block`}
          >
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-neutral-500 pointer-events-none shrink-0 flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`w-full bg-black/40 text-xs ${colors.textPrimary} placeholder-neutral-600 border rounded-sm outline-none transition-all duration-150 font-sans ${
              leftIcon ? "pl-10" : "px-3.5"
            } ${
              rightIcon ? "pr-10" : "px-3.5"
            } py-2 ${
              error 
                ? "border-red-900/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/20" 
                : `${colors.border} hover:border-neutral-500 focus:border-neutral-400 focus:ring-1 focus:ring-emerald-500/10`
            } ${RADIUS.sm} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-neutral-500 pointer-events-none shrink-0 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p 
            id={`${inputId}-error`} 
            className="text-[10px] font-mono font-medium text-red-400 mt-1 uppercase tracking-wide"
          >
            [ALERT] {error}
          </p>
        )}

        {!error && helperText && (
          <p 
            id={`${inputId}-helper`} 
            className={`text-[9px] font-mono ${colors.textMuted} mt-1`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
