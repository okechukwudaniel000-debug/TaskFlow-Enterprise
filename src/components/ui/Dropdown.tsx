/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger?: React.ReactNode;
  label?: string;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  align?: "left" | "right";
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  label,
  items,
  onSelect,
  selectedValue,
  align = "right",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Handle arrow key focus & selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          const item = items[focusedIndex];
          if (!item.disabled) {
            onSelect(item.value);
            setIsOpen(false);
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex, items, onSelect]);

  useEffect(() => {
    if (isOpen) {
      // Pre-select the index of the selected value, or the first item
      const index = items.findIndex((i) => i.value === selectedValue);
      setFocusedIndex(index >= 0 ? index : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, selectedValue, items]);

  const activeItemLabel = items.find((i) => i.value === selectedValue)?.label || label || "Select option";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)} ref={triggerRef as any}>
          {trigger}
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-between gap-2.5 bg-[#121212] hover:bg-[#1a1a1a] border border-neutral-800 text-xs text-neutral-300 font-semibold px-3 py-1.5 rounded-md cursor-pointer select-none transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-w-[140px]"
        >
          <span className="truncate">{activeItemLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            role="listbox"
            className={`absolute z-40 mt-1.5 w-56 bg-[#111111] border border-neutral-800 rounded-lg overflow-hidden shadow-xl p-1 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {items.map((item, index) => {
              const isSelected = item.value === selectedValue;
              const isFocused = index === focusedIndex;

              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled) {
                      onSelect(item.value);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors outline-none disabled:opacity-40 disabled:pointer-events-none ${
                    isFocused || isSelected
                      ? "bg-[#181818] text-white"
                      : "text-zinc-400 hover:text-neutral-200 hover:bg-[#151515]"
                  }`}
                >
                  {item.icon && <span className="shrink-0 text-zinc-500">{item.icon}</span>}
                  <span className="flex-1 truncate">{item.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
