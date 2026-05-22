import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { OpenTableDialog } from "@/components/OpenTableDialog";
import { TableDetailDrawer } from "@/components/TableDetailDrawer";

export const metadata: Metadata = {
  title: "Plearn POS — ครัวเพลิน",
  description: "ระบบ POS สำหรับร้านอาหาร",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F2542D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-cream-100 antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
        <OpenTableDialog />
        <TableDetailDrawer />
      </body>
    </html>
  );
}
