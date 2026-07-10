/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from "react";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";
import { RADIUS, SHADOWS } from "../../utils/themeTokens";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverable = false, children, ...props }, ref) => {
    const { colors } = useMilitaryTheme();

    return (
      <div
        ref={ref}
        className={`${colors.bgCard} ${colors.border} ${RADIUS.md} ${SHADOWS.tactical} backdrop-blur-md border border-opacity-75 overflow-hidden transition-all duration-150 ${
          hoverable ? `hover:bg-white/[0.03] cursor-pointer hover:border-neutral-500` : ""
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
  const { colors } = useMilitaryTheme();
  return (
    <div className={`px-5 py-4 bg-white/[0.02] border-b ${colors.borderMuted} flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 className={`text-xs font-mono font-bold text-neutral-100 tracking-wider uppercase ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { colors } = useMilitaryTheme();
  return (
    <p className={`text-[10px] ${colors.textMuted} font-mono tracking-wide uppercase ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-5 text-neutral-300 font-sans text-xs leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { colors } = useMilitaryTheme();
  return (
    <div className={`px-5 py-3.5 bg-white/[0.01] border-t ${colors.borderMuted} flex items-center justify-end gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
};
