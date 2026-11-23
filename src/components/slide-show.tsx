"use client";

// @ts-expect-error — @splidejs/react-splide lacks bundled React 19 type declarations
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const spring = { type: "spring", stiffness: 320, damping: 30 } as const;

function Frame({
  image,
  onZoom,
  onImageLoad,
}: {
  image: string;
  onZoom: () => void;
  onImageLoad?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onZoom}
      initial="idle"
      animate="idle"
      whileHover="hover"
      whileTap={{ scale: 0.992 }}
      transition={spring}
      aria-label="Open screenshot"
      className="group/frame relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border outline-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="Project screenshot"
        loading="lazy"
        onLoad={onImageLoad}
        className="block h-auto w-full object-cover"
      />
      <motion.span
        variants={{
          idle: { opacity: 0, y: 8, scale: 0.96 },
          hover: { opacity: 1, y: 0, scale: 1 },
        }}
        transition={spring}
        className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs font-mono text-white/95 backdrop-blur-md"
      >
        <Maximize2 className="h-3.5 w-3.5" />
        Expand
      </motion.span>
    </motion.button>
  );
}

export default function SlideShow({ images }: { images: string[] }) {
  const validImages = images.filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isOpen = selectedIndex !== null;
  const multiple = validImages.length > 1;
  const splideRef = useRef<{ splide?: { emit: (event: string) => void } }>(null);

  const remeasure = useCallback(() => {
    splideRef.current?.splide?.emit("resize");
  }, []);

  const step = useCallback(
    (dir: number) =>
      setSelectedIndex((i) =>
        i === null ? i : (i + dir + validImages.length) % validImages.length
      ),
    [validImages.length]
  );

  useEffect(() => {
    if (!isOpen || !multiple) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, multiple, step]);

  if (validImages.length === 0) return null;

  return (
    <>
      {multiple ? (
        <Splide
          ref={splideRef}
          className="portfolio-slider my-4"
          hasTrack={false}
          options={{
            type: "loop",
            autoplay: true,
            interval: 4500,
            speed: 600,
            perPage: 1,
            autoHeight: true,
            pauseOnHover: true,
            arrows: true,
            pagination: true,
            gap: "1rem",
          }}
        >
          <SplideTrack>
            {validImages.map((image, idx) => (
              <SplideSlide key={`${image}-${idx}`}>
                <Frame
                  image={image}
                  onZoom={() => setSelectedIndex(idx)}
                  onImageLoad={remeasure}
                />
              </SplideSlide>
            ))}
          </SplideTrack>

          <div className="splide__arrows">
            <button
              type="button"
              className="splide__arrow splide__arrow--prev"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="splide__arrow splide__arrow--next"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <ul className="splide__pagination" />
        </Splide>
      ) : (
        <div className="my-4">
          <Frame image={validImages[0]} onZoom={() => setSelectedIndex(0)} />
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-[94vw] border-none bg-transparent p-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Screenshot</DialogTitle>
            <DialogDescription>Zoomed project screenshot</DialogDescription>
          </DialogHeader>
          <div
            className="relative flex items-center justify-center"
            onClick={() => setSelectedIndex(null)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedIndex ?? "none"}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                onClick={(e) => e.stopPropagation()}
              >
                {isOpen && validImages[selectedIndex] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={validImages[selectedIndex]}
                    alt="Expanded project screenshot"
                    className="h-auto max-h-[86vh] w-auto max-w-full rounded-xl ring-1 ring-white/15 shadow-2xl"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {multiple && (
              <>
                <button
                  type="button"
                  aria-label="Previous screenshot"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md hover:scale-105 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next screenshot"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md hover:scale-105 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
