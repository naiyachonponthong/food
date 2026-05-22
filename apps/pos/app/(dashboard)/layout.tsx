import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { OpenTableDialog } from "@/components/OpenTableDialog";
import { TableDetailDrawer } from "@/components/TableDetailDrawer";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
      <OpenTableDialog />
      <TableDetailDrawer />
    </>
  );
}
