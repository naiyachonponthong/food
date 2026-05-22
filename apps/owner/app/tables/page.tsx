"use client";

import { useMemo, useState } from "react";
import { Plus, QrCode, Download, Printer, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { tables, type Table } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function TablesPage() {
  const [selected, setSelected] = useState<Table | null>(tables[0]);

  const byZone = useMemo(() => {
    const zones = Array.from(new Set(tables.map((t) => t.zone)));
    return zones.map((z) => ({
      zone: z,
      tables: tables.filter((t) => t.zone === z),
    }));
  }, []);

  return (
    <>
      <TopBar
        title="โต๊ะ & QR"
        subtitle={`${tables.length} โต๊ะใน 4 โซน`}
        action={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-50">
              <Download className="h-4 w-4" />
              Export QR ทั้งหมด (PDF)
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-pop hover:bg-brand-600">
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              เพิ่มโต๊ะ
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Tables list */}
          <div className="space-y-6">
            {byZone.map(({ zone, tables: zts }) => (
              <section key={zone}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-base font-bold text-ink-800">{zone}</h2>
                  <span className="text-xs text-ink-400">{zts.length} โต๊ะ</span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {zts.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className={cn(
                        "group relative flex flex-col items-stretch overflow-hidden rounded-2xl border-2 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft",
                        selected?.id === t.id
                          ? "border-brand-500 bg-brand-50/30 shadow-soft"
                          : "border-cream-200 bg-white",
                      )}
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-bold tabular text-ink-800">
                          {t.name}
                        </div>
                        {t.qrType === "dynamic" && (
                          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                        )}
                      </div>
                      <div className="mt-1 text-[10px] text-ink-400">
                        {t.capacity} ที่นั่ง
                      </div>
                      <div className="mt-2 border-t border-dashed border-cream-300 pt-2 text-[10px] text-ink-500">
                        QR {t.qrType === "static" ? "ติดที่โต๊ะ" : "พิมพ์ใหม่"}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* QR preview panel */}
          <aside className="sticky top-6 self-start">
            {selected ? (
              <QrPreview table={selected} />
            ) : (
              <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-400 border border-cream-200">
                เลือกโต๊ะเพื่อดู QR Code
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}

function QrPreview({ table }: { table: Table }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            QR Code Preview
          </div>
          <div className="text-lg font-bold text-ink-800">โต๊ะ {table.name}</div>
          <div className="text-xs text-ink-500">{table.zone}</div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            table.qrType === "static"
              ? "bg-blue-100 text-blue-700"
              : "bg-brand-100 text-brand-700",
          )}
        >
          {table.qrType === "static" ? "Static" : "Dynamic"}
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-cream-50 to-cream-100 p-5">
        <div className="aspect-square w-full max-w-[240px] mx-auto">
          <FakeQR seed={table.id} />
        </div>
        <div className="mt-3 text-center">
          <div className="text-xs text-ink-400">Scan to Order</div>
          <div className="mt-1 text-2xl font-bold text-ink-800 tabular">
            {table.name}
          </div>
          <div className="mt-1 text-[10px] text-ink-400">
            ครัวเพลิน · {table.zone}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-cream-300 bg-white py-2.5 text-xs font-semibold text-ink-700 hover:bg-cream-50">
          <Download className="h-3.5 w-3.5" />
          ดาวน์โหลด PNG
        </button>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-ink-800 py-2.5 text-xs font-semibold text-white hover:bg-ink-900">
          <Printer className="h-3.5 w-3.5" />
          พิมพ์ QR
        </button>
      </div>

      {table.qrType === "static" && (
        <div className="mt-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-3 text-xs text-brand-700">
          <div className="font-semibold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            ลงทะเบียนรับสติกเกอร์ QR ฟรี!
          </div>
          <div className="mt-1 text-[11px]">
            พิมพ์ด้วยวัสดุกันน้ำอย่างดี ส่งถึงร้านใน 14 วัน
          </div>
          <button className="mt-2 w-full rounded-xl bg-brand-500 py-2 text-[11px] font-semibold text-white shadow-pop">
            ลงทะเบียน
          </button>
        </div>
      )}
    </div>
  );
}

function FakeQR({ seed }: { seed: string }) {
  // Generate stable QR-like pattern from seed
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const size = 25;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    s = (s * 9301 + 49297) % 233280;
    cells.push(s % 2 === 0);
  }
  const isFinder = (r: number, c: number) => {
    const inSquare = (rs: number, cs: number) =>
      r >= rs && r < rs + 7 && c >= cs && c < cs + 7;
    if (inSquare(0, 0) || inSquare(0, size - 7) || inSquare(size - 7, 0)) {
      const [fy, fx] = inSquare(0, 0)
        ? [r, c]
        : inSquare(0, size - 7)
          ? [r, c - (size - 7)]
          : [r - (size - 7), c];
      const inside = fy === 0 || fy === 6 || fx === 0 || fx === 6;
      const center = fy >= 2 && fy <= 4 && fx >= 2 && fx <= 4;
      return inside || center;
    }
    return null;
  };
  return (
    <div
      className="grid h-full w-full gap-px overflow-hidden rounded-md bg-white"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {Array.from({ length: size * size }).map((_, idx) => {
        const r = Math.floor(idx / size);
        const c = idx % size;
        const finder = isFinder(r, c);
        const dark = finder === null ? cells[idx] : finder === true;
        return (
          <div
            key={idx}
            className={dark ? "bg-ink-800" : "bg-white"}
            style={{ aspectRatio: "1 / 1" }}
          />
        );
      })}
    </div>
  );
}
