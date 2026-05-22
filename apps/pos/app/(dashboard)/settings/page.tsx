"use client";

import { Settings, Store, Wifi, Printer, Bell } from "lucide-react";
import { TopBar } from "@/components/TopBar";

export default function SettingsPage() {
  return (
    <>
      <TopBar title="ตั้งค่า" subtitle="การตั้งค่าและข้อมูลบัญชี" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-3">
          <Tile icon={<Store />} title="ข้อมูลร้าน" desc="ชื่อร้าน, โลโก้, ที่อยู่, เลขผู้เสียภาษี" />
          <Tile icon={<Settings />} title="Mobile Order" desc="QR type, self checkout, call staff" />
          <Tile icon={<Wifi />} title="การเชื่อมต่อ" desc="WiFi, Pusher real-time" />
          <Tile icon={<Printer />} title="เครื่องพิมพ์" desc="QR slip, kitchen ticket, receipt" />
          <Tile icon={<Bell />} title="การแจ้งเตือน" desc="เสียง, การเตือนเรียลไทม์" />
          <div className="mt-8 rounded-2xl border border-dashed border-cream-300 bg-cream-50/50 p-6 text-center text-sm text-ink-400">
            ส่วนของการตั้งค่าจะทำงานเต็มรูปแบบเมื่อทำ Part 3 (Owner App)
          </div>
        </div>
      </main>
    </>
  );
}

function Tile({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button className="flex w-full items-center gap-4 rounded-2xl border border-cream-200 bg-white p-4 text-left transition-all hover:border-cream-300 hover:shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-ink-800">{title}</div>
        <div className="mt-0.5 text-xs text-ink-400">{desc}</div>
      </div>
    </button>
  );
}
