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

            {/* Contrôles audio en bas - Progress bar pleine largeur */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent">
                {/* Progress bar pleine largeur */}
                <div className="w-full px-0">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700/80 appearance-none cursor-pointer hover:h-2 transition-all
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0
                        hover:[&::-webkit-slider-thumb]:w-4 hover:[&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all"
                        style={{
                            background: `linear-gradient(to right, var(--color-primary-darkest) 0%, var(--color-primary-dark) ${(currentTime / (duration || 1)) * 100}%, rgba(51, 65, 85, 0.8) ${(currentTime / (duration || 1)) * 100}%)`
                        }}
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
                            <div className="flex items-center gap-4">
                                {/* Reculer 5s */}
                                <button
                                    onClick={() => onSeek(Math.max(0, currentTime - 5))}
                                    className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all hover:scale-105"
                                    title="-5s"
                                >
                                    <span className="text-xs font-bold">-5</span>
                                </button>

                                {/* Play/Pause */}
                                <button
                                    onClick={isPlaying ? onPause : onPlay}
                                    className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-darkest to-primary-dark hover:from-primary-dark hover:to-primary flex items-center justify-center text-white transition-all shadow-lg shadow-primary-darkest/40 hover:scale-105"
                                >
                                    {isPlaying ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </button>

                                {/* Avancer 5s */}
                                <button
                                    onClick={() => onSeek(Math.min(duration, currentTime + 5))}
                                    className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all hover:scale-105"
                                    title="+5s"
                                >
                                    <span className="text-xs font-bold">+5</span>
                                </button>
                            </div>

                            <span className="text-sm font-mono text-slate-300 min-w-[60px] text-right">
                                {formatTime(duration)}
                            </span>
                        </div>

                        {/* Hint */}
                        <p className="text-center text-xs text-slate-500">
                            <kbd className="kbd text-[10px] px-2 py-0.5">Espace</kbd> play/pause
                            <span className="mx-2">·</span>
                            <kbd className="kbd text-[10px] px-2 py-0.5">Esc</kbd> fermer
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LyricsPreviewModal;