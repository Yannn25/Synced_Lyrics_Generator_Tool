import { useCallback } from "react";
import { toLRC } from "@/utils/lrcSerializer";
import { toJSON } from "@/utils/jsonSerializer";
import { combinedToJSON } from "@/utils/chordsSerializer";
import { generateSmartFileName } from "@/utils/detectChorus";
import { LyricLine, ChordLine } from "@/types";

/**
 * Custom hook for exporting lyrics (and optionally chords)
 */

export function useExport() {
    // Convert an array of LyricLine objects into a string in the LRC format (lyrics only)
    const exportLRC = useCallback((lyrics: LyricLine[]) => {
        return toLRC(lyrics);
    }, []);

    // Convert an array of LyricLine objects into a JSON string (legacy, lyrics only)
    const exportJSON = useCallback((lyrics: LyricLine[]) => {
        return toJSON(lyrics);
    }, []);

    // Export combiné lyrics + chords au format ExportData JSON
    const exportCombinedJSON = useCallback((lyrics: LyricLine[], chords: ChordLine[], key?: string) => {
        return combinedToJSON(lyrics, chords, key);
    }, []);

    // Download a file from a string
    const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], {type: mimeType});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    // Generate a default filename for the exported file
    const generateFilename = useCallback((format: 'json' | 'lrc', lyrics?: LyricLine[]): string => {
        const date = new Date().toISOString().slice(0, 10);
        const baseName = lyrics ? generateSmartFileName(lyrics) : 'synced-lyrics';
        return `${baseName}_${date}.${format}`;
    }, []);

    /**
     * Export rapide — détecte automatiquement si des chords sont présents
     * - JSON → ExportData { lyrics, chords?, meta? }
     * - LRC  → lyrics seulement (format standard inchangé)
     */
    const quickExport = useCallback((
        lyrics: LyricLine[],
        format: 'json' | 'lrc',
        options?: {
            chords?: ChordLine[];
            musicalKey?: string;
            customName?: string;
        }
    ) => {
        const syncedLyrics = lyrics.filter(l => l.isSynced).length;
        if (syncedLyrics === 0) {
            throw new Error('Aucune ligne synchronisée à exporter');
        }

        let content: string;
        if (format === 'lrc') {
            // LRC = lyrics seulement (standard)
            content = exportLRC(lyrics);
        } else {
            // JSON = ExportData { lyrics, chords?, meta? }
            const chords = options?.chords ?? [];
            content = exportCombinedJSON(lyrics, chords, options?.musicalKey);
        }

        const filename = options?.customName ?? generateFilename(format, lyrics);
        const mimeType = format === 'json' ? 'application/json' : 'text/plain';

        downloadFile(content, filename, mimeType);

        const syncedChords = options?.chords?.filter(c => c.isSynced).length ?? 0;
        return { filename, syncedCount: syncedLyrics, syncedChords };
    }, [exportLRC, exportCombinedJSON, downloadFile, generateFilename]);

    // Stats d'export (lyrics + chords)
    const getExportStats = useCallback((lyrics: LyricLine[], chords?: ChordLine[]) => {
        const total = lyrics.length;
        const synced = lyrics.filter(l => l.isSynced).length;
        const totalChords = chords?.length ?? 0;
        const syncedChords = chords?.filter(c => c.isSynced).length ?? 0;
        return {
            total,
            synced,
            percentage: total > 0 ? Math.round((synced / total) * 100) : 0,
            totalChords,
            syncedChords,
            chordsPercentage: totalChords > 0 ? Math.round((syncedChords / totalChords) * 100) : 0,
            hasChords: totalChords > 0,
        };
    }, []);

    return {
        exportLRC,
        exportJSON,
        exportCombinedJSON,
        downloadFile,
        generateFilename,
        quickExport,
        getExportStats
    };

}