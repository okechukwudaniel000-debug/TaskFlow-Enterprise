/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-[#0b0b0b] border border-neutral-800 rounded-xl overflow-hidden shadow shadow-black/40 transition-all duration-150 ${
          hoverable ? "hover:border-neutral-700 hover:bg-[#111111]/30 cursor-pointer" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`px-5 py-4 bg-[#111111]/30 border-b border-neutral-800/60 flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 className={`text-xs font-bold text-neutral-200 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={`text-[10px] text-zinc-500 font-mono tracking-wide ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-5 text-neutral-300 font-sans text-xs ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`px-5 py-3.5 bg-[#111111]/30 border-t border-neutral-800/60 flex items-center justify-end gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
};
