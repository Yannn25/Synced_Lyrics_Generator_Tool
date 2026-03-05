"use client";

import React from "react";
import { Upload, Music, Download, Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
    label: "Synchronisation",
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

/**
 * StepIndicator - Composant de navigation par étapes
 *
 * Affiche une barre de progression horizontale avec 3 étapes cliquables.
 * Chaque étape peut être dans l'un des états suivants :
 * - active: L'étape actuelle (mise en évidence)
 * - completed: Étape déjà complétée (coche verte)
 * - locked: Étape non accessible (icône de verrou)
 * - available: Étape accessible mais pas encore visitée
 */
export default function StepIndicator({
  currentStep,
  canGoToStep,
  onStepClick,
}: StepIndicatorProps) {

  // Calcul de la progression globale (0 à 100)
  const progressValue = ((currentStep - 1) / (STEPS_CONFIG.length - 1)) * 100;

  /**
   * Détermine l'état d'une étape
   */
  const getStepState = (step: WorkflowStep): "active" | "completed" | "locked" | "available" => {
    if (step === currentStep) return "active";
    if (step < currentStep) return "completed";
    if (!canGoToStep(step)) return "locked";
    return "available";
  };

  /**
   * Gère le clic sur une étape
   */
  const handleStepClick = (step: WorkflowStep) => {
    if (canGoToStep(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Container principal avec effet glass */}
      <div className="relative mx-auto max-w-2xl">

        {/* Barre de progression en arrière-plan */}
        <div className="absolute top-8 left-12 right-12 z-0">
          <Progress
            value={progressValue}
            className="h-1 bg-muted/50"
          />
        </div>

        {/* Les 3 étapes */}
        <div className="relative z-10 flex items-center justify-between">
          {STEPS_CONFIG.map((stepConfig, index) => {
            const state = getStepState(stepConfig.step);
            const Icon = stepConfig.icon;
            const isClickable = canGoToStep(stepConfig.step);

            return (
              <div
                key={stepConfig.step}
                className="flex flex-col items-center gap-2"
              >
                {/* Cercle de l'étape */}
                <button
                  onClick={() => handleStepClick(stepConfig.step)}
                  disabled={!isClickable}
                  className={cn(
                    // Base styles
                    "relative flex h-16 w-16 items-center justify-center rounded-full",
                    "border-2 transition-all duration-300 ease-in-out",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",

                    // État actif
                    state === "active" && [
                      "border-primary bg-primary text-primary-foreground",
                      "shadow-lg shadow-primary/30",
                      "scale-110",
                    ],

                    // État complété
                    state === "completed" && [
                      "border-green-500 bg-green-500/10 text-green-500",
                      "hover:bg-green-500/20 cursor-pointer",
                    ],

                    // État verrouillé
                    state === "locked" && [
                      "border-muted bg-muted/30 text-muted-foreground",
                      "cursor-not-allowed opacity-50",
                    ],

                    // État disponible
                    state === "available" && [
                      "border-primary/50 bg-background text-primary",
                      "hover:border-primary hover:bg-primary/10 cursor-pointer",
                    ]
                  )}
                >
                  {/* Icône selon l'état */}
                  {state === "completed" ? (
                    <Check className="h-6 w-6 animate-in zoom-in-50 duration-300" />
                  ) : state === "locked" ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}

                  {/* Indicateur de pulsation pour l'étape active */}
                  {state === "active" && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  )}
                </button>

                {/* Label et description */}
                <div className="flex flex-col items-center gap-0.5">
                  <Badge
                    variant={state === "active" ? "default" : state === "completed" ? "secondary" : "outline"}
                    className={cn(
                      "transition-all duration-300",
                      state === "locked" && "opacity-50"
                    )}
                  >
                    {stepConfig.label}
                  </Badge>
                  <span
                    className={cn(
                      "text-xs transition-colors duration-300",
                      state === "active" ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {stepConfig.description}
                  </span>
                </div>

                {/* Numéro d'étape */}
                <span
                  className={cn(
                    "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center",
                    "rounded-full text-[10px] font-bold",
                    "transition-all duration-300",
                    state === "active" && "bg-primary text-primary-foreground",
                    state === "completed" && "bg-green-500 text-white",
                    state === "locked" && "bg-muted text-muted-foreground",
                    state === "available" && "bg-primary/20 text-primary"
                  )}
                  style={{ top: "0", right: "calc(50% - 32px)" }}
                >
                  {stepConfig.step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

