"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: string;
};

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxHeight = "85vh",
}: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-4xl bg-cream-50 shadow-lift overflow-hidden",
            )}
            style={{ maxHeight }}
          >
            {/* drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-ink-200" />
            </div>

            {(title || subtitle) && (
              <div className="flex items-start justify-between px-5 pt-2 pb-3">
                <div>
                  {title && (
                    <h3 className="font-display text-xl font-bold text-ink-800 leading-tight">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-ink-400">{subtitle}</p>
                  )}
                </div>
                <button
                  aria-label="ปิด"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-ink-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 pb-3">{children}</div>

            {footer && (
              <div className="border-t border-cream-200 bg-cream-50 px-5 pt-3 pb-safe">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
