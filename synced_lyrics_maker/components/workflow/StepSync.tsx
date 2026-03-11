"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music, FileText, Guitar, ArrowRight, Eye, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LyricsList from "@/components/LyricsList";
import ChordsList from "@/components/ChordsList";
import CombinedView from "@/components/CombinedView";
import MiniAudioControls from "@/components/MiniAudioControls";
import HelpModal from "@/components/HelpModal";
import { useAudio } from "@/hooks/useAudio";
import { LyricLine, ChordLine, ChordNotation, ChordSymbol, ViewMode } from "@/types";
import { cn } from "@/lib/utils";
import { stepVariants, stepTransition } from "@/lib/animations";
import { KEY_OPTIONS } from "@/utils/chordNotation";

interface StepSyncProps {
  // Audio
  audio: ReturnType<typeof useAudio>;

  // Lyrics
  lyrics: LyricLine[];
  selectedLineId: number | null;
  onSelectLine: (lineId: number) => void;
  onClearTimestamp: (lineId: number) => void;
  onUpdateTimestamp: (lineId: number, timestamp: number | null) => void;
  onUpdateLineText: (lineId: number, newText: string) => void;
  onDeleteLine: (lineId: number) => void;
  onClearList: () => void;

  // Chords (optionnel)
  chords?: ChordLine[];
  selectedChordId?: number | null;
  onSelectChord?: (chordId: number) => void;
  onClearChordTimestamp?: (chordId: number) => void;
  onUpdateChordTimestamp?: (chordId: number, timestamp: number | null) => void;
  onUpdateChordText?: (chordId: number, newChords: ChordSymbol[]) => void;
  onDeleteChord?: (chordId: number) => void;
  onClearChordList?: () => void;

  // Sync actions
  onSyncLine: () => void;
  onSyncChord?: () => void;

  // Navigation
  onContinue: () => void;
  onPreviewLyrics: () => void;

  // Optionnel: retour
  onBack?: () => void;
}

/**
 * StepSync - Conteneur pour l'étape 2 du workflow (Synchronisation)
 *
 * Affiche:
 * - Mini contrôles audio avec bouton sync
 * - Toggle entre mode lyrics/accords/combiné
 * - Liste des lyrics à synchroniser
 * - Bouton "Exporter" quand au moins une ligne est synchronisée
 */
