'use client'

import React, { useEffect } from "react";
import { LyricLine } from "@/types";
import { formatTime } from "@/utils/formatTime";
import useLyricsSync from "@/hooks/useLyricsSync";
import CurrentLyricDisplay from "@/components/LyricsPreview/CurrentLyricsDisplay";

interface LyricsPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    lyrics: LyricLine[];
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

    // Fermer avec Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === " ") {
                e.preventDefault();
                isPlaying ? onPause() : onPlay();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            // Empêcher le scroll du body
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose, isPlaying, onPlay, onPause]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
            {/* Header avec bouton fermer et stats */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                        Preview Mode
                    </span>
                    {hasSyncedLyrics && (
                        <span className="text-xs bg-primary-darkest/30 text-primary-dark px-3 py-1 rounded-full">
                            {syncedCount}/{totalCount} synced
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                    <span className="text-xl">×</span>
                </button>
            </div>

            {/* Zone principale des lyrics */}
            <CurrentLyricDisplay
                activeLine={activeLine}
                previousLine={previousLine}
                nextLine={nextLine}
                progress={getLineProgress()}
            />

            {/* Contrôles audio en bas */}
            <div className="absolute justify-center bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="max-w-2xl mx-auto space-y-4">
                    {/* Timeline */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400 w-12 text-right">
                            {formatTime(currentTime)}
                        </span>
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={(e) => onSeek(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                        <span className="text-sm text-slate-400 w-12">
                            {formatTime(duration)}
                        </span>
                    </div>

                    {/* Boutons de contrôle */}
                    <div className="flex items-center justify-center gap-6">
                        {/* Reculer 5s */}
                        <button
                            onClick={() => onSeek(Math.max(0, currentTime - 5))}
                            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                            title="-5s"
                        >
                            <span className="text-sm font-bold">-5</span>
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={isPlaying ? onPause : onPlay}
                            className="w-16 h-16 rounded-full bg-primary hover:bg-primary-dark flex items-center justify-center text-white transition-colors shadow-lg shadow-primary/30"
                        >
                            {isPlaying ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        {/* Avancer 5s */}
                        <button
                            onClick={() => onSeek(Math.min(duration, currentTime + 5))}
                            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                            title="+5s"
                        >
                            <span className="text-sm font-bold">+5</span>
                        </button>
                    </div>

                    {/* Hint */}
                    <p className="text-center text-xs text-slate-500">
                        Appuyez sur <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-400">Espace</kbd> pour play/pause • <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-400">Esc</kbd> pour fermer
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LyricsPreviewModal;