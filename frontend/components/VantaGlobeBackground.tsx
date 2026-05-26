"use client";

import { useEffect, useRef } from "react";

type VantaEffect = {
  destroy: () => void;
};

type VantaWindow = Window & {
  THREE?: unknown;
  VANTA?: {
    GLOBE?: (options: Record<string, unknown>) => VantaEffect;
  };
};

const THREE_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const VANTA_GLOBE_CDN =
  "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.globe.min.js";

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = false;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function VantaGlobeBackground() {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let effect: VantaEffect | null = null;

    const startVanta = async () => {
      await loadScript("three-r134-cdn", THREE_CDN);
      await loadScript("vanta-globe-cdn", VANTA_GLOBE_CDN);

      const vantaWindow = window as VantaWindow;

      if (cancelled || !globeRef.current || !vantaWindow.VANTA?.GLOBE) {
        return;
      }

      const theme = document.documentElement.getAttribute("data-theme") || "light";
      const isDark = theme === "dark";

      effect = vantaWindow.VANTA.GLOBE({
        el: globeRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: isDark ? 0x592afc : 0x2f54eb,
        color2: isDark ? 0x13f2c2 : 0x10b981,
        backgroundColor: isDark ? 0x060608 : 0xf4f6fb,
      });
    };

    startVanta().catch((error) => {
      console.error("Failed to initialize Vanta Globe background", error);
    });

    return () => {
      cancelled = true;
      effect?.destroy();
    };
  }, []);

  return (
    <div
      ref={globeRef}
      id="vanta-globe-background"
      className="vanta-globe-background"
      aria-hidden="true"
    />
  );
}
