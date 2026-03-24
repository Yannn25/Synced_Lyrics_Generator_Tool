'use client'

import React from "react";
import { FileJson, FileText, Download, Guitar } from "lucide-react";
import { LyricLine, ChordLine, UnifiedLine, UnifiedSong } from "@/types";
import { useExport } from "@/hooks/useExport";

// Composants shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ExportPanelProps {
  lyrics: (LyricLine | UnifiedLine)[];
  chords?: ChordLine[];
  metadata?: Partial<UnifiedSong>;
  audioBaseName?: string;
  exporter: ReturnType<typeof useExport>;
  /** Mode compact (pour intégration dans StepExport) */
  compact?: boolean;
  /** Afficher la carte wrapper ou juste le contenu */
  showCard?: boolean;
}

/**
 * ExportPanel - Panneau d'export des lyrics synchronisées (+ accords)
 *
 * Fonctionnalités :
 * - Affiche les stats lyrics + chords
 * - Export JSON → ExportData { lyrics, chords?, meta? }
 * - Export LRC → lyrics seulement (format standard)
 * - Feedback visuel si export impossible
 */
const ExportPanel: React.FC<ExportPanelProps> = ({
  lyrics,
  chords = [],
  metadata,
  audioBaseName,
  exporter,
  compact = false,
  showCard = true
}) => {
  const { quickExport, getExportStats } = exporter;
  const stats = getExportStats(lyrics, chords.length > 0 ? chords : undefined);
  const canExport = stats.synced > 0;

  const handleExportJSON = () => {
    try {
      quickExport(lyrics, 'json', {
        chords: chords.length > 0 ? chords : undefined,
        metadata,
        audioBaseName,
      });
    } catch (error) {
      console.error('Export JSON error:', error);
    }
  };

  const handleExportLRC = () => {
    try {
      quickExport(lyrics, 'lrc', { audioBaseName });
    } catch (error) {
      console.error('Export LRC error:', error);
    }
  };

  const content = (
    <>
      {/* Stats de progression */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Lyrics</span>
          <Badge
            variant="outline"
            className={cn(
              "gap-1",
              stats.percentage === 100
                ? "bg-green-500/10 text-green-400 border-green-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            )}
          >
            {stats.synced}/{stats.total} ({stats.percentage}%)
          </Badge>
        </div>
        <Progress value={stats.percentage} className="h-2" />

        {/* Stats chords (si présents) */}
        {stats.hasChords && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Guitar className="h-3.5 w-3.5 text-purple-400" />
                Accords
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  stats.chordsPercentage === 100
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                )}
              >
                {stats.syncedChords}/{stats.totalChords} ({stats.chordsPercentage}%)
              </Badge>
            </div>
            <Progress value={stats.chordsPercentage} className="h-2" />
          </>
        )}
      </div>

      {/* Boutons d'export */}
      <div className={cn(
        "grid gap-4",
        compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"
      )}>
        {/* Export JSON */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleExportJSON}
                disabled={!canExport}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300",
                  "hover:border-primary hover:bg-primary/5",
                  canExport
                    ? "border-white/10 bg-slate-800/30 cursor-pointer"
                    : "border-white/5 bg-slate-800/10 cursor-not-allowed opacity-50",
                  compact && "p-4 gap-2"
                )}
              >
                <div className={cn(
                  "rounded-full bg-blue-500/20 flex items-center justify-center",
                  compact ? "w-10 h-10" : "w-14 h-14"
                )}>
                  <FileJson className={cn("text-blue-400", compact ? "h-5 w-5" : "h-7 w-7")} />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-foreground">JSON</h4>
                  {!compact && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.hasChords
                        ? "Lyrics + Accords synchronisés"
                        : "Format structuré, idéal pour les développeurs"
                      }
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    .json
                  </Badge>
                  {stats.hasChords && (
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                      + accords
                    </Badge>
                  )}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {canExport
                ? stats.hasChords
                  ? `Télécharger lyrics (${stats.synced}) + accords (${stats.syncedChords}) en JSON`
                  : "Télécharger au format JSON"
                : "Synchronise au moins une ligne"
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Export LRC */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleExportLRC}
                disabled={!canExport}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300",
                  "hover:border-primary hover:bg-primary/5",
                  canExport
                    ? "border-white/10 bg-slate-800/30 cursor-pointer"
                    : "border-white/5 bg-slate-800/10 cursor-not-allowed opacity-50",
                  compact && "p-4 gap-2"
                )}
              >
                <div className={cn(
                  "rounded-full bg-purple-500/20 flex items-center justify-center",
                  compact ? "w-10 h-10" : "w-14 h-14"
                )}>
                  <FileText className={cn("text-purple-400", compact ? "h-5 w-5" : "h-7 w-7")} />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-foreground">LRC</h4>
                  {!compact && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Lyrics uniquement, compatible lecteurs standards
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  .lrc
                </Badge>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {canExport
                ? "Télécharger au format LRC (lyrics seulement)"
                : "Synchronise au moins une ligne"
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Message si export impossible */}
      {!canExport && (
        <p className="text-xs text-muted-foreground text-center">
          Les boutons seront actifs après synchronisation
        </p>
      )}
    </>
  );

  // Mode sans carte (pour intégration dans StepExport)
  if (!showCard) {
    return <div className="flex flex-col gap-4">{content}</div>;
  }

  // Mode avec carte (standalone)
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
          <Download className="h-5 w-5 text-primary" />
          Export
        </CardTitle>
        <CardDescription>
          {canExport
            ? `${stats.synced} ligne(s)${stats.hasChords ? ` + ${stats.syncedChords} accord(s)` : ''} prête(s) à exporter`
            : "Synchronise au moins une ligne pour exporter"
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {content}
      </CardContent>
    </Card>
  );
};

export default ExportPanel;