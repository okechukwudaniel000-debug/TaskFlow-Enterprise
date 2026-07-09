/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";

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
  const [hasError, setHasError] = useState(false);

  // Generate initials (up to 2 letters)
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  // Sizes dictionary
  const sizes = {
    xs: "w-5 h-5 text-[8px]",
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-16 h-16 text-lg font-bold",
  };

  // Generate deterministic subtle colors based on initials for aesthetic variation
  const getAvatarBg = (str: string) => {
    const sum = str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bgColors = [
      "bg-blue-950/40 text-blue-400 border border-blue-900/40",
      "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40",
      "bg-amber-950/40 text-amber-400 border border-amber-900/40",
      "bg-purple-950/40 text-purple-400 border border-purple-900/40",
      "bg-sky-950/40 text-sky-400 border border-sky-900/40",
      "bg-rose-950/40 text-rose-400 border border-rose-900/40",
    ];
    return bgColors[sum % bgColors.length];
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none font-mono font-semibold ${
        sizes[size]
      } ${!src || hasError ? getAvatarBg(name || initials) : "bg-[#181818] border border-neutral-800"} ${className}`}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || name || "User Avatar"}
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
