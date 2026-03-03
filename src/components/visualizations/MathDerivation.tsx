"use client";

import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  label: string;
  equation: string;
  explanation: string;
}

interface Props {
  equations?: string[];
  mainEquation?: string;
  title?: string;
}

function parseEquationSteps(equations: string[], mainEquation?: string): Step[] {
  if (equations.length === 0 && mainEquation) {
    return [
      {
        label: "Definition",
        equation: mainEquation,
        explanation: "The core mathematical formulation",
      },
    ];
  }
  return equations.map((eq, i) => ({
    label: `Step ${i + 1}`,
    equation: eq,
    explanation: "Mathematical derivation step",
  }));
}

function renderLatex(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true,
      trust: true,
    });
  } catch {
    return `<span class="text-slate-400 font-mono text-sm">${latex}</span>`;
  }
}

export default function MathDerivation({
  equations = [],
  mainEquation,
  title,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const steps = parseEquationSteps(equations, mainEquation);

  useEffect(() => {
    if (!autoPlay || steps.length <= 1) return;
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoPlay, steps.length]);

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4">
      {/* Steps navigation */}
      {steps.length > 1 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveStep(i);
                setAutoPlay(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeStep === i
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>
      )}

      {/* Main equation display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          {/* Equation box */}
          <div
            className="w-full rounded-xl p-6 mb-4 flex items-center justify-center overflow-x-auto"
            style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <div
              className="text-white text-center"
              style={{ fontSize: "clamp(0.9rem, 2vw, 1.2rem)" }}
              dangerouslySetInnerHTML={{
                __html: renderLatex(steps[activeStep]?.equation || ""),
              }}
            />
          </div>

          {/* Step explanation */}
          <div className="text-center">
            <div className="text-indigo-400 font-semibold text-sm mb-1">
              {steps[activeStep]?.label}
            </div>
            <div className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {steps[activeStep]?.explanation}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      {steps.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeStep === i ? "w-6 bg-indigo-500" : "w-1.5 bg-slate-700"
              }`}
            />
          ))}
        </div>
      )}

      {steps.length > 1 && (
        <button
          onClick={() => setAutoPlay((a) => !a)}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors mx-auto"
        >
          {autoPlay ? "⏸ Pause" : "▶ Auto-play"}
        </button>
      )}
    </div>
  );
}