export default function StepSync({
  audio,
  lyrics,
  selectedLineId,
  onSelectLine,
  onClearTimestamp,
  onUpdateTimestamp,
  onUpdateLineText,
  onDeleteLine,
  onClearList,
  chords = [],
  selectedChordId = null,
  onSelectChord,
  onClearChordTimestamp,
  onUpdateChordTimestamp,
  onUpdateChordText,
  onDeleteChord,
  onClearChordList,
  onSyncLine,
  onSyncChord,
  onContinue,
  onPreviewLyrics,
  onBack,
}: StepSyncProps) {

  // Mode de vue actuel
  const [viewMode, setViewMode] = useState<ViewMode>("lyrics");

  // Notation des accords
  const [notation, setNotation] = useState<ChordNotation>("english");

  // Tonalité musicale (nécessaire pour notation Nashville/numérique)
  const [musicalKey, setMusicalKey] = useState<string>("C");

  // Y a-t-il des accords chargés ?
  const chordsList = chords ?? [];
  const hasChords = chordsList.length > 0;

  // Stats lyrics
  const syncedCount = lyrics.filter(line => line.isSynced).length;
  const totalCount = lyrics.length;
  const progressPercent = totalCount > 0 ? Math.round((syncedCount / totalCount) * 100) : 0;

  // Stats chords
  const chordsSyncedCount = chordsList.filter(c => c.isSynced).length;

  const canExport = syncedCount > 0;

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col gap-6"
    >
      {/* Header avec progression */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Synchronisation
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Écoute l'audio et synchronise chaque ligne
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{syncedCount}</span>
            <span className="text-lg text-muted-foreground">/{totalCount}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={progressPercent === 100 ? "default" : "outline"}
              className={cn(
                "transition-all duration-300",
                progressPercent === 100 && "bg-green-500/20 text-green-400 border-green-500/30"
              )}
            >
              {progressPercent}% synced
            </Badge>
            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-darkest to-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles audio mini */}
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

      {/* Toggle mode de synchronisation */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="grid grid-cols-3 w-fit">
            <TabsTrigger value="lyrics" className="gap-1.5 px-4">
              <FileText className="h-4 w-4" />
              Lyrics
            </TabsTrigger>
            <TabsTrigger value="chords" className="gap-1.5 px-4" disabled={!hasChords}>
              <Guitar className="h-4 w-4" />
              Accords
              {!hasChords && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1">Vide</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="both" className="gap-1.5 px-4" disabled={!hasChords}>
              <Music className="h-4 w-4" />
              Combiné
              {!hasChords && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1">Vide</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Actions rapides + sélecteur de notation */}
          <div className="flex items-center gap-2">
            {/* Sélecteur de notation (visible quand chords ou both) */}
            {hasChords && (viewMode === "chords" || viewMode === "both") && (
              <Select value={notation} onValueChange={(value) => setNotation(value as ChordNotation)}>
                <SelectTrigger className="w-[160px] h-8 text-xs bg-slate-800/50 border-white/10">
                  <SelectValue placeholder="Notation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">Anglais (C D E)</SelectItem>
                  <SelectItem value="latin">Latin (Do Ré Mi)</SelectItem>
                  <SelectItem value="numerical">Nashville (1 2 3)</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Sélecteur de tonalité (visible uniquement en notation Nashville) */}
            {hasChords && notation === "numerical" && (viewMode === "chords" || viewMode === "both") && (
              <Select value={musicalKey} onValueChange={setMusicalKey}>
                <SelectTrigger className="w-[160px] h-8 text-xs bg-slate-800/50 border-white/10">
                  <SelectValue placeholder="Tonalité" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {KEY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <HelpModal />
            {lyrics.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreviewLyrics}
                  className="gap-1.5"
                  disabled={!audio.isLoaded || syncedCount === 0}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearList();
                    onClearChordList?.();
                  }}
                  className="gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Contenu des tabs */}
        <TabsContent value="lyrics" className="mt-4">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title text-base">Liste des Lyrics</h3>
                <p className="card-subtitle text-xs">
                  Clique sur une ligne pour la sélectionner, puis appuie sur <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Entrée</kbd> ou <span className="text-primary">Sync</span>
                </p>
              </div>
            </div>
            <div className="card-body">
              <LyricsList
                lyrics={lyrics}
                selectedLineId={selectedLineId}
                onSelectLine={onSelectLine}
                onClearTimestamp={onClearTimestamp}
                onUpdateTimestamp={onUpdateTimestamp}
                onUpdateLineText={onUpdateLineText}
                onDeleteLine={onDeleteLine}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chords" className="mt-4">
          {hasChords && onSelectChord && onClearChordTimestamp && onUpdateChordTimestamp && onUpdateChordText && onDeleteChord ? (
            <ChordsList
              chords={chordsList}
              selectedChordId={selectedChordId ?? null}
              onSelectChord={onSelectChord}
              onClearTimestamp={onClearChordTimestamp}
              onUpdateTimestamp={onUpdateChordTimestamp}
              onUpdateChordText={onUpdateChordText}
              onDeleteChord={onDeleteChord}
              notation={notation}
              musicalKey={musicalKey}
            />
          ) : (
            <div className="card">
              <div className="card-body py-12 text-center">
                <Guitar className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucun accord chargé
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Retournez à l'étape 1, sélectionnez l'onglet "Paroles + Accords"
                  et chargez vos accords pour les synchroniser ici.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="both" className="mt-4">
          {hasChords ? (
            <CombinedView
              lyrics={lyrics}
              chords={chordsList}
              onSync={() => {}}
              notation={notation}
              musicalKey={musicalKey}
            />
          ) : (
            <div className="card">
              <div className="card-body py-12 text-center">
                <Music className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Vue Combinée
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Chargez d&apos;abord des accords pour activer cette vue.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Section navigation */}
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
              ? `${syncedCount} ligne${syncedCount > 1 ? 's' : ''} synchronisée${syncedCount > 1 ? 's' : ''}`
              : "Utilisez les contrôles ci-dessus pour synchroniser"
            }
          </span>
        </div>

        <div className="flex items-center gap-2">
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

