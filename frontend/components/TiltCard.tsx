"use client";

import React, { useRef, useState } from "react";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
};

export function TiltCard({
  children,
  className = "",
  maxTilt = 15,
  perspective = 1000,
  scale = 1.02,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState("");
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card center (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Calculate rotation angles
    const rotateX = -mouseY * maxTilt;
    const rotateY = mouseX * maxTilt;

    setTransformStyle(
      `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
    );

    // Calculate glare percentage position
    const glareX = ((e.clientX - rect.left) / width) * 100;
    const glareY = ((e.clientY - rect.top) / height) * 100;
    setGlarePosition({ x: glareX, y: glareY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle(
      `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    );
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)"
          : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
        transformStyle: "preserve-3d",
      }}
      className={`relative overflow-hidden cursor-pointer ${className}`}
    >
      {/* Glare/Gloss overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 180px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.12), transparent 80%)`,
          }}
        />
      )}
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
