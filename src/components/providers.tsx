"use client";

import React from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import MotionPreferences from "@/components/motion-preferences";
import Preloader from "@/components/preloader";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({
  children,
  defaultTheme = "dark",
}: {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem disableTransitionOnChange>
      <MotionPreferences>
        <Preloader>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="bottom-right" />
        </Preloader>
      </MotionPreferences>
    </ThemeProvider>
  );
}
