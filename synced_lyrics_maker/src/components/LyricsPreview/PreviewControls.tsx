'use client'

import React from "react";
import MiniAudioControls from "@/components/MiniAudioControls";

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
 * Utilise MiniAudioControls avec un style adapté au mode plein écran.
 */
const PreviewControls: React.FC<PreviewControlsProps> = ({
    currentTime,
    duration,
    isPlaying,
    onPlay,
    onPause,
    onSeek,
}) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-2xl mx-auto space-y-4">
                <MiniAudioControls
                    currentTime={currentTime}
                    duration={duration}
                    isPlaying={isPlaying}
                    onPlay={onPlay}
                    onPause={onPause}
                    onSeek={onSeek}
                    showSyncButton={false}
                    compact={false}
                />

                {/* Hint */}
                <p className="text-center text-xs text-slate-500">
                    <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-400">Espace</kbd> play/pause • <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-400">Esc</kbd> fermer
                </p>
            </div>
        </div>
    );
};

export default PreviewControls;