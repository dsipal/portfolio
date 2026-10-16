"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { readPastels } from "@/lib/pastel";

/**
 * Three translucent, intersecting cubes in the per-visit pastel palette that slowly rotate and lean toward
 * the pointer. Pauses when off-screen or the tab is hidden, and renders a
 * single still frame under prefers-reduced-motion.
 */
export default function Cubes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = readPastels();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3.6;

    scene.add(new THREE.AmbientLight(0xffffff, isDark ? 1.2 : 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2, 3, 4);
    scene.add(key);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(geometry);
    const disposables: { dispose(): void }[] = [geometry, edges];

    const cubes = palette.map((color, i) => {
      const material = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        // Same random translucency as the original cubes
        opacity: Math.random() * (0.95 - 0.6) + 0.6,
        roughness: 0.35,
        metalness: 0.1,
        depthWrite: false,
      });
      // Pastel edges disappear on white, so light mode outlines in a darker shade of the same hue
      const edgeColor = new THREE.Color(color);
      if (!isDark) edgeColor.offsetHSL(0, 0.1, -0.3);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: isDark ? 0.9 : 0.8,
      });
      disposables.push(material, lineMaterial);

      const cube = new THREE.Mesh(geometry, material);
      cube.add(new THREE.LineSegments(edges, lineMaterial));
      cube.rotation.set((Math.PI / 3) * i, (Math.PI / 4) * i, 0);
      group.add(cube);
      return cube;
    });

    const resize = () => {
      const size = container.clientWidth;
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    if (reducedMotion) {
      return () => {
        resizeObserver.disconnect();
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
      };
    }

    // Pointer tilt, eased toward the target each frame
    const target = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      target.x = (e.clientY / window.innerHeight - 0.5) * 0.6;
      target.y = (e.clientX / window.innerWidth - 0.5) * 0.6;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let rafId = 0;
    let running = false;
    const clock = new THREE.Clock();

    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      cubes.forEach((cube, i) => {
        const speed = 0.25 + i * 0.12;
        if (i % 2 === 0) cube.rotation.y += dt * speed;
        else cube.rotation.x += dt * speed;
      });
      group.rotation.x += (target.x - group.rotation.x) * 0.05;
      group.rotation.y += (target.y - group.rotation.y) * 0.05;
      group.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.06;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      clock.getDelta();
      rafId = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    let onScreen = false;
    const update = () => (onScreen && !document.hidden ? start() : stop());
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    intersection.observe(container);
    document.addEventListener("visibilitychange", update);

    return () => {
      stop();
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pointermove", onPointerMove);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <div ref={containerRef} className="aspect-square w-full">
      <canvas ref={canvasRef} className="size-full" aria-hidden />
    </div>
  );
}
