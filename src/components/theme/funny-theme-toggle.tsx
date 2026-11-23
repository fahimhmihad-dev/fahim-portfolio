"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const THEME_DISCLAIMERS = {
  light: [
    "Warning: Light mode emits a gazillion lumens of pure radiance!",
    "Brave soul. Sunglasses are recommended beyond this point.",
    "Switching to light mode — hope your retinas are warmed up!",
    "Alright, full brightness mode it is. You asked for it!",
  ],
  dark: [
    "Ah, back to the dark side. Your eyes thank you.",
    "Dark mode restored. Balance has returned to the universe.",
    "Welcome home to midnight space mode.",
    "Crispy dark pixels unlocked.",
  ],
};

export default function FunnyThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [counter, setCounter] = React.useState({ dark: 0, light: 0 });

  const toggleTheme = async (newTheme: string, event?: React.MouseEvent) => {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (!doc.startViewTransition || !event) {
      setTheme(newTheme);
      return;
    }

    const { top, left, width, height } = (
      event.currentTarget as HTMLElement
    ).getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    await transition.ready;

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  const goLight = (e: React.MouseEvent) => {
    setPopoverOpen(false);
    setCounter((c) => ({ ...c, light: c.light + 1 }));
    void toggleTheme("light", e);
  };

  const goDark = (e: React.MouseEvent) => {
    const message = THEME_DISCLAIMERS.dark[counter.dark % THEME_DISCLAIMERS.dark.length];
    setCounter((c) => ({ ...c, dark: c.dark + 1 }));
    toast(message);
    void toggleTheme("dark", e);
  };

  if (!mounted) {
    return <div className={cn("w-8 h-8", className)} />;
  }

  if (resolvedTheme === "light") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative border-none bg-transparent", className)}
        onClick={goDark}
        aria-label="Switch to dark mode"
      >
        <Sun className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
      </Button>
    );
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative border-none bg-transparent", className)}
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[1200] flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-popover-foreground">
          {THEME_DISCLAIMERS.light[counter.light % THEME_DISCLAIMERS.light.length]}
        </p>
        <Button size="sm" onClick={goLight}>
          Go Light
        </Button>
      </PopoverContent>
    </Popover>
  );
}
