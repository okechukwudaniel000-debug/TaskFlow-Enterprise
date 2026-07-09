/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";

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
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 block"
          >
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-zinc-600 pointer-events-none shrink-0 flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`w-full bg-[#0a0a0a] text-xs text-neutral-200 placeholder-zinc-700 border rounded-md outline-none transition-all duration-150 font-sans ${
              leftIcon ? "pl-9" : "px-3.5"
            } ${
              rightIcon ? "pr-9" : "px-3.5"
            } py-2 ${
              error 
                ? "border-red-950 hover:border-red-900 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/30" 
                : "border-neutral-800 hover:border-neutral-700 focus:border-neutral-600 focus:ring-1 focus:ring-blue-500/20"
            } ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-zinc-600 pointer-events-none shrink-0 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p 
            id={`${inputId}-error`} 
            className="text-[10px] font-mono font-medium text-red-400 mt-1"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p 
            id={`${inputId}-helper`} 
            className="text-[10px] font-mono text-zinc-600 mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
