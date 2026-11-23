"use client";

import {
  useState,
  useEffect,
  createContext,
  ReactNode,
  useContext,
  useRef,
  useCallback,
} from "react";
import { AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import Loader from "./loader";
import { usePerfProfile } from "@/hooks/use-perf-profile";

type PreloaderContextType = {
  isLoading: boolean;
  loadingPercent: number;
  bypassLoading: () => void;
};

const preloaderContext = createContext<PreloaderContextType>({
  isLoading: false,
  loadingPercent: 100,
  bypassLoading: () => {},
});

export const usePreloader = () => useContext(preloaderContext);

const LOADING_TIME = 1.9;

export default function Preloader({
  children,
  disabled = false,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const skip = disabled || !isHome;

  const [isLoading, setIsLoading] = useState(!skip);
  const [loadingPercent, setLoadingPercent] = useState(skip ? 100 : 0);
  const loadingTween = useRef<gsap.core.Tween | null>(null);
  const loadingPercentRef = useRef({ value: 0 });

  const { disable3D, ready: perfReady } = usePerfProfile();

  const bypassLoading = useCallback(() => {
    loadingTween.current?.progress(0.99).kill();
    setLoadingPercent(100);
    setIsLoading(false);
  }, []);

  const shouldSkip = skip || (perfReady && disable3D);

  useEffect(() => {
    if (shouldSkip) {
      loadingTween.current?.kill();
      return;
    }
    loadingPercentRef.current.value = 0;
    loadingTween.current = gsap.to(loadingPercentRef.current, {
      value: 100,
      duration: LOADING_TIME,
      ease: "power2.inOut",
      onUpdate: () => {
        setLoadingPercent(loadingPercentRef.current.value);
      },
      onComplete: () => {
        setIsLoading(false);
      },
    });
    return () => {
      loadingTween.current?.kill();
    };
  }, [shouldSkip]);

  const effectiveLoading = isLoading && !shouldSkip;

  return (
    <preloaderContext.Provider
      value={{
        isLoading: effectiveLoading,
        bypassLoading,
        loadingPercent: shouldSkip ? 100 : loadingPercent,
      }}
    >
      <AnimatePresence mode="wait">{effectiveLoading && <Loader />}</AnimatePresence>
      {children}
    </preloaderContext.Provider>
  );
}
