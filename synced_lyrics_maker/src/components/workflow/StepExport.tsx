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
import { LyricLine, ChordLine, UnifiedLine, UnifiedSong } from "@/types";
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
import StepHelpModal from "@/components/workflow/StepHelpModal";
import AudioPlayer from "@/components/AudioPlayer";

interface StepExportProps {
  audio: ReturnType<typeof useAudio>;
  lyrics: (LyricLine | UnifiedLine)[];
  chords?: ChordLine[];
  metadata?: Partial<UnifiedSong>;
  audioBaseName?: string;
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
  metadata,
  audioBaseName,
  exporter,
  onBack,
  onPreviewLyrics,
}: StepExportProps) {
  const stats = exporter.getExportStats(lyrics, chords);

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
      className="flex flex-col gap-8 pb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            Export
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Prévisualise puis télécharge tes lyrics synchronisées
          </p>
        </div>

        {/* Bouton Preview Lyrics */}
        <div className="flex items-center gap-4">
          <StepHelpModal step={3} />
          <Button
            variant="outline"
            onClick={onPreviewLyrics}
            className="gap-2 h-10 px-5 border-white/10 hover:bg-white/5"
            disabled={!audio.isLoaded || stats.synced === 0}
          >
            <Play className="h-4 w-4" />
            Preview Lyrics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-2"
      >
        <motion.div
          variants={staggerItemVariants}
          className={cn(
            "p-6 text-center rounded-2xl border transition-all duration-300 hover:border-white/20 hover:bg-slate-800/60 shadow-lg",
            "bg-slate-900/40 backdrop-blur-xl border-white/5"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-2 rounded-full bg-slate-800/50">
                <FileText className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Lignes
            </span>
          </div>
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {stats.total}
          </span>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          className={cn(
            "p-6 text-center rounded-2xl border transition-all duration-300 hover:border-green-500/30 hover:bg-green-500/5 shadow-lg",
            "bg-slate-900/40 backdrop-blur-xl border-white/5"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
             <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Synced
            </span>
          </div>
          <span className="text-3xl font-bold text-green-400 tracking-tight">
            {stats.synced}
          </span>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          className={cn(
            "p-6 text-center rounded-2xl border transition-all duration-300 hover:border-yellow-500/30 hover:bg-yellow-500/5 shadow-lg",
            "bg-slate-900/40 backdrop-blur-xl border-white/5"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
             <div className="p-2 rounded-full bg-yellow-500/10">
                <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Complet
            </span>
          </div>
          <span className="text-3xl font-bold text-yellow-400 tracking-tight">
            {stats.percentage}%
          </span>
        </motion.div>

        <motion.div
          variants={staggerItemVariants}
          className={cn(
            "p-6 text-center rounded-2xl border transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/5 shadow-lg",
            "bg-slate-900/40 backdrop-blur-xl border-white/5"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
             <div className="p-2 rounded-full bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Durée
            </span>
          </div>
          <span className="text-3xl font-bold text-blue-400 tracking-tight">
            {formatTime(syncedDuration)}
          </span>
        </motion.div>
      </motion.div>

      {/* Export Panel - Réutilisation du composant */}
      <Card
        className={cn(
          "relative overflow-hidden rounded-2xl mb-4",
          "bg-slate-900/40 backdrop-blur-xl",
          "border border-white/10",
          "shadow-xl"
        )}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <CardHeader className="pb-2 pt-6 px-8">
          <CardTitle className="flex items-center gap-3 text-foreground text-lg">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-5 w-5 text-primary" />
            </div>
            Télécharger
          </CardTitle>
          <CardDescription className="text-sm ml-12">
            Choisis ton format d'export
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {/* Utilisation de ExportPanel sans la carte wrapper */}
          <ExportPanel
            lyrics={lyrics}
            chords={chords}
            metadata={metadata}
            audioBaseName={audioBaseName}
            exporter={exporter}
            showCard={false}
          />
        </CardContent>
      </Card>

      {/* Audio Controls */}
      <Card
        className={cn(
          "relative overflow-hidden rounded-2xl mb-2",
          "bg-slate-900/40 backdrop-blur-xl",
          "border border-white/10",
          "shadow-xl"
        )}
      >
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
         
        <CardContent className="p-1">
          <AudioPlayer
            audio={audio}
            showSyncButton={false}
            compact={true}
          />
        </CardContent>
      </Card>

      {/* Navigation retour */}
      <div className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-slate-900/30 backdrop-blur shadow-lg mt-2">
        <Button variant="ghost" onClick={onBack} className="gap-3 h-12 px-6 text-base font-medium hover:bg-white/5">
          <ArrowLeft className="h-4 w-4" />
          Retour à la synchronisation
        </Button>

        <Button
          variant="ghost"
          onClick={() => window.location.reload()}
          className="gap-3 h-12 px-6 text-base font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <RefreshCw className="h-4 w-4" />
          Nouveau Chant
        </Button>
      </div>
    </motion.div>
  );
}
