"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Sheet } from "./Sheet";
import { Toast } from "./Toast";
import { callStaffOptions } from "@/lib/mock-data";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export function CallStaffSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [toast, setToast] = useState(false);
  const callStaff = useCartStore((s) => s.callStaff);
  const clearStaffCall = useCartStore((s) => s.clearStaffCall);

  const confirm = () => {
    if (!selected) return;
    const opt = callStaffOptions.find((o) => o.id === selected)!;
    const reason =
      selected === "other" && otherText.trim()
        ? `อื่น ๆ: ${otherText.trim()}`
        : opt.label;
    callStaff(reason);
    setToast(true);
    onClose();
    setSelected(null);
    setOtherText("");
    setTimeout(() => {
      setToast(false);
      clearStaffCall();
    }, 5000);
  };

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title="เรียกพนักงาน"
        subtitle="ต้องการให้พนักงานช่วยเหลือเรื่องใด?"
        footer={
          <button
            disabled={!selected || (selected === "other" && !otherText.trim())}
            onClick={confirm}
            className={cn(
              "flex w-full items-center justify-center rounded-2xl py-4 font-semibold text-white shadow-pop transition-all",
              !selected || (selected === "other" && !otherText.trim())
                ? "bg-ink-200 text-ink-400 shadow-none"
                : "bg-brand-500 active:bg-brand-600",
            )}
          >
            ยืนยันการเรียกพนักงาน
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-3 pt-2">
          {callStaffOptions.map((opt) => {
            const isActive = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-2 rounded-3xl border-2 bg-white p-5 text-center transition-all",
                  isActive
                    ? "border-brand-500 shadow-soft"
                    : "border-cream-200 hover:border-cream-300",
                )}
              >
                {isActive && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                )}
                <div className="text-4xl">{opt.icon}</div>
                <div className="font-semibold text-ink-800">{opt.label}</div>
                <div className="text-xs text-ink-400">{opt.description}</div>
              </button>
            );
          })}
        </div>

        {selected === "other" && (
          <div className="mt-4 animate-fade-in-up">
            <textarea
              autoFocus
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="พิมพ์รายละเอียดที่ต้องการ..."
              rows={3}
              className="w-full resize-none rounded-2xl border-2 border-cream-200 bg-white p-4 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
        )}
      </Sheet>
      <Toast
        show={toast}
        onClose={() => setToast(false)}
        title="เรียกพนักงานแล้ว"
        description="พนักงานจะมาให้บริการในอีกสักครู่"
      />
    </>
  );
}
