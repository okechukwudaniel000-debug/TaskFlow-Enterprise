/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";

export const TacticalBackground: React.FC = () => {
  const { activeTheme } = useMilitaryTheme();

  // Create subtle grid lines and dynamic coordinate values
  const coordinates = useMemo(() => {
    return {
      lat: "38° 53' 42.4\" N",
      lng: "77° 02' 12.0\" W",
      sector: "NATO-SEC-049",
      sysTime: "SYS: 2026.07-09"
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Tactical Mesh Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* 2. Secondary fine grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px",
        }}
      />

      {/* 3. Dynamic Topographic Contour Maps / Blueprint curves (Using CSS SVG) */}
      <svg className="absolute w-[800px] h-[800px] -top-24 -right-24 opacity-[0.02] text-current" viewBox="0 0 100 100">
        <path d="M10,10 C30,15 45,5 70,25 C90,40 85,75 100,100" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <path d="M20,10 C40,25 55,15 80,35 C95,50 90,85 100,110" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <path d="M0,20 C20,35 35,25 60,45 C80,60 75,95 90,120" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <path d="M40,5 C55,15 65,5 85,25 C100,40 95,75 110,100" fill="none" stroke="currentColor" strokeWidth="0.15" />
        <circle cx="70" cy="25" r="5" fill="none" stroke="currentColor" strokeWidth="0.08" strokeDasharray="0.5,0.5" />
        <circle cx="70" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="0.08" strokeDasharray="1,1" />
        <line x1="70" y1="5" x2="70" y2="45" stroke="currentColor" strokeWidth="0.05" strokeDasharray="0.8,0.8" />
        <line x1="50" y1="25" x2="90" y2="25" stroke="currentColor" strokeWidth="0.05" strokeDasharray="0.8,0.8" />
      </svg>

      {/* 4. Left/Right Margin Strategic Coordinates */}
      <div className="absolute top-16 left-3 font-mono text-[8px] opacity-[0.15] text-current tracking-widest hidden lg:block uppercase rotate-90 origin-top-left">
        LAT: {coordinates.lat} // LNG: {coordinates.lng}
      </div>

      <div className="absolute bottom-16 right-3 font-mono text-[8px] opacity-[0.15] text-current tracking-widest hidden lg:block uppercase -rotate-90 origin-bottom-right">
        SECTOR ID: {coordinates.sector} // {coordinates.sysTime}
      </div>

      {/* 5. Minimal corner brackets on outer layout edge */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-current opacity-15 hidden md:block" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-current opacity-15 hidden md:block" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-current opacity-15 hidden md:block" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-current opacity-15 hidden md:block" />
    </div>
  );
};
