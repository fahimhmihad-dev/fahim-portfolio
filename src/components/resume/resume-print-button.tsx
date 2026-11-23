"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResumePrintButton() {
  return (
    <Button onClick={() => window.print()} variant="default" className="gap-2">
      <Printer className="size-4" />
      Print / Save PDF
    </Button>
  );
}
