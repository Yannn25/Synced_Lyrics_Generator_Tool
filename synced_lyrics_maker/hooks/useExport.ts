import { useCallback } from "react";
import { toLRC } from "@/utils/lrcSerializer";
import { toJSON } from "@/utils/jsonSerializer";
import { generateSmartFileName } from "@/utils/detectChorus";
import { LyricLine } from "@/types";

/**
 * Custom hook for exporting lyrics
 */

export function useExport() {
    // Convert an array of LyricLine objects into a string in the LRC format
    const exportLRC = useCallback((lyrics: LyricLine[]) => {
        return toLRC(lyrics);
    }, []);

    // Convert an array of LyricLine objects into a JSON string
    const exportJSON = useCallback((lyrics: LyricLine[]) => {
        return toJSON(lyrics);
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

    // Fonction combinée pour export rapide
    const quickExport = useCallback((lyrics: LyricLine[], format: 'json' | 'lrc', customName?: string) => {
        const syncedCount = lyrics.filter(l => l.isSynced).length;
        if (syncedCount === 0) {
            throw new Error('Aucune ligne synchronisée à exporter');
        }

        const content = format === 'json' ? exportJSON(lyrics) : exportLRC(lyrics);
        const filename = generateFilename(format, lyrics ) ?? (customName ?? 'synced-lyrics');
        const mimeType = format === 'json' ? 'application/json' : 'text/plain';

        downloadFile(content, filename, mimeType);
        return { filename, syncedCount };
    }, [exportJSON, exportLRC, downloadFile, generateFilename]);

    // Stats d'export
    const getExportStats = useCallback((lyrics: LyricLine[]) => {
        const total = lyrics.length;
        const synced = lyrics.filter(l => l.isSynced).length;
        return { total, synced, percentage: Math.round((synced / total) * 100) };
    }, []);

    return {
        exportLRC,
        exportJSON,
        downloadFile,
        generateFilename,
        quickExport,
        getExportStats
    };

}