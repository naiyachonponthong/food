"use client";

import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartBar() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const count = useCartStore((s) => s.cartCount());
  const subtotal = useCartStore((s) => s.cartSubtotal());

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="fixed inset-x-0 bottom-0 z-30 pb-safe"
        >
          <div className="mx-auto max-w-md px-4 pb-3">
            <button
              onClick={() => router.push(`/${params.token}/cart`)}
              className="group flex w-full items-center justify-between rounded-2xl bg-ink-800 px-5 py-4 shadow-lift transition-all hover:bg-ink-900"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500">
                    <ShoppingCart
                      className="h-5 w-5 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-ink-800 bg-white px-1 text-[10px] font-bold text-ink-800 tabular">
                    {count}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm text-white/70">
                    {count} รายการในตะกร้า
                  </div>
                  <div className="text-base font-bold text-white tabular">
                    {formatPrice(subtotal)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-white/90 font-medium text-sm">
                ดูตะกร้า
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
