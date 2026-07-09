/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  children,
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId: NodeJS.Timeout;

  const showTooltip = () => {
    timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  // Position offset mappings
  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const animDirection = {
    top: { y: 4, x: "-50%" },
    bottom: { y: -4, x: "-50%" },
    left: { x: 4, y: "-50%" },
    right: { x: -4, y: "-50%" },
  };

  // Clone child to apply dynamic hover and keyboard focus listeners
  const triggerElement = React.cloneElement(children, {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
    "aria-describedby": isVisible ? "tooltip-desc" : undefined,
    tabIndex: children.props.tabIndex ?? 0, // Make sure trigger is focusable
  });

  return (
    <div className="relative inline-block">
      {triggerElement}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id="tooltip-desc"
            role="tooltip"
            initial={{ opacity: 0, ...animDirection[position] }}
            animate={{ opacity: 1, x: position === "left" || position === "right" ? 0 : "-50%", y: 0 }}
            exit={{ opacity: 0, ...animDirection[position] }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 px-2.5 py-1.5 bg-[#121212] border border-neutral-800 text-[10px] text-neutral-300 rounded font-mono shadow-xl pointer-events-none whitespace-nowrap ${positions[position]}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
