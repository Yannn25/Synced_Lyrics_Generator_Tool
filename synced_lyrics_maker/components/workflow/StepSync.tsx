"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MiniAudioControls from "@/components/MiniAudioControls";
import { useAudio } from "@/hooks/useAudio";
import { UnifiedLine } from "@/types";
import { cn } from "@/lib/utils";
import { stepVariants, stepTransition } from "@/lib/animations";
import { UnifiedLineItem } from "@/components/UnifiedLineItem";

interface StepSyncProps {
  audio: ReturnType<typeof useAudio>;
  lines: UnifiedLine[];
  selectedLineId: number | null;
  onSelectLine: (lineId: number) => void;
  onClearTimestamp: (lineId: number) => void;
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
 * Affiche une liste unique de lignes avec:
 * - Texte des paroles (stripped)
 * - Accords positionnés au-dessus (style leadsheet)
 * - Badge de section (Verse, Chorus, etc.)
 * - Indicateur de synchronisation
 *
 * La synchronisation s'applique à la ligne entière (lyrics + chords)
 */
export default function StepSync({
  audio,
  lines,
  selectedLineId,
  onSelectLine,
  onClearTimestamp,
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

  const canContinue = syncStats.synced > 0;

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col gap-6 h-full pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Synchronisation Unifiée
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Appuyez sur Entrée pour synchroniser la ligne sélectionnée.
            Espace pour play/pause.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <Badge
            variant="outline"
            className={cn(
              "transition-all",
              syncStats.synced > 0 &&
                "bg-green-500/20 text-green-400 border-green-500/30"
            )}
          >
            {syncStats.synced}/{syncStats.total} synced
          </Badge>
          <div className="text-sm font-semibold text-primary">
            {syncStats.percentage}%
          </div>
        </div>
      </div>

      {/* Layout: Audio controls + List */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* LEFT: List of lines */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-slate-900/40 border border-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${syncStats.percentage}%` }}
            />
          </div>

          {/* Lines list - scrollable */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {lines.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <p className="text-sm">Aucune ligne chargée</p>
                  <p className="text-xs mt-2 opacity-70">
                    Retournez à l'étape 1 pour charger du contenu ChordPro
                  </p>
                </div>
              </div>
            ) : (
              lines.map((line) => (
                <UnifiedLineItem
                  key={line.id}
                  line={line}
                  isSelected={selectedLineId === line.id}
                  onSelect={onSelectLine}
                  onDelete={onDeleteLine}
                  onClearTimestamp={onClearTimestamp}
                />
              ))
            )}
          </div>

          {/* Bottom actions */}
          {lines.length > 0 && (
            <div className="flex gap-2 pt-4 border-t border-white/5">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={onClearList}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT: Audio controls + Navigation */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Audio Controls */}
          <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
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
          </div>

          {/* Preview Button */}
          <Button
            variant="secondary"
            className="w-full"
            onClick={onPreviewLyrics}
            disabled={lines.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Karaoké
          </Button>

          {/* Continue Button */}
          <Button
            size="lg"
            className={cn(
              "w-full transition-all duration-300",
              canContinue
                ? "bg-gradient-to-r from-primary to-cyan-600 hover:scale-[1.02] shadow-lg shadow-primary/20"
                : "opacity-50 cursor-not-allowed"
            )}
            disabled={!canContinue}
            onClick={onContinue}
          >
            Continuer vers l'Export
          </Button>

          {/* Back Button */}
          {onBack && (
            <Button
              variant="ghost"
              className="w-full text-slate-400 hover:text-white"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}

          {/* Tips */}
          <div className="p-4 rounded-lg bg-slate-900/20 border border-white/5 text-xs text-muted-foreground space-y-2">
            <h4 className="font-semibold text-foreground">Raccourcis</h4>
            <ul className="space-y-1 text-slate-400">
              <li>
                <code className="text-green-400">Espace</code> : Play/Pause
              </li>
              <li>
                <code className="text-green-400">Entrée</code> : Sync ligne
              </li>
              <li>Cliquez sur une ligne pour la sélectionner</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
