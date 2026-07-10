/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { RADIUS, SHADOWS } from "../../utils/themeTokens";
import { useMilitaryTheme } from "../../contexts/MilitaryThemeContext";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warn: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { colors } = useMilitaryTheme();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `toast-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, dur?: number) => toast(msg, "success", dur), [toast]);
  const error = useCallback((msg: string, dur?: number) => toast(msg, "error", dur), [toast]);
  const warn = useCallback((msg: string, dur?: number) => toast(msg, "warning", dur), [toast]);
  const info = useCallback((msg: string, dur?: number) => toast(msg, "info", dur), [toast]);

  // Command center style icon selection
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#76df91] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-[#ff9999] shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-[#ffcc99] shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: `${colors.completed} text-[#eaf2eb] bg-black/90`,
    error: `${colors.critical} text-[#ffcccc] bg-black/90`,
    warning: `${colors.warning} text-[#ffeedd] bg-black/90`,
    info: `border-sky-800 text-sky-100 bg-black/95`,
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, warn, info }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-55 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              layout
              className={`pointer-events-auto flex items-start gap-3 p-4 border rounded-sm ${SHADOWS.tactical} backdrop-blur-md ${borders[t.type]}`}
            >
              <div className="mt-0.5 shrink-0">{icons[t.type]}</div>
              <div className="flex-1 text-[10px] font-mono font-semibold uppercase tracking-wider leading-relaxed">
                <span className="text-zinc-500 mr-1.5 font-bold">[{t.type.toUpperCase()}]</span>
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 hover:bg-white/10 rounded-sm text-neutral-500 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss message"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
