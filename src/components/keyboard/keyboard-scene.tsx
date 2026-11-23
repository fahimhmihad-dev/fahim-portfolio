"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Skill } from "@/types/database";
import { setSceneStatus } from "@/lib/scene-health";
import { usePreloader } from "@/components/preloader";
import { useKeyboardSounds } from "./use-keyboard-sounds";
import { createKeycapGeometry, createRoundedSlabGeometry } from "./keycap-geometry";
import { createKeycapIconTexture } from "./textures";
import { AnimatePresence, motion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export type KeyboardSection = "hero" | "skills" | "experience" | "projects" | "contact";

const PHYSICAL_ROWS = [
  ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6"],
  ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY"],
  ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH"],
  ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN"],
];

function getDefaultShortcut(index: number, cols: number, total: number): string | undefined {
  const rows = Math.ceil(total / cols);
  const startRow = Math.max(0, PHYSICAL_ROWS.length - rows);
  const r = startRow + Math.floor(index / cols);
  const c = index % cols;
  return PHYSICAL_ROWS[r]?.[c];
}

function formatKeyLabel(code: string | undefined): string {
  if (!code) return "";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  return code;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])"))
  );
}

interface KeycapItemProps {
  skill: Skill;
  position: [number, number, number];
  geometry: THREE.BufferGeometry;
  pressed: boolean;
  floatOffset: number;
  revealDelay: number;
  revealed: boolean;
  onPressStart: (skill: Skill) => void;
  onPressEnd: (skill: Skill) => void;
}

