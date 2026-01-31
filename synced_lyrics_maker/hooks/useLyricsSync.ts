import { useState, useEffect, useCallback } from 'react';
import { LyricLine } from "@/types";

/**
 * Personalized hook for managing synced lyrics
 * Return the index of the current line and is information for the preview
 */
export const useLyricsSync = (lyrics: LyricLine[], currentTime: number, isPlaying: boolean) => {
    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1); // If no line is selected, -1

    // Update active line when currentTime changes
    const findActiveLine = useCallback((time:number): number => {
        for(let i = lyrics.length -1; i >= 0; i--) {
            const line = lyrics[i];
            if(line.timestamp !== null && line.timestamp <= time) {
                return i;
            }
        }
        return -1;
    }, [lyrics]);

    // Update active line when playing changes
    useEffect(() => {
        const newIndex = findActiveLine(currentTime);
        if(newIndex !== activeLineIndex) {
            setActiveLineIndex(newIndex);
        }
    }, [currentTime, findActiveLine, activeLineIndex]);

    // Reset active line when lyrics changes
    useEffect(() => {
        setActiveLineIndex(findActiveLine(currentTime));
    }, [lyrics, findActiveLine, currentTime]);

    const activeLine = activeLineIndex >= 0 ? lyrics[activeLineIndex] : null;

    const previousLine = activeLineIndex > 0 ? lyrics[activeLineIndex - 1] : null;

    const nextLine = activeLineIndex < lyrics.length - 1 ? lyrics[activeLineIndex + 1] : null;

    // Calculate the percentage of the current line
    const getLineProgress = useCallback(() : number => {
        if(!activeLine || activeLine.timestamp === null) return 0;
        if(!nextLine || nextLine.timestamp === null) return 100;

        const lineStart = activeLine.timestamp;
        const lineEnd = nextLine.timestamp;
        const duration = lineEnd - lineStart;

        if(duration <= 0) return 100;

        const elapsed = currentTime - lineStart;
        const progress = (elapsed / duration) * 100;

        return Math.max(0, Math.min(100, progress));
    }, [activeLine, nextLine, currentTime]);

    const hasSyncedLyrics = lyrics.some(line => line.isSynced);
    const syncedCount = lyrics.filter(line => line.isSynced).length;

    return {
        activeLineIndex,
        activeLine,
        previousLine,
        nextLine,
        isPlaying,
        hasSyncedLyrics,
        syncedCount,
        totalCount: lyrics.length,
        getLineProgress,
        findActiveLine
    };
};

export default useLyricsSync;