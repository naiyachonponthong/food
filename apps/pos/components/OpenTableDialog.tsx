"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, X, QrCode, Sparkles } from "lucide-react";
import { usePosStore } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

export function OpenTableDialog() {
  const open = usePosStore((s) => s.openTableModal);
  const setOpen = usePosStore((s) => s.setOpenTableModal);
  const tables = usePosStore((s) => s.tables);
  const openTable = usePosStore((s) => s.openTable);

  const available = useMemo(
    () => tables.filter((t) => t.status === "available"),
    [tables],
  );
  const firstAvailableId = available[0]?.id;

  const [tableId, setTableId] = useState<string>("");
  const [qrType, setQrType] = useState<"static" | "dynamic">("dynamic");
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    if (open && firstAvailableId && !tableId) {
      setTableId(firstAvailableId);
    }
  }, [open, firstAvailableId, tableId]);

  useEffect(() => {
    if (!open) {
      setTableId("");
      setGuests(2);
    }
  }, [open]);

  const handleOpen = () => {
    if (!tableId) return;
    openTable(tableId, guests, qrType);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-lift"
          >
            <div className="flex items-start justify-between border-b border-cream-200 px-6 pt-5 pb-4">
              <div>
                <h2 className="text-xl font-bold text-ink-800">เปิดโต๊ะใหม่</h2>
                <p className="mt-0.5 text-sm text-ink-400">
                  เลือกโต๊ะ จำนวนคน และรูปแบบ QR
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 text-ink-600 hover:bg-cream-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {/* Table */}
              <section>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  เลือกโต๊ะ
                </label>
                {available.length === 0 ? (
                  <div className="mt-2 rounded-2xl bg-cream-100 px-4 py-6 text-center text-sm text-ink-500">
                    ไม่มีโต๊ะว่างในขณะนี้
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-6 gap-1.5">
                    {available.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTableId(t.id)}
                        className={cn(
                          "rounded-xl border-2 px-2 py-2.5 text-sm font-bold tabular transition-all",
                          tableId === t.id
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-cream-200 bg-white text-ink-700 hover:border-cream-300",
                        )}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Guests */}
              <section>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  จำนวนลูกค้า
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-cream-200 bg-white text-ink-700 hover:border-cream-300"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <div className="flex h-11 w-20 items-center justify-center rounded-xl bg-cream-100 text-2xl font-bold tabular text-ink-800">
                    {guests}
                  </div>
                  <button
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white shadow-pop"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <div className="ml-auto text-sm text-ink-400">
                    {guests > 1 ? "คน" : "คน"}
                  </div>
                </div>
              </section>

              {/* QR Type */}
              <section>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  รูปแบบ QR
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQrType("dynamic")}
                    className={cn(
                      "flex flex-col gap-1 rounded-2xl border-2 p-3 text-left transition-all",
                      qrType === "dynamic"
                        ? "border-brand-500 bg-brand-50/40"
                        : "border-cream-200 bg-white hover:border-cream-300",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Sparkles className="h-4 w-4 text-brand-500" />
                      <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[9px] font-semibold text-brand-700">
                        แนะนำ
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-ink-800">
                      Dynamic QR
                    </div>
                    <div className="text-[11px] text-ink-400">
                      พิมพ์ QR ใหม่ทุกครั้งที่เปิดโต๊ะ
                    </div>
                  </button>
                  <button
                    onClick={() => setQrType("static")}
                    className={cn(
                      "flex flex-col gap-1 rounded-2xl border-2 p-3 text-left transition-all",
                      qrType === "static"
                        ? "border-brand-500 bg-brand-50/40"
                        : "border-cream-200 bg-white hover:border-cream-300",
                    )}
                  >
                    <QrCode className="h-4 w-4 text-ink-600" />
                    <div className="mt-1 text-sm font-bold text-ink-800">
                      Static QR
                    </div>
                    <div className="text-[11px] text-ink-400">
                      QR ติดที่โต๊ะถาวร
                    </div>
                  </button>
                </div>
              </section>
            </div>

            <div className="flex gap-2 border-t border-cream-200 bg-cream-50 px-6 py-4">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-2xl border-2 border-cream-300 bg-white py-3 text-sm font-semibold text-ink-700 hover:bg-cream-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleOpen}
                disabled={!tableId}
                className={cn(
                  "flex-1 rounded-2xl py-3 text-sm font-semibold text-white",
                  tableId
                    ? "bg-blue-600 shadow-pop hover:bg-blue-700"
                    : "bg-ink-200",
                )}
              >
                เปิดโต๊ะและพิมพ์ QR
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
