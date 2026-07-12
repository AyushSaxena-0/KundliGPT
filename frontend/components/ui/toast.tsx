"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "info", isVisible, onClose, duration = 4000 }: ToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.35 }}
          className={cn(
            "fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur-md max-w-sm text-white",
            {
              "border-emerald-500/30 bg-emerald-950/70": type === "success",
              "border-rose-500/30 bg-rose-950/70": type === "error",
              "border-primary/30 bg-secondary/80": type === "info",
            }
          )}
        >
          {/* Icon Selection */}
          {type === "success" && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />}
          {type === "error" && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
          {type === "info" && <Info className="h-5 w-5 text-accent shrink-0" />}

          {/* Message Text */}
          <span className="text-sm font-medium">{message}</span>

          {/* Close button */}
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-0.5 text-mutedText hover:bg-white/10 hover:text-white transition-all focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
