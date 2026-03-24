'use client'

import React, { useEffect, useState } from "react";
import { X, Play, Pause, Rewind, FastForward, Music2 } from "lucide-react";
import { LyricLine, UnifiedLine } from "@/types";
import { formatTime } from "@/utils/formatTime";
import useLyricsSync from "@/hooks/useLyricsSync";
import CurrentLyricDisplay from "@/components/LyricsPreview/CurrentLyricsDisplay";

// Composants shadcn/ui
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface LyricsPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    lyrics: (LyricLine | UnifiedLine)[];
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onSeek: (time: number) => void;
}

/**
 * Modal plein écran pour prévisualiser les lyrics synchronisées.
 * Simule l'affichage d'une app de streaming.
 * Utilise Dialog de shadcn/ui avec un style immersif.
 */
const LyricsPreviewModal: React.FC<LyricsPreviewModalProps> = ({
    isOpen,
    onClose,
    lyrics,
    currentTime,
    duration,
    isPlaying,
    onPlay,
    onPause,
    onSeek,
}) => {
    // État pour l'affichage des accords
    const [showChords, setShowChords] = useState(true);

    // Hook de synchronisation lyrics/audio
    const {
        activeLine,
        previousLine,
        nextLine,
        getLineProgress,
        hasSyncedLyrics,
        syncedCount,
        totalCount,
    } = useLyricsSync(lyrics, currentTime, isPlaying);

    // Gestion des raccourcis clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === " ") {
                e.preventDefault();
                isPlaying ? onPause() : onPlay();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                onSeek(Math.max(0, currentTime - 5));
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                onSeek(Math.min(duration, currentTime + 5));
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isPlaying, onPlay, onPause, onSeek, currentTime, duration]);

    // Gestion du slider
    const handleSliderChange = (value: number[]) => {
        onSeek(value[0]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={cn(
                    "max-w-none w-screen h-screen p-0",
                    "bg-black/95 backdrop-blur-xl border-0",
                    "flex flex-col"
                )}
                showCloseButton={false}
            >
                {/* Titre caché pour l'accessibilité */}
                <DialogTitle className="sr-only">Preview des lyrics</DialogTitle>

                {/* Header avec bouton fermer et stats */}
                <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-slate-800/60 border-white/10 text-slate-300">
                            Preview Mode
                        </Badge>
                        {hasSyncedLyrics && (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                                {syncedCount}/{totalCount} synced
                            </Badge>
                        )}
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowChords(!showChords)}
                            className={cn(
                                "w-10 h-10 p-0 rounded-full transition-colors ml-2",
                                showChords ? "bg-primary/20 text-primary" : "bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white"
                            )}
                            title={showChords ? "Masquer les accords" : "Afficher les accords"}
                        >
                            <Music2 className="h-5 w-5" />
                            <span className="sr-only">Accords</span>
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className={cn(
                            "w-10 h-10 p-0 rounded-full",
                            "bg-slate-800/60 hover:bg-slate-700",
                            "text-slate-400 hover:text-white"
                        )}
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Fermer</span>
                    </Button>
                </div>

                {/* Zone principale des lyrics */}
                <div className="flex-1 flex items-center justify-center">
                    <CurrentLyricDisplay
                        activeLine={activeLine}
                        previousLine={previousLine}
                        nextLine={nextLine}
                        progress={getLineProgress()}
                        showChords={showChords}
                    />
                </div>

                {/* Contrôles audio en bas */}
                <div className="bg-gradient-to-t from-black via-black/90 to-transparent">
                    {/* Progress bar pleine largeur */}
                    <div className="px-4">
                        <Slider
                            value={[currentTime]}
                            min={0}
                            max={duration || 100}
                            step={0.01}
                            onValueChange={handleSliderChange}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="px-6 py-4">
                        <div className="max-w-3xl mx-auto space-y-4">
                            {/* Temps et contrôles */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-mono text-slate-300 min-w-[60px]">
                                    {formatTime(currentTime)}
                                </span>

                                {/* Boutons de contrôle centrés */}
                                <div className="flex items-center gap-3">
                                    {/* Reculer 5s */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onSeek(Math.max(0, currentTime - 5))}
                                        className={cn(
                                            "w-10 h-10 p-0 rounded-full",
                                            "bg-slate-800/80 hover:bg-slate-700",
                                            "text-slate-300 hover:text-white",
                                            "transition-all hover:scale-105"
                                        )}
                                    >
                                        <Rewind className="h-4 w-4" />
                                    </Button>

                                    {/* Play/Pause */}
                                    <Button
                                        variant="default"
                                        size="lg"
                                        onClick={isPlaying ? onPause : onPlay}
                                        className={cn(
                                            "w-14 h-14 p-0 rounded-full",
                                            "bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90",
                                            "shadow-lg shadow-primary/40",
                                            "transition-all hover:scale-105"
                                        )}
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-6 w-6" />
                                        ) : (
                                            <Play className="h-6 w-6 ml-0.5" />
                                        )}
                                    </Button>

                                    {/* Avancer 5s */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onSeek(Math.min(duration, currentTime + 5))}
                                        className={cn(
                                            "w-10 h-10 p-0 rounded-full",
                                            "bg-slate-800/80 hover:bg-slate-700",
                                            "text-slate-300 hover:text-white",
                                            "transition-all hover:scale-105"
                                        )}
                                    >
                                        <FastForward className="h-4 w-4" />
                                    </Button>
                                </div>

                                <span className="text-sm font-mono text-slate-300 min-w-[60px] text-right">
                                    {formatTime(duration)}
                                </span>
                            </div>

                            {/* Hint des raccourcis */}
                            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                                <span>
                                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] border border-white/10">
                                        Espace
                                    </kbd>
                                    {" "}play/pause
                                </span>
                                <span>
                                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] border border-white/10">
                                        ← →
                                    </kbd>
                                    {" "}±5s
                                </span>
                                <span>
                                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] border border-white/10">
                                        Esc
                                    </kbd>
                                    {" "}fermer
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LyricsPreviewModal;
