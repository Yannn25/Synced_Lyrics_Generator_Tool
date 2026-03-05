"use client";

import React from "react";
import { Music, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "@/components/AudioPlayer";
import LyricsInput from "@/components/LyricsInput";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";

interface StepInputProps {
  audio: ReturnType<typeof useAudio>;
  onLoadLyrics: (text: string) => void;
  onContinue: () => void;
  lyricsLoaded: boolean;
}

/**
 * StepInput - Conteneur pour l'étape 1 du workflow
 *
 * Regroupe AudioPlayer et LyricsInput dans un layout avec tabs.
 * Affiche un bouton "Continuer" quand l'audio ET les lyrics sont chargés.
 */
export default function StepInput({
  audio,
  onLoadLyrics,
  onContinue,
  lyricsLoaded,
}: StepInputProps) {

  // Conditions pour passer à l'étape suivante
  const audioReady = audio.isLoaded;
  const lyricsReady = lyricsLoaded;
  const canContinue = audioReady && lyricsReady;

  return (
    <div className="flex flex-col gap-6">
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
        </div>
      </div>

      {/* Tabs pour AudioPlayer et LyricsInput */}
      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audio" className="gap-2">
            <Music className="h-4 w-4" />
            Audio
            {audioReady && (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            )}
          </TabsTrigger>
          <TabsTrigger value="lyrics" className="gap-2">
            <FileText className="h-4 w-4" />
            Lyrics
            {lyricsReady && (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audio" className="mt-4">
          <AudioPlayer
            audio={audio}
            onSyncLine={() => {}} // Non utilisé dans cette étape
            canSync={false}
          />
        </TabsContent>

        <TabsContent value="lyrics" className="mt-4">
          <LyricsInput onLoadLyrics={onLoadLyrics} />
        </TabsContent>
      </Tabs>

      {/* Section de progression */}
      <div
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
      </div>
    </div>
  );
}

