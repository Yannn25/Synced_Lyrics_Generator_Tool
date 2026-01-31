'use client'

import React from "react";

interface PreviewControlsProps {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onSeek: (time: number) => void;
}

/**
 * Contrôles audio simplifiés pour le mode preview.
 * Timeline, play/pause et boutons ±5s.
 */
const PreviewControls: React.FC<PreviewControlsProps> = ({
    currentTime,
    duration,
    isPlaying,
    onPlay,
    onPause,
    onSeek,
}) => {
    // Formater le temps en mm:ss
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    return (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
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
                    <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-400">Espace</kbd> play/pause • <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-400">Esc</kbd> fermer
                </p>
            </div>
        </div>
    );
};

export default PreviewControls;