'use client'

import React, { useRef } from "react";
import { Play, Pause, Upload, Rewind, FastForward, Clock } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { formatTime } from "@/utils/formatTime";

// Composants shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audio: ReturnType<typeof useAudio>;
  onSyncLine: () => void;
  canSync: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audio, onSyncLine, canSync }) => {
  const {
    isPlaying,
    currentTime,
    duration,
    isLoaded,
    error,
    loadAudio,
    togglePlay,
    seek,
  } = audio;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gestion du fichier audio
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadAudio(file);
    }
  };

  // Gestion du slider de progression
  const handleSliderChange = (value: number[]) => {
    seek(value[0]);
  };

  // Ouvrir le sélecteur de fichiers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={cn(
      "relative overflow-hidden",
      // Effet Glass
      "bg-slate-900/40 backdrop-blur-xl",
      "border border-white/10",
      "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    )}>
      {/* Reflet glass subtil en haut */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Upload className="h-5 w-5 text-primary" />
          Audio
        </CardTitle>
        <CardDescription>
          Charge un fichier puis contrôle la lecture.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Input file caché + bouton stylisé */}
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleUploadClick}
                  className={cn(
                    "w-full h-12 gap-3",
                    "bg-slate-800/50 border-white/10 hover:bg-slate-700/50 hover:border-white/20",
                    "transition-all duration-300"
                  )}
                >
                  <Upload className="h-4 w-4" />
                  {isLoaded ? "Changer de fichier" : "Choisir un fichier audio"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Formats supportés : MP3, WAV, OGG, etc.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="rounded-lg bg-red-500/15 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Message si pas d'audio chargé */}
        {!isLoaded && !error && (
          <div className={cn(
            "rounded-xl px-4 py-8 text-center",
            "bg-slate-800/30 border border-white/5"
          )}>
            <Upload className="h-8 w-8 mx-auto mb-3 text-slate-500" />
            <p className="text-sm text-slate-400">Charger un fichier audio pour commencer</p>
          </div>
        )}

        {/* Contrôles audio - Affichés si audio chargé */}
        {isLoaded && (
          <>
            {/* Barre de progression avec timestamps */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm font-mono">
                <span className="text-primary font-bold">{formatTime(currentTime)}</span>
                <span className="text-muted-foreground">{formatTime(duration)}</span>
              </div>

              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.01}
                onValueChange={handleSliderChange}
                className="cursor-pointer"
              />
            </div>

            {/* Boutons de contrôle */}
            <div className="flex items-center justify-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => seek(Math.max(0, currentTime - 5))}
                      className="gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Rewind className="h-4 w-4" />
                      5s
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reculer de 5 secondes</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="default"
                size="lg"
                onClick={togglePlay}
                className={cn(
                  "px-8 gap-2 font-semibold",
                  "bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90",
                  "shadow-lg shadow-primary/20"
                )}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Play
                  </>
                )}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => seek(Math.min(duration, currentTime + 5))}
                      className="gap-1 text-muted-foreground hover:text-foreground"
                    >
                      5s
                      <FastForward className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Avancer de 5 secondes</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Section Sync
            <div className={cn(
              "flex items-center justify-between gap-4 rounded-xl px-4 py-3",
              "bg-primary/5 border border-primary/20"
            )}>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Synchroniser</p>
                  <p className="text-xs text-muted-foreground">
                    {canSync ? "Ligne prête à synchroniser" : "Sélectionne une ligne"}
                  </p>
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={onSyncLine}
                      disabled={!canSync}
                      className={cn(
                        canSync && "bg-green-500 hover:bg-green-600"
                      )}
                    >
                      Sync
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {canSync ? "Synchroniser la ligne sélectionnée" : "Sélectionnez d'abord une ligne"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div> */}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;