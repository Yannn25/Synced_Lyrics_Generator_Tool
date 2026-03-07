'use client'

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

// Layout components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Workflow components
import StepIndicator from "@/components/workflow/StepIndicator";
import StepInput from "@/components/workflow/StepInput";
import StepSync from "@/components/workflow/StepSync";
import StepExport from "@/components/workflow/StepExport";

// Modal
import LyricsPreviewModal from "@/components/LyricsPreview/LyricsPreviewModal";

// Hooks
import { useLyrics } from "@/hooks/useLyrics";
import { useAudio } from "@/hooks/useAudio";
import { useExport } from "@/hooks/useExport";
import { useWorkflow } from "@/hooks/useWorkflow";

/**
 * Home - Page principale de l'application
 *
 * Utilise le pattern workflow en 3 étapes :
 * 1. StepInput - Chargement audio + lyrics
 * 2. StepSync - Synchronisation des lignes
 * 3. StepExport - Export des fichiers
 */
export default function Home() {
  // ===== HOOKS =====
  const {
    lyrics,
    selectedLineId,
    loadLyrics,
    selectLine,
    clearTimestamp,
    syncAndAdvance,
    clearList,
    onUpdateTimestamp,
    updateLineText,
    deleteLine
  } = useLyrics();

  const audio = useAudio();
  const exporter = useExport();

  const {
    currentStep,
    canGoToStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    updateConditions,
  } = useWorkflow();

  // ===== REFS =====
  const prevTimeStampRef = useRef<number | null>(null);

  // ===== LOCAL STATE =====
  const [showPreview, setShowPreview] = useState(false);

  // ===== DERIVED STATE =====
  const lyricsLoaded = lyrics.length > 0;
  const hasSyncedLines = lyrics.some(line => line.isSynced);

  // ===== EFFECTS =====

  // Mise à jour des conditions du workflow
  useEffect(() => {
    updateConditions({
      isAudioLoaded: audio.isLoaded,
      isLyricsLoaded: lyricsLoaded,
      hasSyncedLines: hasSyncedLines,
    });
  }, [audio.isLoaded, lyricsLoaded, hasSyncedLines, updateConditions]);

  // ===== HANDLERS =====

  /**
   * Synchronise la ligne sélectionnée avec le timestamp actuel
   */
  const handleSyncLine = useCallback(() => {
    if (!audio.isLoaded) return;
    if (!selectedLineId) {
      console.warn('No line selected');
      return;
    }

    const currentTimestamp = audio.getCurrentTimestamp();

    // Vérification : le nouveau timestamp doit être > au précédent
    const prevLineIndex = lyrics.findIndex(line => line.id === selectedLineId) - 1;
    const prevLine = prevLineIndex >= 0 ? lyrics[prevLineIndex] : null;

    if (prevLine?.timestamp !== null && prevLine?.timestamp !== undefined && currentTimestamp <= prevLine.timestamp) {
      console.warn('Le timestamp doit être supérieur à la ligne précédente');
      return;
    }

    syncAndAdvance(selectedLineId, currentTimestamp);
    prevTimeStampRef.current = currentTimestamp;
  }, [selectedLineId, audio, lyrics, syncAndAdvance]);

  /**
   * Handler pour le chargement des lyrics (depuis StepInput)
   */
  const handleLoadLyrics = useCallback((text: string) => {
    loadLyrics(text);
  }, [loadLyrics]);

  /**
   * Ouvre la modal de preview des lyrics
   */
  const handleOpenPreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  /**
   * Ferme la modal de preview des lyrics
   */
  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      // Ignorer si on est dans un input/textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Entrée = sync la ligne (seulement sur l'étape 2)
      if (event.key === 'Enter' && currentStep === 2) {
        event.preventDefault();
        handleSyncLine();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSyncLine, currentStep]);

  // ===== RENDER =====
  return (
    <div className="app-shell">
      <Header />

      {/* Persistent Audio Element */}
      <audio ref={audio.audioRef} />

      {/* Indicateur d'étapes */}
      <StepIndicator
        currentStep={currentStep}
        canGoToStep={canGoToStep}
        onStepClick={goToStep}
      />

      {/* Contenu principal avec transitions */}
      <main className="mx-auto w-full max-w-4xl px-6 py-8 md:px-10 md:py-12">
        <AnimatePresence mode="wait">
          {/* Étape 1 : Chargement Audio + Lyrics */}
          {currentStep === 1 && (
            <StepInput
              key="step-input"
              audio={audio}
              onLoadLyrics={handleLoadLyrics}
              onContinue={goToNextStep}
              lyricsLoaded={lyricsLoaded}
            />
          )}

          {/* Étape 2 : Synchronisation */}
          {currentStep === 2 && (
            <StepSync
              key="step-sync"
              audio={audio}
              lyrics={lyrics}
              selectedLineId={selectedLineId}
              onSelectLine={selectLine}
              onClearTimestamp={clearTimestamp}
              onUpdateTimestamp={onUpdateTimestamp}
              onUpdateLineText={updateLineText}
              onDeleteLine={deleteLine}
              onClearList={clearList}
              onSyncLine={handleSyncLine}
              onContinue={goToNextStep}
              onPreviewLyrics={handleOpenPreview}
              onBack={goToPreviousStep}
            />
          )}

          {/* Étape 3 : Export */}
          {currentStep === 3 && (
            <StepExport
              key="step-export"
              audio={audio}
              lyrics={lyrics}
              exporter={exporter}
              onBack={goToPreviousStep}
              onPreviewLyrics={handleOpenPreview}
            />
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Modal de preview des lyrics */}
      <LyricsPreviewModal
        isOpen={showPreview}
        onClose={handleClosePreview}
        lyrics={lyrics}
        currentTime={audio.currentTime}
        duration={audio.duration}
        isPlaying={audio.isPlaying}
        onPlay={audio.play}
        onPause={audio.pause}
        onSeek={audio.seek}
      />
    </div>
  );
}
