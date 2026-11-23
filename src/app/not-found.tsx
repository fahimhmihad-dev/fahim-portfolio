import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Error 404
      </p>
      <h1 className="font-display text-7xl sm:text-9xl font-bold tracking-tight text-foreground">
        404
      </h1>
      <p className="mt-4 font-display text-lg sm:text-xl text-foreground">Page not found</p>
      <p className="mt-2 max-w-md text-sm sm:text-base text-muted-foreground">
        This route drifted out of orbit — or maybe it never existed. Let&apos;s get you back to the
        main deck.
      </p>
      <Link href="/" className="mt-8">
        <Button className="rounded-full px-6 gap-2">
          <ArrowLeft className="size-4" />
          Back to home
        </Button>
      </Link>
    </div>
  );
}
