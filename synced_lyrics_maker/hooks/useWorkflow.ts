"use client";

import { useState, useCallback, useMemo } from "react";
import { WorkflowStep, WorkflowState } from "@/types";

/**
 * Conditions pour passer d'une étape à l'autre
 */
interface WorkflowConditions {
  isAudioLoaded: boolean;
  isLyricsLoaded: boolean;
  hasSyncedLines: boolean;
}

/**
 * Retour du hook useWorkflow
 */
interface UseWorkflowReturn {
  // État actuel
  currentStep: WorkflowStep;
  workflowState: WorkflowState;

  // Navigation
  canGoToStep: (step: WorkflowStep) => boolean;
  goToStep: (step: WorkflowStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;

  // Mise à jour des conditions
  updateConditions: (conditions: Partial<WorkflowConditions>) => void;

  // Utilitaires
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number; // 0-100
}

/**
 * useWorkflow - Hook de gestion de la navigation par étapes
 *
 * Gère les transitions entre les 3 étapes du workflow :
 * 1. Upload (Audio + Lyrics)
 * 2. Sync (Synchronisation)
 * 3. Export (Téléchargement)
 *
 * Les transitions sont conditionnelles :
 * - Step 1 → 2 : Audio ET Lyrics doivent être chargés
 * - Step 2 → 3 : Au moins une ligne doit être synchronisée
 */
export function useWorkflow(initialStep: WorkflowStep = 1): UseWorkflowReturn {

  // État de l'étape courante
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(initialStep);

  // Conditions de transition
  const [conditions, setConditions] = useState<WorkflowConditions>({
    isAudioLoaded: false,
    isLyricsLoaded: false,
    hasSyncedLines: false,
  });

  /**
   * Vérifie si on peut accéder à une étape donnée
   */
  const canGoToStep = useCallback((step: WorkflowStep): boolean => {
    switch (step) {
      case 1:
        // Toujours accessible (on peut revenir à l'upload)
        return true;

      case 2:
        // Accessible si audio ET lyrics sont chargés
        return conditions.isAudioLoaded && conditions.isLyricsLoaded;

      case 3:
        // Accessible si on peut aller à l'étape 2 ET qu'au moins une ligne est synced
        return conditions.isAudioLoaded && conditions.isLyricsLoaded && conditions.hasSyncedLines;

      default:
        return false;
    }
  }, [conditions]);

  /**
   * Navigation vers une étape spécifique (avec validation)
   */
  const goToStep = useCallback((step: WorkflowStep): void => {
    if (canGoToStep(step)) {
      setCurrentStep(step);
    } else {
      console.warn(`Cannot navigate to step ${step}: conditions not met`);
    }
  }, [canGoToStep]);

  /**
   * Navigation vers l'étape suivante
   */
  const goToNextStep = useCallback((): void => {
    if (currentStep < 3) {
      const nextStep = (currentStep + 1) as WorkflowStep;
      goToStep(nextStep);
    }
  }, [currentStep, goToStep]);

  /**
   * Navigation vers l'étape précédente
   */
  const goToPreviousStep = useCallback((): void => {
    if (currentStep > 1) {
      const prevStep = (currentStep - 1) as WorkflowStep;
      goToStep(prevStep);
    }
  }, [currentStep, goToStep]);

  /**
   * Mise à jour partielle des conditions
   * Permet de mettre à jour une ou plusieurs conditions à la fois
   */
  const updateConditions = useCallback((newConditions: Partial<WorkflowConditions>): void => {
    setConditions(prev => ({
      ...prev,
      ...newConditions,
    }));
  }, []);

  /**
   * État du workflow calculé
   */
  const workflowState = useMemo<WorkflowState>(() => ({
    currentStep,
    canGoToStep2: conditions.isAudioLoaded && conditions.isLyricsLoaded,
    canGoToStep3: conditions.isAudioLoaded && conditions.isLyricsLoaded && conditions.hasSyncedLines,
  }), [currentStep, conditions]);

  /**
   * Utilitaires
   */
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 3;
  const progress = ((currentStep - 1) / 2) * 100; // 0%, 50%, 100%

  return {
    // État
    currentStep,
    workflowState,

    // Navigation
    canGoToStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,

    // Mise à jour
    updateConditions,

    // Utilitaires
    isFirstStep,
    isLastStep,
    progress,
  };
}

export default useWorkflow;

