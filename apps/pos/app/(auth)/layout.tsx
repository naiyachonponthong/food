import type { ReactNode } from "react";

// Standalone layout for auth pages — no sidebar
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen w-full">{children}</div>;
}
