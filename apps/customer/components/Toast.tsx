"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

export function Toast({
  show,
  onClose,
  title,
  description,
}: {
  show: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-md"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-herb-200 bg-herb-50 px-4 py-3 shadow-lift">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-herb-600" />
            <div className="flex-1">
              <div className="font-semibold text-herb-700">{title}</div>
              {description && (
                <div className="mt-0.5 text-sm text-herb-600/80">
                  {description}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-herb-600 hover:bg-herb-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
