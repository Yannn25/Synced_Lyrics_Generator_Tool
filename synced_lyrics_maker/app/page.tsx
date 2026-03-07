'use client'

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
 * Pattern full-screen immersif.
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
  const isWorkflowStarted = audio.isLoaded; // Hide header/footer when started

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
    <div className="app-shell flex flex-col h-screen overflow-hidden">
      {/* Header caché si workflow commencé */}
      <AnimatePresence>
        {!isWorkflowStarted && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Header />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Audio Element */}
      <audio ref={audio.audioRef} />

      {/* Indicateur d'étapes (Toujours visible mais discret en step 1 non chargé) */}
      <AnimatePresence>
        {isWorkflowStarted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StepIndicator
              currentStep={currentStep}
              canGoToStep={canGoToStep}
              onStepClick={goToStep}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu principal Full Width avec padding */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-6 overflow-auto flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" className="flex-1 h-full flex flex-col">
               <StepInput
                audio={audio}
                onLoadLyrics={handleLoadLyrics}
                onContinue={goToNextStep}
                lyricsLoaded={lyricsLoaded}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" className="flex-1 h-full flex flex-col">
              <StepSync
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
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" className="flex-1 h-full flex flex-col">
              <StepExport
                audio={audio}
                lyrics={lyrics}
                exporter={exporter}
                onBack={goToPreviousStep}
                onPreviewLyrics={handleOpenPreview}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer caché si workflow commencé */}
      <AnimatePresence>
        {!isWorkflowStarted && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Si step 1 et pas chargé, on affiche le footer en bas, sinon on le cache */}
            <div className="mt-auto">
               <Footer />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
