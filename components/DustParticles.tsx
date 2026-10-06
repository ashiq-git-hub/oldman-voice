"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  rgb: string;
}

interface TrailMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  rgb: string;
}

export default function DustParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Warm vintage tones matching old notebook paper, dried ink, and brass
    const colors = [
      "95, 82, 68",    // Vintage warm ink fleck
      "148, 126, 84",  // Soft aged brass speck
      "120, 108, 92",  // Delicate parchment fiber
      "68, 62, 54",    // Charcoal dust speck
      "162, 140, 100", // Faint sunlit dust mote
    ];

    // Compute particle count — generous density for small dots across the canvas
    const getParticleCount = () => {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(Math.max(Math.floor(area / 7500), 95), 230);
    };

    let particles: Particle[] = [];
    const trailMotes: TrailMote[] = [];

    const initParticles = () => {
      const count = getParticleCount();
      particles = [];
      for (let i = 0; i < count; i++) {
        // Extra small in size (tiny delicate pinpoints)
        const radius = 0.35 + Math.random() * 0.65; // ~0.35px to 1.0px
        const baseAlpha = 0.14 + Math.random() * 0.24; // Subtle, elegant opacity
        const baseVx = (Math.random() - 0.5) * 0.16;
        const baseVy = -0.04 - Math.random() * 0.12; // Slow upward thermal float

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: baseVx,
          vy: baseVy,
          baseVx,
          baseVy,
          radius,
          baseAlpha,
          alpha: baseAlpha,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02,
          rgb: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initParticles();

    // Mouse and interaction tracking
    const mouse = {
      x: -9999,
      y: -9999,
      prevX: -9999,
      prevY: -9999,
      speed: 0,
      isDown: false,
    };

    const handlePointerMove = (e: MouseEvent | Touch) => {
      const currentX = e.clientX;
      const currentY = e.clientY;

      if (mouse.prevX !== -9999) {
        const dx = currentX - mouse.prevX;
        const dy = currentY - mouse.prevY;
        mouse.speed = Math.sqrt(dx * dx + dy * dy);
      }

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = currentX;
      mouse.y = currentY;

      // Spawn subtle extra micro-dust motes as cursor glides or drags across the page
      if (
        (mouse.isDown || mouse.speed > 3) &&
        trailMotes.length < 55 &&
        Math.random() < (mouse.isDown ? 0.55 : 0.32)
      ) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 0.6;
        trailMotes.push({
          x: currentX + (Math.random() - 0.5) * 10,
          y: currentY + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.08,
          radius: 0.35 + Math.random() * 0.5,
          alpha: 0.32,
          life: 0,
          maxLife: 40 + Math.floor(Math.random() * 35),
          rgb: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e);
    const onMouseDown = () => {
      mouse.isDown = true;
    };
    const onMouseUp = () => {
      mouse.isDown = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0]);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      mouse.isDown = true;
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0]);
      }
    };
    const onTouchEnd = () => {
      mouse.isDown = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.prevX = -9999;
      mouse.prevY = -9999;
      mouse.speed = 0;
      mouse.isDown = false;
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initParticles();
    };

    handleResize();

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTimestamp = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let lastTimestamp = performance.now();

    // Main render loop
    const render = (now: number) => {
      if (!isVisible) return;

      lastTimestamp = now;

      ctx.clearRect(0, 0, width, height);

      // Decay mouse speed gradually
      mouse.speed *= 0.92;

      // Interaction radius for the cloud of dust particles
      const interactRadius = mouse.isDown ? 150 : 115;
      const interactRadiusSq = interactRadius * interactRadius;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // Subtle natural breathing pulse in opacity
          p.pulsePhase += p.pulseSpeed;
          p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.06;

          // Gentle ambient float
          p.x += p.vx;
          p.y += p.vy;

          // Mouse proximity reaction (gentle air displacement / dust disturbance)
          if (mouse.x > -1000) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < interactRadiusSq && distSq > 0.01) {
              const dist = Math.sqrt(distSq);
              const normDist = 1 - dist / interactRadius;
              const force = normDist * normDist;

              const dirX = dx / dist;
              const dirY = dy / dist;

              // Gentle tangential swirl as if stirring air over notebook
              const swirlX = -dirY * 0.28;
              const swirlY = dirX * 0.28;

              const impulse = (mouse.isDown ? 1.7 : 1.05) + Math.min(mouse.speed * 0.04, 1.3);

              p.vx += (dirX + swirlX) * force * impulse;
              p.vy += (dirY + swirlY) * force * impulse;
            }
          }

          // Gentle friction returning to ambient float velocity
          p.vx = p.vx * 0.94 + p.baseVx * 0.06;
          p.vy = p.vy * 0.94 + p.baseVy * 0.06;

          // Seamless edge wrapping with margin
          if (p.x < -10) p.x = width + 10;
          else if (p.x > width + 10) p.x = -10;

          if (p.y < -10) p.y = height + 10;
          else if (p.y > height + 10) p.y = -10;
        }

        // Render dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.rgb}, ${Math.max(p.alpha, 0.06)})`;
        ctx.fill();
      }

      // Update & render cursor trail motes
      if (!prefersReducedMotion) {
        for (let i = trailMotes.length - 1; i >= 0; i--) {
          const m = trailMotes[i];
          m.life += 1;
          m.x += m.vx;
          m.y += m.vy;
          m.vx *= 0.96;
          m.vy *= 0.96;

          const progress = m.life / m.maxLife;
          const alpha = (1 - progress) * 0.32;

          if (progress >= 1) {
            trailMotes.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${m.rgb}, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
