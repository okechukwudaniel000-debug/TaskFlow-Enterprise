/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";
import { RADIUS } from "../../utils/themeTokens";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  name = "",
  size = "md",
  className = "",
  ...props
}) => {
  const { colors } = useMilitaryTheme();
  const [hasError, setHasError] = useState(false);

  // Generate initials (up to 2 letters)
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "HQ";

  // Sizes dictionary
  const sizes = {
    xs: "w-5 h-5 text-[8px]",
    sm: "w-7 h-7 text-[9px]",
    md: "w-9 h-9 text-[10px]",
    lg: "w-11 h-11 text-xs",
    xl: "w-14 h-14 text-sm font-bold",
  };

  // Generate deterministic subtle military-grade background variants based on initials
  const getAvatarBg = (str: string) => {
    const sum = str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bgColors = [
      "bg-[#1d3224] text-[#8cb891] border border-[#2b3f31]", // Sage
      "bg-[#2d1212] text-[#ef4444] border border-[#7f1d1d]", // Crimson Stealth
      "bg-[#44382c] text-[#e2b07a] border border-[#5c4e3f]", // coyote
      "bg-[#152737] text-[#9fcbe0] border border-[#25364b]", // Arctic Blue
      "bg-[#1d2d22] text-[#a3c2a6] border border-[#2b3f31]", // Tactical Olive
    ];
    return bgColors[sum % bgColors.length];
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 select-none font-mono font-bold tracking-wider ${
        sizes[size]
      } ${RADIUS.full} ${!src || hasError ? getAvatarBg(name || initials) : `bg-black/50 border ${colors.border}`} ${className}`}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || name || "Operator Avatar"}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