function KeycapMesh({
  skill,
  position,
  geometry,
  pressed,
  floatOffset,
  revealDelay,
  revealed,
  onPressStart,
  onPressEnd,
}: KeycapItemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const dropProgress = useRef(0);
  const pressDepth = useRef(0);

  const iconTexture = useMemo(
    () => createKeycapIconTexture(skill.name, skill.icon, skill.color),
    [skill.name, skill.icon, skill.color]
  );

  useEffect(() => {
    return () => {
      iconTexture.dispose();
    };
  }, [iconTexture]);

  const baseColor = useMemo(() => new THREE.Color(skill.color || "#38bdf8"), [skill.color]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const clampedDelta = Math.min(delta, 0.05);

    // Elastic staggered reveal
    if (revealed && dropProgress.current < 1) {
      const elapsed = state.clock.elapsedTime;
      if (elapsed >= revealDelay) {
        dropProgress.current = Math.min(1, dropProgress.current + clampedDelta * 3.2);
      }
    }

    const revealY = revealed ? (1 - easeOutBack(dropProgress.current)) * 1.4 : 1.4;
    const targetPress = pressed ? -0.32 : 0;
    pressDepth.current = THREE.MathUtils.lerp(pressDepth.current, targetPress, clampedDelta * 18);

    groupRef.current.position.y = position[1] + pressDepth.current + floatOffset + revealY;
    groupRef.current.visible = revealed && dropProgress.current > 0.01;

    if (matRef.current) {
      const targetEmissive = pressed ? 0.58 : 0.04;
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        targetEmissive,
        clampedDelta * 14
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.pointerType === "mouse") {
          document.body.style.cursor = "pointer";
          onPressStart(skill);
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "";
        onPressEnd(skill);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPressStart(skill);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onPressEnd(skill);
      }}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          ref={matRef}
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.04}
          roughness={0.34}
          metalness={0.08}
          clearcoat={0.22}
          clearcoatRoughness={0.35}
        />
      </mesh>
      {/* Top icon decal plane */}
      <mesh position={[0, 0.562, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.52, 0.52]} />
        <meshBasicMaterial map={iconTexture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

interface KeyboardRigProps {
  skills: Skill[];
  section: KeyboardSection;
  pressedSlugs: Set<string>;
  revealed: boolean;
  onPressStart: (skill: Skill) => void;
  onPressEnd: (skill: Skill) => void;
  onReady: () => void;
}

function KeyboardRig({
  skills,
  section,
  pressedSlugs,
  revealed,
  onPressStart,
  onPressEnd,
  onReady,
}: KeyboardRigProps) {
  const boardRef = useRef<THREE.Group>(null);
  const { size } = useThree();
  const isMobile = size.width < 768;

  const cols = Math.min(6, Math.max(1, skills.length));
  const rows = Math.max(1, Math.ceil(skills.length / cols));
  const pitch = 1.04;

  const boardWidth = cols * pitch + 0.72;
  const boardDepth = rows * pitch + 0.72;

  const keycapGeo = useMemo(() => createKeycapGeometry(), []);
  const caseGeo = useMemo(
    () => createRoundedSlabGeometry(boardWidth, boardDepth, 0.54, 0.34, 0.06),
    [boardWidth, boardDepth]
  );
  const plateGeo = useMemo(
    () => createRoundedSlabGeometry(cols * pitch + 0.16, rows * pitch + 0.16, 0.08, 0.14, 0.015),
    [cols, rows, pitch]
  );

  useEffect(() => {
    return () => {
      keycapGeo.dispose();
      caseGeo.dispose();
      plateGeo.dispose();
    };
  }, [keycapGeo, caseGeo, plateGeo]);

  // Signal ready once geometries are created and mounted
  const signaled = useRef(false);
  useEffect(() => {
    if (!signaled.current) {
      signaled.current = true;
      onReady();
    }
  }, [onReady]);

  // Animated target pose driven smoothly by active section
  const poseRef = useRef({
    px: isMobile ? 0 : 2.35,
    py: isMobile ? -1.45 : -0.1,
    pz: 0,
    rx: 0.22,
    ry: -0.25,
    rz: 0,
    scale: 0.01,
  });

  useEffect(() => {
    const aspectFit = Math.min(1.05, (size.width / Math.max(size.height, 1)) * 0.88);
    const baseFit = Math.min(1.12, 6.2 / Math.max(boardWidth, boardDepth + 1.4));
    const unitScale = (isMobile ? Math.min(0.68, aspectFit) : Math.min(0.95, aspectFit)) * baseFit;

    let target = {
      px: isMobile ? 0 : 2.55,
      py: isMobile ? -1.75 : -0.1,
      pz: 0,
      rx: 0.18,
      ry: -0.25,
      rz: 0,
      scale: unitScale * (isMobile ? 0.92 : 0.96),
    };

    if (section === "skills") {
      target = {
        px: 0,
        py: isMobile ? -0.35 : -0.42,
        pz: 0,
        rx: 0.24,
        ry: isMobile ? 0.2 : 0.14,
        rz: 0,
        scale: unitScale * (isMobile ? 1.02 : 1.18),
      };
    } else if (section === "experience") {
      target = {
        px: isMobile ? 0 : 4.2,
        py: -0.5,
        pz: -1.5,
        rx: 0.35,
        ry: -0.65,
        rz: 0.12,
        scale: unitScale * (isMobile ? 0.42 : 0.56),
      };
    } else if (section === "projects") {
      target = {
        px: isMobile ? 0 : -4.0,
        py: 0.3,
        pz: -1.5,
        rx: 0.42,
        ry: 0.85,
        rz: -0.15,
        scale: unitScale * (isMobile ? 0.42 : 0.56),
      };
    } else if (section === "contact") {
      target = {
        px: isMobile ? 0 : 2.75,
        py: isMobile ? -2.2 : -0.25,
        pz: 0,
        rx: 0.2,
        ry: -0.4,
        rz: 0.04,
        scale: unitScale * (isMobile ? 0.72 : 0.88),
      };
    }

    const tween = gsap.to(poseRef.current, {
      ...target,
      duration: revealed ? 1.15 : 0.01,
      ease: "power3.out",
      overwrite: true,
    });

    return () => {
      tween.kill();
    };
  }, [section, isMobile, size.width, size.height, boardWidth, boardDepth, revealed]);

  // Ambient wave offsets computed per frame for Contact / Projects sections
  const [waveTick, setWaveTick] = useState(0);
  const frameAccum = useRef(0);

  useFrame((state, delta) => {
    if (!boardRef.current) return;
    const t = state.clock.elapsedTime;
    const p = poseRef.current;

    const heroSpin = section === "hero" ? Math.sin(t * 0.42) * 0.38 : 0;
    const heroBob = section === "hero" ? Math.sin(t * 1.1) * 0.12 : 0;
    const contactYaw = section === "contact" ? Math.sin(t * 0.55) * 0.25 : 0;
    const projectsBob = section === "projects" ? Math.sin(t * 1.4) * 0.14 : 0;

    boardRef.current.position.set(p.px, p.py + heroBob + projectsBob, p.pz);
    boardRef.current.rotation.set(p.rx, p.ry + heroSpin + contactYaw, p.rz);
    boardRef.current.scale.setScalar(revealed ? p.scale : 0.001);

    if (section === "contact" || section === "projects") {
      frameAccum.current += delta;
      if (frameAccum.current > 0.032) {
        frameAccum.current = 0;
        setWaveTick(t);
      }
    }
  });

  return (
    <group ref={boardRef}>
      {/* Keyboard chassis */}
      <mesh geometry={caseGeo} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#17181c" roughness={0.55} metalness={0.35} />
      </mesh>
      {/* Recessed dark switch plate */}
      <mesh geometry={plateGeo} position={[0, 0.47, 0]} receiveShadow>
        <meshStandardMaterial color="#0b0d11" roughness={0.85} metalness={0.15} />
      </mesh>
      {/* Subtle glowing LED accent bar on chassis front edge */}
      <mesh position={[0, 0.26, boardDepth / 2 + 0.015]}>
        <boxGeometry args={[boardWidth * 0.36, 0.05, 0.02]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* Dynamic skill keycaps */}
      {skills.map((skill, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = (col - (cols - 1) / 2) * pitch;
        const z = (row - (rows - 1) / 2) * pitch;

        let floatOffset = 0;
        if (section === "contact") {
          floatOffset = Math.max(0, Math.sin(waveTick * 1.9 + index * 0.65) * 0.42);
        } else if (section === "projects") {
          floatOffset = Math.max(0, Math.sin(waveTick * 4.5 - index * 0.45) * 0.14);
        }

        return (
          <KeycapMesh
            key={skill.id}
            skill={skill}
            position={[x, 0.48, z]}
            geometry={keycapGeo}
            pressed={pressedSlugs.has(skill.slug)}
            floatOffset={floatOffset}
            revealDelay={0.05 + index * 0.035}
            revealed={revealed}
            onPressStart={onPressStart}
            onPressEnd={onPressEnd}
          />
        );
      })}
    </group>
  );
}

export default function KeyboardScene({
  skills,
  maxDpr,
}: {
  skills: Skill[];
  maxDpr: number;
}) {
  const { isLoading, bypassLoading } = usePreloader();
  const playSound = useKeyboardSounds();

  const [section, setSection] = useState<KeyboardSection>("hero");
  const [ready, setReady] = useState(false);
  const [pressedSlugs, setPressedSlugs] = useState<Set<string>>(new Set());
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  const visibleSkills = useMemo(() => skills.slice(0, 24), [skills]);
  const cols = Math.min(6, Math.max(1, visibleSkills.length));

  const shortcutMap = useMemo(() => {
    const map = new Map<string, Skill>();
    visibleSkills.forEach((skill, idx) => {
      const code = skill.shortcut || getDefaultShortcut(idx, cols, visibleSkills.length);
      if (code && !map.has(code)) {
        map.set(code, skill);
      }
    });
    return map;
  }, [visibleSkills, cols]);

  const reverseShortcutMap = useMemo(() => {
    const map = new Map<string, string>();
    shortcutMap.forEach((skill, code) => map.set(skill.slug, formatKeyLabel(code)));
    return map;
  }, [shortcutMap]);

  const handlePressStart = useCallback(
    (skill: Skill) => {
      setPressedSlugs((prev) => {
        if (prev.has(skill.slug)) return prev;
        const next = new Set(prev);
        next.add(skill.slug);
        playSound(true);
        return next;
      });
      setActiveSkill(skill);
    },
    [playSound]
  );

  const handlePressEnd = useCallback(
    (skill: Skill) => {
      setPressedSlugs((prev) => {
        if (!prev.has(skill.slug)) return prev;
        const next = new Set(prev);
        next.delete(skill.slug);
        playSound(false);
        return next;
      });
    },
    [playSound]
  );

  const handleReady = useCallback(() => {
    setReady(true);
    setSceneStatus("ready");
    bypassLoading();
  }, [bypassLoading]);

  // Physical keyboard interaction
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      const skill = shortcutMap.get(e.code);
      if (skill) handlePressStart(skill);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const skill = shortcutMap.get(e.code);
      if (skill) handlePressEnd(skill);
    };
    const onBlur = () => setPressedSlugs(new Set());

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [shortcutMap, handlePressStart, handlePressEnd]);

  // GSAP ScrollTrigger section detection
  useEffect(() => {
    const sections: Array<{ id: KeyboardSection; previous: KeyboardSection; start: string }> = [
      { id: "skills", previous: "hero", start: "top 55%" },
      { id: "experience", previous: "skills", start: "top 55%" },
      { id: "projects", previous: "experience", start: "top 65%" },
      { id: "contact", previous: "projects", start: "top 50%" },
    ];

    const triggers: ScrollTrigger[] = [];
    for (const item of sections) {
      if (!document.getElementById(item.id)) continue;
      triggers.push(
        ScrollTrigger.create({
          trigger: `#${item.id}`,
          start: item.start,
          onEnter: () => setSection(item.id),
          onLeaveBack: () => setSection(item.previous),
        })
      );
    }

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  if (visibleSkills.length === 0) return null;

  return (
    <>
      <div
        className="fixed inset-0 w-screen h-dvh z-0 pointer-events-auto"
        aria-hidden="false"
      >
        <Canvas
          shadows
          orthographic
          dpr={[1, maxDpr]}
          camera={{ position: [-9, 9.8, 9.2], zoom: 92, near: 0.1, far: 100 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl, camera }) => {
            camera.lookAt(0, 0.35, 0);
            gl.domElement.addEventListener("webglcontextlost", () => {
              setSceneStatus("failed");
            });
          }}
        >
          <ambientLight intensity={0.65} />
          <hemisphereLight args={["#ffffff", "#1e293b", 0.55]} />
          <directionalLight
            position={[-6, 11, -3]}
            intensity={2.4}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={1}
            shadow-camera-far={30}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
          />
          <directionalLight position={[6, 6, 8]} intensity={0.65} color="#cbd5e1" />

          <KeyboardRig
            skills={visibleSkills}
            section={section}
            pressedSlugs={pressedSlugs}
            revealed={ready && !isLoading}
            onPressStart={handlePressStart}
            onPressEnd={handlePressEnd}
            onReady={handleReady}
          />
        </Canvas>
      </div>

      {/* Interactive 3D Skill HUD shown when browsing the Tech Stack section */}
      <AnimatePresence>
        {section === "skills" && ready && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35 }}
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 bottom-8 z-20 flex justify-center"
          >
            <div className="max-w-md w-full rounded-2xl border border-border/60 bg-background/75 backdrop-blur-md px-5 py-3.5 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2">
                {activeSkill && (
                  <span
                    className="inline-block size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: activeSkill.color }}
                  />
                )}
                <p className="font-display text-base md:text-lg font-bold tracking-tight text-foreground">
                  {activeSkill?.name ?? "Explore my skills"}
                </p>
                {activeSkill && reverseShortcutMap.get(activeSkill.slug) && (
                  <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {reverseShortcutMap.get(activeSkill.slug)}
                  </kbd>
                )}
              </div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed">
                {activeSkill?.short_description || "Hover, tap, or press a key on your keyboard"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
