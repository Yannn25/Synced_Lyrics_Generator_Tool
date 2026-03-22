'use client'
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Footer from "@/components/layout/Footer";
import StepIndicator from "@/components/workflow/StepIndicator";
import StepInput from "@/components/workflow/StepInput";
import StepSync from "@/components/workflow/StepSync";
import StepExport from "@/components/workflow/StepExport";
import LyricsPreviewModal from "@/components/LyricsPreview/LyricsPreviewModal";
import { useAudio } from "@/hooks/useAudio";
import { useExport } from "@/hooks/useExport";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useUnifiedSync } from "@/hooks/useUnifiedSync";
import { UnifiedSong } from "@/types";
export default function Home() {
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
  const {
    lines,
    selectedLineId,
    loadContent,
    selectLine,
    syncLine,
    clearTimestamp,
    updateTimestamp,
    updateLineContent,
    deleteLine,
    clearAll,
  } = useUnifiedSync();
  const [showPreview, setShowPreview] = useState(false);
  const lastLoadedContentRef = useRef<string>("");
  const [songData, setSongData] = useState<UnifiedSong>({
    title: "",
    bpm: 0,
    timeSignature: "4/4",
    key: "C",
    content: "",
  });
  const hasInputContent = songData.content.trim().length > 0;
  const hasSyncedLines = lines.some((line) => line.isSynced);
  useEffect(() => {
    updateConditions({
      isAudioLoaded: audio.isLoaded,
      isLyricsLoaded: hasInputContent,
      hasSyncedLines,
    });
  }, [audio.isLoaded, hasInputContent, hasSyncedLines, updateConditions]);
  useEffect(() => {
    if (currentStep === 2 && songData.content !== lastLoadedContentRef.current) {
      loadContent(songData.content);
      lastLoadedContentRef.current = songData.content;
    }
  }, [currentStep, songData.content, loadContent]);
  const handleSyncLine = useCallback(() => {
    if (!audio.isLoaded || selectedLineId === null) return;
    syncLine(selectedLineId, audio.getCurrentTimestamp());
  }, [audio, selectedLineId, syncLine]);
  const handleOpenPreview = useCallback(() => setShowPreview(true), []);
  const handleClosePreview = useCallback(() => setShowPreview(false), []);
  
  return (
    <div className="app-shell">
      <audio ref={audio.audioRef} />
      <StepIndicator
        currentStep={currentStep}
        canGoToStep={canGoToStep}
        onStepClick={goToStep}
      />
      <main className="mx-auto w-full max-w-4xl pt-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <StepInput
              key="step-input"
              audio={audio}
              songData={songData}
              onSongDataChange={setSongData}
              onContinue={goToNextStep}
            />
          )}
          {currentStep === 2 && (
            <StepSync
              key="step-sync"
              audio={audio}
              lines={lines}
              selectedLineId={selectedLineId}
              onSelectLine={selectLine}
              onClearTimestamp={clearTimestamp}
              onUpdateTimestamp={updateTimestamp}
              onUpdateLineContent={updateLineContent}
              onDeleteLine={deleteLine}
              onClearList={clearAll}
              onSyncLine={handleSyncLine}
              onContinue={goToNextStep}
              onPreviewLyrics={handleOpenPreview}
              onBack={goToPreviousStep}
            />
          )}
          {currentStep === 3 && (
            <StepExport
              key="step-export"
              audio={audio}
              lyrics={lines}
              chords={[]}
              metadata={songData}
              audioBaseName={audio.audioBaseName}
              exporter={exporter}
              onBack={goToPreviousStep}
              onPreviewLyrics={handleOpenPreview}
            />
          )}
        </AnimatePresence>
      </main>
      <Footer />
      <LyricsPreviewModal
        isOpen={showPreview}
        onClose={handleClosePreview}
        lyrics={lines}
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
