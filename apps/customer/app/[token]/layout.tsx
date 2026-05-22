import type { ReactNode } from "react";

export default function TokenLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-md">{children}</div>;
}
