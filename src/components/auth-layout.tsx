import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background p-6">
      <div className="flex-grow flex flex-col justify-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full">
            {children}
        </div>
      </div>
    </main>
  );
}
