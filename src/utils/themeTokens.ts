/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// -----------------------------------------------------------------------------
// CENTRAL DESIGN SYSTEM TOKENS FOR THE MILITARY-GRADE OPERATIONS COMMAND CENTER
// -----------------------------------------------------------------------------

export type MilitaryThemeType = "forest" | "night" | "desert" | "arctic";

export interface ThemeColors {
  name: string;
  id: MilitaryThemeType;
  bgDark: string;       // Deep background #0
  bgPanel: string;      // Panel background #1
  bgCard: string;       // Card container background #2
  bgHover: string;      // Interactive hover state
  border: string;       // Subtle structural border
  borderMuted: string;  // Extra muted divider lines
  
  primary: string;      // Primary action color
  primaryHover: string; // Primary hover color
  accent: string;       // High-visibility tactical element (highlights, alerts)
  accentBg: string;     // Accent background tint
  
  textPrimary: string;  // High contrast white/off-white text
  textMuted: string;    // Muted grey/zinc text
  textTactical: string; // Monospace data text (yellow-green, cyan, or gold)

  // Status Colors (WCAG compliant with theme background)
  critical: string;     // Red / Critical priority
  warning: string;      // Amber / High priority
  medium: string;       // Olive / Medium priority
  low: string;          // Soft Sage / Low priority
  completed: string;    // Tactical Green / Finished state
}

export const THEMES: Record<MilitaryThemeType, ThemeColors> = {
  forest: {
    name: "Forest Command (Standard NATO)",
    id: "forest",
    bgDark: "bg-[#0c140f]",
    bgPanel: "bg-[#121f17]",
    bgCard: "bg-[#18281e]/85",
    bgHover: "hover:bg-[#203628] hover:border-[#3a5241]",
    border: "border-[#2b3f31]",
    borderMuted: "border-[#1d2d22]",
    
    primary: "bg-emerald-800 text-emerald-100 hover:bg-emerald-700 hover:border-emerald-500 border border-emerald-800 shadow-md",
    primaryHover: "bg-emerald-700",
    accent: "text-[#8cb891]",
    accentBg: "bg-[#1d3224]",
    
    textPrimary: "text-[#eaf2eb]",
    textMuted: "text-[#8fa394]",
    textTactical: "text-[#a3c2a6]",

    critical: "bg-[#5c1d1d] text-[#ff9999] border-[#8a2b2b]",
    warning: "bg-[#5c3e1d] text-[#ffcc99] border-[#8a5d2b]",
    medium: "bg-[#3d421d] text-[#e3e6b8] border-[#5e632e]",
    low: "bg-[#203024] text-[#a3cfa9] border-[#314a38]",
    completed: "bg-[#113821] text-[#76df91] border-[#1f5936]",
  },
  night: {
    name: "Tactical Night (Stealth SOC)",
    id: "night",
    bgDark: "bg-[#07070a]",
    bgPanel: "bg-[#0e0e14]",
    bgCard: "bg-[#14141d]/90",
    bgHover: "hover:bg-[#20202e] hover:border-[#38384f]",
    border: "border-[#252535]",
    borderMuted: "border-[#171722]",
    
    primary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-500 border border-zinc-700 shadow-md",
    primaryHover: "bg-zinc-700",
    accent: "text-[#d15454]",
    accentBg: "bg-[#2d1212]",
    
    textPrimary: "text-[#f3f4f6]",
    textMuted: "text-[#9ca3af]",
    textTactical: "text-[#ef4444]", // Red-dot sight accent

    critical: "bg-[#451010] text-[#fca5a5] border-[#7f1d1d]",
    warning: "bg-[#452710] text-[#fed7aa] border-[#7f3f1d]",
    medium: "bg-[#25252e] text-[#cbd5e1] border-[#475569]",
    low: "bg-[#13141f] text-[#94a3b8] border-[#1e293b]",
    completed: "bg-[#103020] text-[#86efac] border-[#15803d]",
  },
  desert: {
    name: "Desert Operations (Coyote Command)",
    id: "desert",
    bgDark: "bg-[#1a1612]",
    bgPanel: "bg-[#26201a]",
    bgCard: "bg-[#322a22]/85",
    bgHover: "hover:bg-[#40362b] hover:border-[#5c4e3f]",
    border: "border-[#4a3e33]",
    borderMuted: "border-[#372e26]",
    
    primary: "bg-[#7d5d3b] text-[#fbf8f3] hover:bg-[#967149] hover:border-[#bd956b] border border-[#7d5d3b] shadow-md",
    primaryHover: "bg-[#967149]",
    accent: "text-[#dfbe9d]",
    accentBg: "bg-[#44382c]",
    
    textPrimary: "text-[#f9f6f0]",
    textMuted: "text-[#c2b6a9]",
    textTactical: "text-[#e2b07a]",

    critical: "bg-[#541a1a] text-[#fca5a5] border-[#8a2222]",
    warning: "bg-[#543b1a] text-[#fde047] border-[#8a5d22]",
    medium: "bg-[#473c1d] text-[#eab308] border-[#715f2c]",
    low: "bg-[#2f271f] text-[#d97706] border-[#4b3d31]",
    completed: "bg-[#1a3821] text-[#4ade80] border-[#226633]",
  },
  arctic: {
    name: "Arctic Command (Sub-Zero Logistics)",
    id: "arctic",
    bgDark: "bg-[#0b1016]",
    bgPanel: "bg-[#111923]",
    bgCard: "bg-[#182331]/85",
    bgHover: "hover:bg-[#203043] hover:border-[#384e6a]",
    border: "border-[#25364b]",
    borderMuted: "border-[#1a2635]",
    
    primary: "bg-[#314a60] text-sky-100 hover:bg-[#436480] hover:border-sky-400 border border-[#314a60] shadow-md",
    primaryHover: "bg-[#436480]",
    accent: "text-[#9fcbe0]",
    accentBg: "bg-[#152737]",
    
    textPrimary: "text-[#ecf3f7]",
    textMuted: "text-[#93a6b5]",
    textTactical: "text-[#38bdf8]",

    critical: "bg-[#541e1e] text-[#f87171] border-[#8a2929]",
    warning: "bg-[#54411e] text-[#fbbf24] border-[#8a6829]",
    medium: "bg-[#1a3245] text-[#7dd3fc] border-[#2d587a]",
    low: "bg-[#131d2b] text-[#94a3b8] border-[#20314a]",
    completed: "bg-[#103b29] text-[#34d399] border-[#185e42]",
  },
};

