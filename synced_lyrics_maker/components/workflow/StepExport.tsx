"use client";

import React from "react";
import {
  FileJson, 
  FileText, 
  Play,
  CheckCircle2,
  Clock, 
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/hooks/useAudio";
import { useExport } from "@/hooks/useExport";
import { LyricLine } from "@/types";
import { formatTime } from "@/utils/formatTime";
import { cn } from "@/lib/utils";

interface StepExportProps {
  // Audio (pour preview lyrics)
  audio: ReturnType<typeof useAudio>;
  
  // Lyrics
  lyrics: LyricLine[];
  
  // Exporter hook
  exporter: ReturnType<typeof useExport>;
  
  // Navigation
  onBack: () => void;

  // Ouvre la LyricsPreviewModal (preview lyrics en temps réel avec audio)
  onPreviewLyrics: () => void;
}

/**
 * StepExport - Conteneur pour l'étape 3 du workflow (Export)
 * 
 * Affiche:
 * - Stats finales (lignes synced, durée, etc.)
 * - Bouton Preview lyrics (ouvre LyricsPreviewModal)
 * - Boutons d'export (JSON / LRC)
 */
export default function StepExport({
  audio,
  lyrics,
  exporter,
  onBack,
  onPreviewLyrics,
}: StepExportProps) {
  
  const { quickExport, getExportStats } = exporter;
  const stats = getExportStats(lyrics);
  
  // Calcul de la durée totale synced
  const syncedLyrics = lyrics.filter(l => l.isSynced && l.timestamp !== null);
  const firstTimestamp = syncedLyrics.length > 0 
    ? Math.min(...syncedLyrics.map(l => l.timestamp!)) 
    : 0;
  const lastTimestamp = syncedLyrics.length > 0 
    ? Math.max(...syncedLyrics.map(l => l.timestamp!)) 
    : 0;
  const syncedDuration = lastTimestamp - firstTimestamp;

  return (
    <div className="flex flex-col gap-6">
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
        
        {/* Bouton Preview Lyrics — ouvre la LyricsPreviewModal */}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Lignes</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{stats.total}</span>
        </div>
        
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Synced</span>
          </div>
          <span className="text-2xl font-bold text-green-400">{stats.synced}</span>
        </div>
        
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Complet</span>
          </div>
          <span className="text-2xl font-bold text-yellow-400">{stats.percentage}%</span>
        </div>
        
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Durée</span>
          </div>
          <span className="text-2xl font-bold text-blue-400">{formatTime(syncedDuration)}</span>
        </div>
      </div>

      {/* Boutons d'export */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title text-base">Télécharger</h3>
            <p className="card-subtitle text-xs">Choisis ton format d'export</p>
          </div>
        </div>
        
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export JSON */}
            <button
              onClick={() => quickExport(lyrics, 'json')}
              disabled={stats.synced === 0}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300",
                "hover:border-primary hover:bg-primary/5",
                stats.synced > 0 
                  ? "border-white/10 bg-slate-800/30 cursor-pointer" 
                  : "border-white/5 bg-slate-800/10 cursor-not-allowed opacity-50"
              )}
            >
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                <FileJson className="h-7 w-7 text-blue-400" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground">JSON</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Format structuré, idéal pour les développeurs
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                .json
              </Badge>
            </button>
            
            {/* Export LRC */}
            <button
              onClick={() => quickExport(lyrics, 'lrc')}
              disabled={stats.synced === 0}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300",
                "hover:border-primary hover:bg-primary/5",
                stats.synced > 0 
                  ? "border-white/10 bg-slate-800/30 cursor-pointer" 
                  : "border-white/5 bg-slate-800/10 cursor-not-allowed opacity-50"
              )}
            >
              <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center">
                <FileText className="h-7 w-7 text-purple-400" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-foreground">LRC</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Format standard, compatible avec la plupart des lecteurs
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                .lrc
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation retour */}
      <div className="flex items-center justify-start p-4 rounded-xl border border-white/10 bg-slate-800/30">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la synchronisation
        </Button>
      </div>
    </div>
  );
}

