'use client'

import React from "react";
import { Play, Pause, Rewind, FastForward, Clock } from "lucide-react";
import { formatTime } from "@/utils/formatTime";

// Composants shadcn/ui
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MiniAudioControlsProps {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onSeek: (time: number) => void;
    onSync?: () => void;
    canSync?: boolean;
    showSyncButton?: boolean;
    compact?: boolean;
}

/**
 * MiniAudioControls - Contrôles audio réutilisables avec shadcn/ui
 *
 * Utilisé dans StepSync et LyricsPreviewModal.
 * Affiche une timeline, boutons play/pause, ±5s et optionnellement un bouton sync.
 */
const MiniAudioControls: React.FC<MiniAudioControlsProps> = ({
    currentTime,
    duration,
    isPlaying,
    onPlay,
    onPause,
    onSeek,
    onSync,
    canSync = false,
    showSyncButton = false,
    compact = false,
}) => {
    // Gestion du slider
    const handleSliderChange = (value: number[]) => {
        onSeek(value[0]);
    };

    return (
        <div className={cn(
            "flex flex-col gap-3 rounded-xl border backdrop-blur-sm",
            "bg-slate-800/50 border-white/10",
            compact ? "p-3" : "p-4"
        )}>
            {/* Timeline avec temps */}
            <div className="flex items-center gap-3">
                <span className={cn(
                    "font-mono text-primary font-bold",
                    compact ? "text-xs w-14" : "text-sm w-16"
                )}>
                    {formatTime(currentTime)}
                </span>

                <Slider
                    value={[currentTime]}
                    min={0}
                    max={duration || 100}
                    step={0.01}
                    onValueChange={handleSliderChange}
                    className="flex-1 cursor-pointer"
                />

                <span className={cn(
                    "font-mono text-muted-foreground text-right",
                    compact ? "text-xs w-14" : "text-sm w-16"
                )}>
                    {formatTime(duration)}
                </span>
            </div>

            {/* Boutons de contrôle */}
            <div className="flex items-center justify-center gap-2">
                {/* Reculer 5s */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size={compact ? "sm" : "default"}
                                onClick={() => onSeek(Math.max(0, currentTime - 5))}
                                className="gap-1 text-muted-foreground hover:text-foreground"
                            >
                                <Rewind className="h-4 w-4" />
                                {!compact && "5s"}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reculer de 5 secondes</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Play/Pause */}
                <Button
                    variant="default"
                    size={compact ? "default" : "lg"}
                    onClick={isPlaying ? onPause : onPlay}
                    className={cn(
                        "gap-2 font-semibold",
                        "bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90",
                        "shadow-lg shadow-primary/20",
                        compact ? "px-4" : "px-8"
                    )}
                >
                    {isPlaying ? (
                        <>
                            <Pause className="h-4 w-4" />
                            {!compact && "Pause"}
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4" />
                            {!compact && "Play"}
                        </>
                    )}
                </Button>

                {/* Avancer 5s */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size={compact ? "sm" : "default"}
                                onClick={() => onSeek(Math.min(duration, currentTime + 5))}
                                className="gap-1 text-muted-foreground hover:text-foreground"
                            >
                                {!compact && "5s"}
                                <FastForward className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Avancer de 5 secondes</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Bouton Sync optionnel */}
                {showSyncButton && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size={compact ? "sm" : "default"}
                                    onClick={onSync}
                                    disabled={!canSync}
                                    className={cn(
                                        "gap-1.5 ml-2",
                                        canSync && "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                                    )}
                                >
                                    <Clock className="h-3.5 w-3.5" />
                                    Sync
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {canSync
                                    ? "Synchroniser la ligne sélectionnée (Entrée)"
                                    : "Sélectionnez d'abord une ligne"
                                }
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    );
};

export default MiniAudioControls;