// Layout Spacing Design Tokens
export const SPACING = {
  xs: "p-1.5 md:p-2",
  sm: "p-3 md:p-3.5",
  md: "p-5 md:p-6",
  lg: "p-8 md:p-10",
  gapXs: "gap-1.5 md:gap-2",
  gapSm: "gap-3 md:gap-4",
  gapMd: "gap-5 md:gap-6",
  railWidth: "w-64",
};

// Radius Design Tokens
export const RADIUS = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
  militaryCorner: "rounded-[4px] border-tl-[8px]", // Angled feel
};

// Typography Design Tokens
export const TYPOGRAPHY = {
  headingDisplay: "font-mono font-bold tracking-tight uppercase",
  headingSub: "font-mono font-semibold tracking-wider uppercase text-xs",
  bodyText: "font-sans text-xs leading-relaxed",
  monoText: "font-mono text-[10px] tracking-wide",
};

// Drop Shadows (Tactical feel)
export const SHADOWS = {
  subtle: "shadow-sm shadow-black/10",
  standard: "shadow-md shadow-black/30",
  tactical: "shadow-lg shadow-black/60 border-opacity-40",
  panel: "shadow-2xl shadow-black/80",
};

// Standard spring animations for micro-interactions
export const TRANSITIONS = {
  springComfortable: { type: "spring", stiffness: 260, damping: 25 },
  springQuick: { type: "spring", stiffness: 400, damping: 30 },
  fadeFast: { duration: 0.15, ease: "easeOut" },
  staggerDelay: 0.05,
};
