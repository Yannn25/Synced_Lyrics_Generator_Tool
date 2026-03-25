'use client'

import React, { useRef, useState } from "react";
import { Play, Pause, Upload, Rewind, FastForward, Music, AlertCircle, Clock } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { formatTime } from "@/utils/formatTime";

// Composants shadcn/ui
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audio: ReturnType<typeof useAudio>;
  onSyncLine?: () => void;
  canSync?: boolean;
  showSyncButton?: boolean;
  compact?: boolean; // Mode compact (comme MiniAudioControls)
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audio, 
  onSyncLine, 
  canSync = false,
  showSyncButton = false,
  compact = false,
  className 
}) => {
  const {
    isPlaying,
    currentTime,
    duration,
    isLoaded,
    error,
    loadAudio,
    togglePlay,
    play,
    pause,
    seek,
  } = audio;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);


  // Gestion du fichier audio (avec fix pour le rechargement)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      loadAudio(file);
      // Reset input pour permettre de recharger le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Gestion du Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setFileName(file.name);
      loadAudio(file);
      // Reset input pour permettre de recharger le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Ouvrir le sélecteur de fichiers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Animation waveform (visuelle) - uniquement pour mode full
  const waveformBars = !compact ? Array.from({ length: 24 }).map((_, i) => (
      <div
          key={i}
          className={cn("waveform-bar", isPlaying ? "running" : "paused")}
          style={{
            height: `${Math.random() * 60 + 20}%`,
            animationDelay: `${i * 0.05}s`,
            animationPlayState: isPlaying ? "running" : "paused",
            opacity: isPlaying ? 1 : 0.5
          }}
      />
  )) : null;

  // Mode Compact (comme MiniAudioControls)
  if (compact && isLoaded) {
    return (
      <div className={cn(
        "flex flex-col gap-6 rounded-xl transition-all duration-300 p-6",
        className
      )}>
        {/* Timeline avec temps */}
        <div className="flex items-center gap-4 w-full">
          <span className="font-mono text-primary font-bold tabular-nums text-right text-sm w-16">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 group h-4 flex items-center">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.01}
              onValueChange={(value) => seek(value[0])}
              className="cursor-pointer py-2"
            />
          </div>

          <span className="font-mono text-muted-foreground tabular-nums text-sm w-16">
            {formatTime(duration)}
          </span>
        </div>

        {/* Boutons de contrôle centrés */}
        <div className="flex items-center justify-center gap-4 md:gap-6 relative">
          {/* Groupe Contrôles de lecture */}
          <div className="flex items-center gap-2 md:gap-4 bg-slate-900/30 p-1.5 rounded-full border border-white/5 shadow-inner">
            {/* Reculer 5s */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => seek(Math.max(0, currentTime - 5))}
                    className="h-10 w-10 rounded-full text-muted-foreground hover:text-white hover:bg-white/10"
                  >
                    <Rewind className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reculer de 5s</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Play/Pause Principal */}
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className={cn(
                "h-14 w-14 rounded-full shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95",
                "bg-gradient-to-tr from-primary-darkest to-primary border border-white/10"
              )}
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="h-7 w-7 ml-1 fill-current" />
              )}
            </Button>

            {/* Avancer 5s */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => seek(Math.min(duration, currentTime + 5))}
                    className="h-10 w-10 rounded-full text-muted-foreground hover:text-white hover:bg-white/10"
                  >
                    <FastForward className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Avancer de 5s</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Bouton Sync séparé (Si activé) */}
          {showSyncButton && onSyncLine && (
            <div className="absolute right-0 hidden md:block">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={onSyncLine}
                      disabled={!canSync}
                      className={cn(
                        "gap-2 px-6 font-semibold shadow-lg transition-all",
                        canSync 
                          ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20" 
                          : "bg-slate-800 text-slate-500"
                      )}
                    >
                      <Clock className="h-4 w-4" />
                      SYNC
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    Appuyez pour synchroniser (ou Entrée)
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        
        {/* Bouton Sync Mobile (si activé, sous les contrôles) */}
        {showSyncButton && onSyncLine && (
          <div className="md:hidden w-full mt-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={onSyncLine}
              disabled={!canSync}
              className={cn(
                "w-full gap-2 font-semibold shadow-lg",
                canSync 
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20" 
                  : "bg-slate-800 text-slate-500"
              )}
            >
              <Clock className="h-4 w-4" />
              SYNC LIGNE
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Mode non chargé (Upload)
  if (!isLoaded) {
    return (
        <Card className={cn(
            "relative overflow-hidden group transition-all duration-500",
            "bg-slate-900/40 backdrop-blur-xl border-dashed border-2",
            isDragging ? "border-primary bg-primary/10 shadow-[0_0_60px_-15px_rgba(14,165,233,0.5)] scale-[1.02]" : "border-white/10 hover:border-primary/50",
            "min-h-[300px] flex items-center justify-center cursor-pointer",
            "shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_60px_-15px_rgba(14,165,233,0.3)]"
        )}
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <CardContent className="flex flex-col items-center gap-6 p-10 z-10 text-center">
            <input
                ref={fileInputRef}
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="w-24 h-24 rounded-full bg-slate-800/80 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
              <Upload className="h-10 w-10 text-primary animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                {isDragging ? "Lâchez pour uploader !" : "Déposez votre fichier audio"}
              </h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Formats supportés : MP3, WAV, OGG. <br/>
                Cliquez pour parcourir ou glissez-déposez.
              </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
            )}
          </CardContent>
        </Card>
    );
  }

  // Version chargée (Mode Full - avec waveform et file info)
  return (
      <Card className={cn(
          "relative overflow-hidden",
          "bg-slate-900/60 backdrop-blur-2xl",
          "border border-white/10",
          "shadow-2xl shadow-primary/10",
          className
      )}>
        {/* Input caché pour changement de fichier */}
        <input
          ref={fileInputRef}
          id="audio-file-change"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-center">

            {/* File Info */}
            <div className="flex items-center gap-5 min-w-[200px]">
              <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/5",
                  isPlaying ? "bg-primary text-primary-foreground" : "bg-slate-800 text-slate-400"
              )}>
                <Music className="h-7 w-7" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-lg text-foreground truncate max-w-[150px] md:max-w-[200px]" title={fileName}>
                  {fileName || "Audio Track"}
                </h4>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className={cn("w-2 h-2 rounded-full", isPlaying ? "bg-green-400 animate-pulse" : "bg-slate-600")} />
                  {isPlaying ? "Lecture en cours" : "En pause"}
                </p>
              </div>
            </div>

            {/* Controls & Waveform */}
            <div className="flex flex-col gap-4 w-full">
              {/* Waveform Visualization (Fake) */}
              {waveformBars && (
                <div className="h-8 flex items-center justify-center gap-[2px] opacity-70 w-full overflow-hidden">
                  {waveformBars}
                </div>
              )}

              {/* Progress Bar & Time */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-primary min-w-[50px] text-right">{formatTime(currentTime)}</span>

                <Slider
                    value={[currentTime]}
                    min={0}
                    max={duration || 100}
                    step={0.01}
                    onValueChange={(value) => seek(value[0])}
                    className="cursor-pointer flex-1"
                />

                <span className="text-xs font-mono text-muted-foreground min-w-[50px]">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center gap-2 justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => seek(Math.max(0, currentTime - 5))}
                        className="text-muted-foreground hover:text-white"
                    >
                      <Rewind className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>-5s</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                  size="lg"
                  onClick={togglePlay}
                  className={cn(
                      "rounded-full w-14 h-14 p-0 shadow-lg shadow-primary/25 hover:scale-105 transition-transform",
                      "bg-gradient-to-tr from-primary-darkest to-primary"
                  )}
              >
                {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 ml-1 fill-current" />}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => seek(Math.min(duration, currentTime + 5))}
                        className="text-muted-foreground hover:text-white"
                    >
                      <FastForward className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>+5s</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-8 bg-white/10 mx-2" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleUploadClick}
                        className="text-muted-foreground hover:text-white"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Changer de fichier</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default AudioPlayer;