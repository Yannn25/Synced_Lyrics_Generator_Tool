"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Play,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useAudio } from "@/hooks/useAudio";
import { useExport } from "@/hooks/useExport";
import { LyricLine, ChordLine } from "@/types";
import { formatTime } from "@/utils/formatTime";
import { cn } from "@/lib/utils";
import {
  stepVariants,
  stepTransition,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/animations";

// Composant réutilisable
import ExportPanel from "@/components/ExportPanel";
import MiniAudioControls from "@/components/MiniAudioControls";

interface StepExportProps {
  audio: ReturnType<typeof useAudio>;
  lyrics: LyricLine[];
  chords?: ChordLine[];
  musicalKey?: string;
  exporter: ReturnType<typeof useExport>;
  onBack: () => void;
  onPreviewLyrics: () => void;
}

/**
 * StepExport - Conteneur pour l'étape 3 du workflow (Export)
 *
 * Utilise ExportPanel pour les boutons d'export.
 * Affiche des stats finales et le bouton Preview.
 */
export default function StepExport({
  audio,
  lyrics,
  chords = [],
  musicalKey,
  exporter,
  onBack,
  onPreviewLyrics,
}: StepExportProps) {
  const stats = exporter.getExportStats(lyrics);

  // Calcul de la durée totale synced
  const syncedLyrics = lyrics.filter(
    (l) => l.isSynced && l.timestamp !== null
  );
  const firstTimestamp =
    syncedLyrics.length > 0
      ? Math.min(...syncedLyrics.map((l) => l.timestamp!))
      : 0;
  const lastTimestamp =
    syncedLyrics.length > 0
      ? Math.max(...syncedLyrics.map((l) => l.timestamp!))
      : 0;
  const syncedDuration = lastTimestamp - firstTimestamp;

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Export
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Prévisualise puis télécharge tes lyrics synchronisées
          </p>
        </div>

        {/* Bouton Preview Lyrics */}
        <Button
          variant="outline"
          onClick={onPreviewLyrics}
          className="gap-2"
          disabled={!audio.isLoaded || stats.synced === 0}
        >
          <Play className="h-4 w-4" />
          Preview Lyrics
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <motion.div
          variants={staggerItemVariants}
          className={cn(
            "p-4 text-center rounded-xl border",
            "bg-slate-900/40 backdrop-blur-xl border-white/10"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Lignes
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {stats.total}
          </span>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          className={cn(
            "p-4 text-center rounded-xl border",
            "bg-slate-900/40 backdrop-blur-xl border-white/10"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Synced
            </span>
          </div>
          <span className="text-2xl font-bold text-green-400">
            {stats.synced}
          </span>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          className={cn(
            "p-4 text-center rounded-xl border",
            "bg-slate-900/40 backdrop-blur-xl border-white/10"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Complet
            </span>
          </div>
          <span className="text-2xl font-bold text-yellow-400">
            {stats.percentage}%
          </span>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          className={cn(
            "p-4 text-center rounded-xl border",
            "bg-slate-900/40 backdrop-blur-xl border-white/10"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Durée
            </span>
          </div>
          <span className="text-2xl font-bold text-blue-400">
            {formatTime(syncedDuration)}
          </span>
        </motion.div>
      </motion.div>

      {/* Export Panel - Réutilisation du composant */}
      <Card
        className={cn(
          "relative overflow-hidden",
          "bg-slate-900/40 backdrop-blur-xl",
          "border border-white/10",
          "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        )}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Download className="h-5 w-5 text-primary" />
            Télécharger
          </CardTitle>
          <CardDescription className="text-xs">
            Choisis ton format d'export
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Utilisation de ExportPanel sans la carte wrapper */}
          <ExportPanel lyrics={lyrics} chords={chords} musicalKey={musicalKey} exporter={exporter} showCard={false} />
        </CardContent>
      </Card>

      {/*
      <Card>
        <MiniAudioControls currentTime={} duration={} isPlaying={} onPlay={} onPause={} onSeek={}>

        </MiniAudioControls>
      </Card> */}

      {/* Navigation retour */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-800/30">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour à la synchronisation
        </Button>

        <Button
          variant="ghost"
          onClick={() => window.location.reload()}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <RefreshCw className="h-4 w-4" />
          Nouveau Chant
        </Button>
      </div>
    </motion.div>
  );
}
