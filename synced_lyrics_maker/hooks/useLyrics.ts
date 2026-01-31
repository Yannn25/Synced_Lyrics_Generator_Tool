import { useState, useCallback } from 'react';
import { parseLyrics as parseLyricsUtil } from "@/utils/parseLyrics";
import { LyricLine } from "@/types";

/**
 * Custom hook for managing lyrics state
 */

export function useLyrics() {
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

    // Parse lyrics text and set state
    const loadLyrics = useCallback((text: string) => {
        const parsed = parseLyricsUtil(text);
        setLyrics(parsed);
        setSelectedLineId(null); // Reset selection when loading new lyrics
    }, []);

    // Select a line in the list
    const selectLine = useCallback( (lineId: number | null) => {
        setSelectedLineId(lineId);
    }, []);

    // Sync a line with timestamp from audio
    const syncLine = useCallback( (lineId: number, timestamp: number) => {
        setLyrics(prev => prev.map(line =>
            (line.id === lineId ? {...line, timestamp, isSynced: true} : line)));
    }, []);


    // Clear a timestamp for a line
    const clearTimestamp = useCallback( (lineId: number) => {
        setLyrics(prev => prev.map(line =>
            (line.id === lineId ? {...line, timestamp: null, isSynced: false} : line)));
    }, []);

    // Get next unsynced line (auto-advance)
    const getNextUnsyncedLine = useCallback((): number | null => {
        const unsynced = lyrics.find(line => !line.isSynced);
        return unsynced?.id ?? null;
    }, [lyrics]);

    // Auto-select next unsynced line after sync
    const syncAndAdvance = useCallback((lineId: number, timestamp: number) => {
        setLyrics(prev => {
            const updated = prev.map(line =>
                line.id === lineId ? { ...line, timestamp, isSynced: true } : line
            );
            // Find next unsynced
            const nextUnsynced = updated.find(line => !line.isSynced);
            setSelectedLineId(nextUnsynced?.id ?? null);
            return updated;
        });
    }, []);

    // Clear all lines contains in the lyrics list
    const clearList = useCallback(() => {
        setLyrics([]);
        setSelectedLineId(null);
    }, []);

    // Edit a timestamp for a line
    const onUpdateTimestamp = useCallback((lineId: number, timestamp: number | null) => {
        setLyrics(prev => prev.map(line =>
            (line.id === lineId ? {...line, timestamp, isSynced : timestamp !== null } : line)));
    }, []);

    // Update text of a lyric line
    const updateLineText = useCallback((lineId: number, newText: string) => {
        setLyrics( prev => prev.map(line =>
            line.id === lineId ? {...line, text: newText} : line
        ));
    }, []);

    // Delete a lyric line
    const deleteLine = useCallback((lineId: number) => {
        setLyrics(prev => prev.filter(line => line.id !== lineId));
        setSelectedLineId(prev => prev === lineId ? null : prev);
    }, []);

    return {
        lyrics,
        selectedLineId,
        loadLyrics,
        selectLine,
        syncLine,
        clearTimestamp,
        onUpdateTimestamp,
        getNextUnsyncedLine,
        syncAndAdvance,
        clearList,
        updateLineText,
        deleteLine,
    };
  }