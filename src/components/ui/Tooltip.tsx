/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RADIUS, SHADOWS } from "../../utils/themeTokens";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 300,
}) => {
  const { colors } = useMilitaryTheme();
  const [isOpen, setIsOpen] = useState(false);
  let timeout: NodeJS.Timeout;

  const show = () => {
    timeout = setTimeout(() => setIsOpen(true), delay);
  };

  const hide = () => {
    clearTimeout(timeout);
    setIsOpen(false);
  };

  const placement = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-55 pointer-events-none whitespace-nowrap bg-[#0b0c0e]/95 border border-neutral-700 font-mono text-[9px] uppercase tracking-wider font-bold text-neutral-300 px-2.5 py-1.5 ${RADIUS.sm} ${SHADOWS.tactical} ${placement[position]}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
