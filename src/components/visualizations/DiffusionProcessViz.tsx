"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiffusionProcessViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const maxSteps = 20;
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => {
        const next = direction === "forward" ? s + 1 : s - 1;
        if (next > maxSteps) {
          setDirection("reverse");
          return maxSteps;
        }
        if (next < 0) {
          setDirection("forward");
          return 0;
        }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [direction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const noiseLevel = step / maxSteps;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    // Draw base image (a simple "data" shape)
    if (noiseLevel < 1) {
      // Draw a stylized "clean" distribution — gaussian blobs
      const blobs = [
        { x: cx - 30, y: cy - 20, r: 25, color: "rgba(99,102,241," },
        { x: cx + 25, y: cy + 15, r: 18, color: "rgba(139,92,246," },
        { x: cx - 10, y: cy + 30, r: 15, color: "rgba(6,182,212," },
      ];

      blobs.forEach(({ x, y, r, color }) => {
        const cleanness = 1 - noiseLevel;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * (1 + noiseLevel * 2));
        gradient.addColorStop(0, color + (0.9 * cleanness).toFixed(2) + ")");
        gradient.addColorStop(1, color + "0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r * (1 + noiseLevel * 3), 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Noise overlay
    if (noiseLevel > 0) {
      const noiseCanvas = document.createElement("canvas");
      noiseCanvas.width = W;
      noiseCanvas.height = H;
      const nCtx = noiseCanvas.getContext("2d")!;
      const imageData = nCtx.createImageData(W, H);

      for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 255 * noiseLevel;
        // Colored noise: indigo/violet tones
        imageData.data[i] = Math.max(0, Math.min(255, 99 + noise * 0.4));
        imageData.data[i + 1] = Math.max(0, Math.min(255, 102 + noise * 0.4));
        imageData.data[i + 2] = Math.max(0, Math.min(255, 241 + noise * 0.2));
        imageData.data[i + 3] = noiseLevel * 200;
      }
      nCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(noiseCanvas, 0, 0);
    }

    // Step label
    ctx.fillStyle = "rgba(148,163,184,0.8)";
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`t = ${step}`, 10, 20);

    ctx.fillStyle = "rgba(99,102,241,0.8)";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(
      direction === "forward" ? "q(xₜ|xₜ₋₁) →" : "← pθ(xₜ₋₁|xₜ)",
      W - 10,
      20
    );
  }, [step, direction]);

  const progress = step / maxSteps;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
      {/* Canvas */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(99,102,241,0.2)", background: "rgba(15,15,30,0.5)" }}
      >
        <canvas ref={canvasRef} width={280} height={200} />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span className="text-cyan-400">Clean x₀</span>
          <span>Diffusion</span>
          <span className="text-violet-400">Noise xₜ</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background:
                direction === "forward"
                  ? "linear-gradient(90deg, #06b6d4, #8b5cf6)"
                  : "linear-gradient(90deg, #8b5cf6, #06b6d4)",
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="text-center">
        <div className="text-xs text-slate-400">
          {direction === "forward" ? (
            <span>
              Forward process — adding Gaussian noise{" "}
              <span className="text-violet-400 font-mono">q(xₜ|xₜ₋₁)</span>
            </span>
          ) : (
            <span>
              Reverse process — learned denoising{" "}
              <span className="text-cyan-400 font-mono">pθ(xₜ₋₁|xₜ)</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
