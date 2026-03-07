"use client";

import React from "react";
import { Upload, Music, Download, Check, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { StepIndicatorProps, WorkflowStep } from "@/types";
import { cn } from "@/lib/utils";

// Configuration des étapes du workflow
const STEPS_CONFIG = [
  {
    step: 1 as WorkflowStep,
    label: "Upload",
    description: "Audio & Lyrics",
    icon: Upload,
  },
  {
    step: 2 as WorkflowStep,
    label: "Sync",
    description: "Synchronize",
    icon: Music,
  },
  {
    step: 3 as WorkflowStep,
    label: "Export",
    description: "Download",
    icon: Download,
  },
];

export default function StepIndicator({
  currentStep,
  canGoToStep,
  onStepClick,
}: StepIndicatorProps) {

  // Calcul de la progression globale (0 à 100)
  const progressValue = ((currentStep - 1) / (STEPS_CONFIG.length - 1)) * 100;

  const handleStepClick = (step: WorkflowStep) => {
    if (canGoToStep(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className="w-full py-8 text-white relative select-none">

      {/* Background glow global */}
      {currentStep === 2 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      )}

      <div className="relative mx-auto max-w-3xl px-4">

        {/* Track de progression (fond gris) */}
        <div className="absolute top-[2.5rem] left-[3.5rem] right-[3.5rem] h-1.5 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
          {/* Ligne de progression animée */}
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 relative"
            initial={{ width: "0%" }}
            animate={{ width: `${progressValue}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          >
             {/* Petit éclat au bout de la barre */}
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white blur-sm rounded-full opacity-50 shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]" />
          </motion.div>
        </div>

        {/* Étapes */}
        <div className="relative z-10 flex justify-between items-start">
          {STEPS_CONFIG.map((stepConfig) => {
            const isActive = currentStep === stepConfig.step;
            const isCompleted = currentStep > stepConfig.step;
            const isClickable = canGoToStep(stepConfig.step);
            const isLocked = !isClickable && !isCompleted && !isActive;

            const Icon = isCompleted ? Check : stepConfig.icon;

            return (
              <div
                key={stepConfig.step}
                className={cn(
                  "flex flex-col items-center group relative",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => handleStepClick(stepConfig.step)}
              >
                {/* Cercle principal */}
                <motion.div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center text-2xl relative transition-all duration-500",
                    "border border-white/10 shadow-xl backdrop-blur-md",
                    isActive
                      ? "bg-gradient-to-br from-blue-500/80 to-cyan-500/40 border-blue-400/50 shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] scale-110 z-20"
                      : isCompleted
                      ? "bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_15px_-5px_rgba(34,197,94,0.3)] hover:bg-green-500/30"
                      : "bg-slate-900/40 text-slate-500 border-white/5 hover:bg-slate-800/60"
                  )}
                  whileHover={isClickable ? { scale: isActive ? 1.15 : 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  layout
                >
                  {/* Glass reflection (pour le look liquid) */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  )}

                  {/* Icon */}
                  <motion.div
                    key={isCompleted ? "check" : "icon"}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLocked ? (
                       <Lock className="w-6 h-6 opacity-50" />
                    ) : (
                       <Icon className={cn("w-8 h-8", isActive && "text-white drop-shadow-md")} />
                    )}
                  </motion.div>

                  {/* Indicateur de "Now playing" style pulse */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-[ping_3s_infinite]" />
                  )}
                </motion.div>

                {/* Labels */}
                <motion.div
                  className="mt-4 text-center flex flex-col items-center gap-1"
                  animate={{ y: isActive ? 5 : 0, opacity: isLocked ? 0.5 : 1 }}
                >
                  <span className={cn(
                    "text-sm font-bold tracking-wide transition-colors duration-300",
                    isActive ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" :
                    isCompleted ? "text-green-400" : "text-slate-400"
                  )}>
                    {stepConfig.label}
                  </span>

                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full border border-white/5 bg-black/20 backdrop-blur-sm transition-colors duration-300",
                     isActive ? "text-blue-200 border-blue-500/30" : "text-slate-500"
                  )}>
                    {stepConfig.description}
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

