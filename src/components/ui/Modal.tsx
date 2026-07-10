/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";
import { RADIUS, SHADOWS } from "../../utils/themeTokens";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  footer,
}) => {
  const { colors } = useMilitaryTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus saving & restoration + Escape hotkey support
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  const modalMarkup = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            className={`w-full ${sizes[size]} ${colors.bgPanel} ${colors.border} ${RADIUS.md} border shadow-2xl relative flex flex-col max-h-[85vh]`}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02] shrink-0">
              {title ? (
                <h3 id="modal-title" className={`text-xs font-mono font-bold uppercase tracking-wider ${colors.textPrimary}`}>
                  [MISSION CONTROL] {title}
                </h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className={`p-1.5 hover:bg-white/[0.05] ${colors.textMuted} hover:text-white rounded-sm cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 text-neutral-300 font-sans text-xs leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3.5 bg-white/[0.01] border-t border-white/[0.05] flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalMarkup, document.body);
};
