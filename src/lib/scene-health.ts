"use client";

import { useSyncExternalStore } from "react";

export type SceneStatus = "idle" | "loading" | "ready" | "failed";

let currentStatus: SceneStatus = "idle";
const listeners = new Set<() => void>();

export function setSceneStatus(next: SceneStatus) {
  if (currentStatus === next) return;
  currentStatus = next;
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSceneStatus(): SceneStatus {
  return useSyncExternalStore(
    subscribe,
    () => currentStatus,
    () => "idle"
  );
}
