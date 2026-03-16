"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music, AudioLines, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AudioPlayer from "@/components/AudioPlayer";
import LyricsInput from "@/components/LyricsInput";
import ChordsInput from "@/components/ChordsInput";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";
import { stepVariants, stepTransition, cardVariants } from "@/lib/animations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KEY_OPTIONS } from "@/utils/chordNotation";

interface StepInputProps {
  audio: ReturnType<typeof useAudio>;
  onLoadLyrics: (text: string) => void;
  onLoadChords?: (text: string) => void;
  lyricsDraft: string;
  onLyricsDraftChange: (text: string) => void;
  chordsDraft?: string;
  onChordsDraftChange?: (text: string) => void;
  onContinue: () => void;
  lyricsLoaded: boolean;
  chordsLoaded?: boolean;
  musicalKey?: string;
  onMusicalKeyChange?: (key: string) => void;
}

/**
 * StepInput - Conteneur pour l'étape 1 du workflow
 *
 * Regroupe AudioPlayer et LyricsInput l'un au-dessus de l'autre.
 * Affiche un bouton "Continuer" quand l'audio ET les lyrics sont chargés.
 */
export default function StepInput({
  audio,
  onLoadLyrics,
  onLoadChords,
  lyricsDraft,
  onLyricsDraftChange,
  chordsDraft = "",
  onChordsDraftChange,
  onContinue,
  lyricsLoaded,
  chordsLoaded = false,
  musicalKey = "C",
  onMusicalKeyChange,
}: StepInputProps) {
  const [activeTab, setActiveTab] = useState<"lyrics" | "chords">("lyrics");

  // Conditions pour passer à l'étape suivante
  const audioReady = audio.isLoaded;
  const lyricsReady = lyricsLoaded;
  const canContinue = audioReady && lyricsReady;

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col gap-6"
    >
      {/* Header avec indicateurs de statut */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Charger vos fichiers
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Importez un fichier audio et vos paroles pour commencer
          </p>
        </div>

        {/* Indicateurs de statut */}
        <div className="flex items-center gap-2">
          <Badge
            variant={audioReady ? "default" : "outline"}
            className={cn(
              "gap-1.5 transition-all duration-300",
              audioReady && "bg-green-500/20 text-green-400 border-green-500/30"
            )}
          >
            {audioReady ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Music className="h-3.5 w-3.5" />
            )}
            Audio
          </Badge>
          <Badge
            variant={lyricsReady ? "default" : "outline"}
            className={cn(
              "gap-1.5 transition-all duration-300",
              lyricsReady && "bg-green-500/20 text-green-400 border-green-500/30"
            )}
          >
            {lyricsReady ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            Lyrics
          </Badge>
          {chordsLoaded && (
            <Badge
              variant="default"
              className="gap-1.5 transition-all duration-300 bg-purple-500/20 text-purple-400 border-purple-500/30"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accords
            </Badge>
          )}
        </div>
      </div>

      {/* Layout vertical : AudioPlayer au-dessus, Tabs en-dessous */}
      <div className="flex flex-col gap-6 w-full">
        {/* Section Audio */}
        <div className="w-full">
          <AudioPlayer
            audio={audio}
            onSyncLine={() => {}} // Non utilisé dans cette étape
            canSync={false}
          />
        </div>

        {/* Section Lyrics / Chords avec Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "lyrics" | "chords")} className="w-full">
          <TabsList className={cn(
            "w-full",
            "bg-slate-800/50 backdrop-blur-sm border border-white/10"
          )}>
            <TabsTrigger
              value="lyrics"
              className="flex-1 gap-1.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <FileText className="h-3.5 w-3.5" />
              Paroles
            </TabsTrigger>
            <TabsTrigger
              value="chords"
              className="flex-1 gap-1.5 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Music className="h-3.5 w-3.5" />
              Accords
            </TabsTrigger>
          </TabsList>

          {/* Paroles: reste monté, seulement masqué */}
          <div className={cn("mt-4", activeTab === "lyrics" ? "block" : "hidden")}>
            <LyricsInput
              value={lyricsDraft}
              onValueChange={onLyricsDraftChange}
              onLoadLyrics={onLoadLyrics}
            />
          </div>

          {/* Accords: reste monté, seulement masqué */}
          <div className={cn("mt-4", activeTab === "chords" ? "block" : "hidden")}>
            <div className="flex flex-col gap-4">
              {/* Sélecteur de tonalité */}
              {onMusicalKeyChange && (
                  <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      "bg-slate-800/30 border-white/10"
                  )}>
                    <AudioLines className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">
                      Tonalité du morceau
                    </span>
                      <span className="text-[11px] text-muted-foreground">
                      Utilisé pour la notation Nashville (chiffrée)
                    </span>
                    </div>
                    <Select value={musicalKey} onValueChange={onMusicalKeyChange}>
                      <SelectTrigger className="w-[180px] h-8 text-xs bg-slate-900/50 border-white/10">
                        <SelectValue placeholder="Tonalité" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {KEY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label} ({opt.english})
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              )}

              {onLoadChords && (
                <ChordsInput
                  value={chordsDraft}
                  onValueChange={onChordsDraftChange}
                  onLoadChords={onLoadChords}
                />
              )}
            </div>
          </div>
        </Tabs>
      </div>

      {/* Section de progression */}
      <motion.div
        variants={cardVariants}
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
          canContinue
            ? "border-green-500/30 bg-green-500/5"
            : "border-white/10 bg-slate-800/30"
        )}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">
            {canContinue ? "Prêt à synchroniser !" : "Étapes à compléter"}
          </span>
          <span className="text-xs text-muted-foreground">
            {!audioReady && !lyricsReady && "Chargez l'audio et les lyrics"}
            {audioReady && !lyricsReady && "Il ne reste plus qu'à charger les lyrics"}
            {!audioReady && lyricsReady && "Il ne reste plus qu'à charger l'audio"}
            {canContinue && "Passez à l'étape de synchronisation"}
          </span>
        </div>

        <Button
          onClick={onContinue}
          disabled={!canContinue}
          className={cn(
            "gap-2 transition-all duration-300",
            canContinue && "bg-green-500 hover:bg-green-600"
          )}
        >
          Continuer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
