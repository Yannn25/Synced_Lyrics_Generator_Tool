'use client'

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Upload, Rewind, FastForward, Music, AlertCircle } from "lucide-react";
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
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);


  // Gestion du fichier audio
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      loadAudio(file);
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

  // Animation waveform (visuelle)
  const waveformBars = Array.from({ length: 24 }).map((_, i) => (
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
  ));

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

  // Version chargée (Compacte et Stylée)
  return (
      <Card className={cn(
          "relative overflow-hidden",
          "bg-slate-900/60 backdrop-blur-2xl",
          "border border-white/10",
          "shadow-2xl shadow-primary/10"
      )}>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-center">

            {/* File Info */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-lg",
                  isPlaying ? "bg-primary text-primary-foreground" : "bg-slate-800 text-slate-400"
              )}>
                <Music className="h-6 w-6" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-foreground truncate max-w-[150px] md:max-w-[200px]" title={fileName}>
                  {fileName || "Audio Track"}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", isPlaying ? "bg-green-400 animate-pulse" : "bg-slate-600")} />
                  {isPlaying ? "Lecture en cours" : "En pause"}
                </p>
              </div>
            </div>

            {/* Controls & Waveform */}
            <div className="flex flex-col gap-4 w-full">
              {/* Waveform Visualization (Fake) */}
              <div className="h-8 flex items-center justify-center gap-[2px] opacity-70 w-full overflow-hidden">
                {waveformBars}
              </div>

              {/* Progress Bar & Buttons */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-primary min-w-[50px] text-right">{formatTime(currentTime)}</span>

                <Slider
                    value={[currentTime]}
                    min={0}
                    max={duration || 100}
                    step={0.01}
                    onValueChange={handleSliderChange}
                    className="cursor-pointer flex-1"
                />

                <span className="text-xs font-mono text-muted-foreground min-w-[50px]">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls Overlay (When hovering or simple layout) - Integrated here for simplicity */}
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