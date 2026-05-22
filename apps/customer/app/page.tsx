import Link from "next/link";
import { QrCode, Smartphone, Utensils } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-warm-grain bg-cream-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-12 pb-safe">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500 shadow-pop">
            <Utensils className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold text-ink-800">
            ครัวเพลิน
          </h1>
          <p className="mt-1 text-sm tracking-wide text-ink-400">
            Plearn Kitchen · Mobile Order
          </p>
        </div>

        <div className="mt-12 rounded-4xl bg-white p-7 shadow-soft">
          <div className="flex items-center justify-center">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-3xl bg-cream-100">
              <QrCode className="h-24 w-24 text-ink-700" strokeWidth={1.5} />
              <div className="absolute inset-3 rounded-2xl border-2 border-dashed border-brand-300" />
            </div>
          </div>
          <h2 className="mt-6 text-center font-display text-xl font-semibold text-ink-800">
            สแกน QR ที่โต๊ะของคุณ
          </h2>
          <p className="mt-2 text-center text-sm text-ink-500">
            เพื่อเริ่มสั่งอาหารผ่านมือถือของคุณเอง
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Step
            n={1}
            title="สแกน QR Code"
            description="ที่โต๊ะอาหารของคุณด้วยกล้องมือถือ"
          />
          <Step
            n={2}
            title="เลือกเมนูที่ชอบ"
            description="ดูรูปและรายละเอียดเมนูได้ละเอียด"
          />
          <Step
            n={3}
            title="กดสั่ง ครัวรับออเดอร์ทันที"
            description="ติดตามสถานะอาหารแบบเรียลไทม์"
          />
        </div>

        <div className="mt-8 flex-1" />

        <Link
          href="/demo-session-token"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-400 bg-brand-50/50 py-4 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-50"
        >
          <Smartphone className="h-4 w-4" />
          ลองใช้งานเดโม (Demo)
        </Link>

        <p className="mt-3 text-center text-xs text-ink-400">
          Powered by Plearn Order System
        </p>
      </div>
    </main>
  );
}

function Step({
  n,
  title,
  description,
}: {
  n: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
        {n}
      </div>
      <div>
        <div className="text-sm font-semibold text-ink-800">{title}</div>
        <div className="text-xs text-ink-400">{description}</div>
      </div>
    </div>
  );
}
