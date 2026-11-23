import { cn } from "@/lib/utils";
import Link from "next/link";
import { BoxReveal } from "@/components/reveal-animations";
import type { ReactNode } from "react";

export function SectionHeader({
  id,
  title,
  desc,
  className,
}: {
  id: string;
  title: string | ReactNode;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={cn("top-[76px] sticky mb-20 md:mb-32 z-10", className)}>
      <Link href={`#${id}`}>
        <BoxReveal width="100%">
          <h2 className="text-4xl text-center md:text-7xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
        </BoxReveal>
      </Link>
      {desc && (
        <p className="mx-auto mt-3 line-clamp-3 max-w-2xl font-normal text-sm md:text-base text-center text-muted-foreground">
          {desc}
        </p>
      )}
    </div>
  );
}
