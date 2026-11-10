import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen w-full">
      <div className="w-full">{children}</div>
    </main>
  );
}
