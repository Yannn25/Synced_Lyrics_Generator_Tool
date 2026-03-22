"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MiniAudioControls from "@/components/MiniAudioControls";
import UnifiedLyricsList from "@/components/UnifiedLyricsList";
import { useAudio } from "@/hooks/useAudio";
import { UnifiedLine } from "@/types";
import { cn } from "@/lib/utils";
import { stepVariants, stepTransition } from "@/lib/animations";

interface StepSyncProps {
  audio: ReturnType<typeof useAudio>;
  lines: UnifiedLine[];
  selectedLineId: number | null;
  onSelectLine: (lineId: number) => void;
  onClearTimestamp: (lineId: number) => void;
  onUpdateTimestamp: (lineId: number, timestamp: number | null) => void;
  onUpdateLineContent: (lineId: number, newContent: string) => void;
  onDeleteLine: (lineId: number) => void;
  onClearList: () => void;
  onSyncLine: () => void;
  onContinue: () => void;
  onPreviewLyrics: () => void;
  onBack?: () => void;
}

/**
 * StepSync - Étape 2 : Synchronisation Unifiée (ChordPro)
 *
 * Restaure le look "Card" avec MiniAudioControls et UnifiedLyricsList.
 */
export default function StepSync({
  audio,
  lines,
  selectedLineId,
  onSelectLine,
  onClearTimestamp,
  onUpdateTimestamp,
  onUpdateLineContent,
  onDeleteLine,
  onClearList,
  onSyncLine,
  onContinue,
  onPreviewLyrics,
  onBack,
}: StepSyncProps) {
  // Obtenir la ligne sélectionnée
  const selectedLine = useMemo(
    () => lines.find((l) => l.id === selectedLineId),
    [lines, selectedLineId]
  );

  // Statistiques de synchronisation
  const syncStats = useMemo(() => {
    const total = lines.length;
    const synced = lines.filter((l) => l.isSynced).length;
    return {
      total,
      synced,
      percentage: total > 0 ? Math.round((synced / total) * 100) : 0,
    };
  }, [lines]);

  const canExport = syncStats.synced > 0;

  // Raccourcis clavier
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on est dans un input/textarea
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (audio.isPlaying) audio.pause();
        else audio.play();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSyncLine();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [audio, onSyncLine]);

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col gap-6 h-full pb-8"
    >
      {/* Header avec progression */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Synchronisation
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Écoute l'audio et synchronise chaque ligne (Espace = Play, Entrée = Sync)
          </p>
        </div>

        {/* Indicateur de progression (Style Ancien) */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-2xl font-bold text-primary">{syncStats.synced}</span>
            <span className="text-lg text-muted-foreground">/{syncStats.total}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={syncStats.percentage === 100 ? "default" : "outline"}
              className={cn(
                "transition-all duration-300",
                syncStats.percentage === 100 && "bg-green-500/20 text-green-400 border-green-500/30"
              )}
            >
              {syncStats.percentage}% synced
            </Badge>
            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-darkest to-primary transition-all duration-300"
                style={{ width: `${syncStats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles audio mini (Style Ancien) */}
      <MiniAudioControls
        currentTime={audio.currentTime}
        duration={audio.duration}
        isPlaying={audio.isPlaying}
        onPlay={audio.play}
        onPause={audio.pause}
        onSeek={audio.seek}
        onSync={onSyncLine}
        canSync={selectedLineId !== null && audio.isLoaded}
        showSyncButton={true}
        compact={false}
      />

      {/* Liste des lignes (Style Ancien avec UnifiedLyricsList) */}
      <div className="flex-1 min-h-[400px]">
         <UnifiedLyricsList
            lines={lines}
            selectedLineId={selectedLineId}
            onSelectLine={onSelectLine}
            onClearTimestamp={onClearTimestamp}
            onUpdateTimestamp={onUpdateTimestamp}
            onUpdateLineContent={onUpdateLineContent}
            onDeleteLine={onDeleteLine}
         />
      </div>

      {/* Footer Actions (Style Ancien) */}
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
          canExport
            ? "border-green-500/30 bg-green-500/5"
            : "border-white/10 bg-slate-800/30"
        )}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">
            {canExport ? "Prêt à exporter !" : "Synchronisez au moins une ligne"}
          </span>
          <span className="text-xs text-muted-foreground">
            {canExport
              ? `${syncStats.synced} ligne${syncStats.synced > 1 ? 's' : ''} synchronisée${syncStats.synced > 1 ? 's' : ''}`
              : "Utilisez les contrôles ci-dessus pour synchroniser"
            }
          </span>
        </div>

        <div className="flex items-center gap-2">
            {/* Boutons secondaires */}
            {lines.length > 0 && (
              <>
                 <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearList}
                  className="hidden sm:flex gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 mr-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreviewLyrics}
                  className="gap-1.5"
                  disabled={!audio.isLoaded || syncStats.synced === 0}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </>
            )}

          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2"
            >
              Retour
            </Button>
          )}

          <Button
            onClick={onContinue}
            disabled={!canExport}
            className={cn(
              "gap-2 transition-all duration-300",
              canExport && "bg-green-500 hover:bg-green-600"
            )}
          >
            Exporter
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
