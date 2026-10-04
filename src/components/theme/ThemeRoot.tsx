"use client";

import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export function ThemeRoot({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ThemeProvider>{children}</ThemeProvider>
    </Suspense>
  );
}
