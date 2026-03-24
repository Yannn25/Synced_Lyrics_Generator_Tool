import { useCallback } from "react";
import { toLRC } from "@/utils/lrcSerializer";
import { toJSON } from "@/utils/jsonSerializer";
import { combinedToJSON } from "@/utils/chordsSerializer";
import { LyricLine, ChordLine, UnifiedLine, ExportMetadata, UnifiedSong, UnifiedExportData } from "@/types";

/**
 * Custom hook for exporting lyrics (and optionally chords)
 */

export function useExport() {
    const buildExportMeta = useCallback((metadata?: Partial<UnifiedSong> | ExportMetadata): ExportMetadata | undefined => {
        if (!metadata) return undefined;

        const meta: ExportMetadata = {
            key: metadata.key,
            bpm: metadata.bpm,
            timeSignature: metadata.timeSignature,
            about: metadata.about,
        };

        return Object.values(meta).some((value) => value !== undefined && value !== null && value !== "")
            ? meta
            : undefined;
    }, []);

    const createExportFilename = useCallback((format: 'json' | 'lrc', audioBaseName?: string) => {
        const safeBaseName = audioBaseName?.trim() || 'synced-lyrics';
        return `${safeBaseName}.${format}`;
    }, []);

    const toUnifiedLines = useCallback((lyrics: (LyricLine | UnifiedLine)[]): UnifiedLine[] => {
        return lyrics.map((line) => {
            if ('strippedText' in line) {
                return line as UnifiedLine;
            }

            const legacyLine = line as LyricLine;
            return {
                id: legacyLine.id,
                originalText: legacyLine.text,
                strippedText: legacyLine.text,
                chords: [],
                timestamp: legacyLine.timestamp,
                isSynced: legacyLine.isSynced,
                isInstrumental: false,
            };
        });
    }, []);

    // Convert an array of LyricLine or UnifiedLine objects into a string in the LRC format (lyrics only)
    const exportLRC = useCallback((lyrics: (LyricLine | UnifiedLine)[]) => {
        // Adapt UnifiedLine to LyricLine for LRC export
        const adaptedLyrics = lyrics.map(l => {
            if ('strippedText' in l) {
                return {
                    id: l.id,
                    text: l.strippedText,
                    timestamp: l.timestamp,
                    isSynced: l.isSynced,
                    isEditing: false
                } as LyricLine;
            }
            return l as LyricLine;
        });
        return toLRC(adaptedLyrics);
    }, []);

    // Convert an array of UnifiedLine to JSON (full structure)
    const exportUnifiedJSON = useCallback((lines: UnifiedLine[], meta?: ExportMetadata) => {
        const data: UnifiedExportData = {
            meta,
            lines: lines.map((line) => ({ ...line }))
        };
        return JSON.stringify(data, null, 2);
    }, []);

    // Convert an array of LyricLine objects into a JSON string (legacy, lyrics only)
    const exportJSON = useCallback((lyrics: LyricLine[]) => {
        return toJSON(lyrics);
    }, []);

    // Export combiné lyrics + chords au format ExportData JSON
    const exportCombinedJSON = useCallback((lyrics: LyricLine[], chords: ChordLine[], meta?: ExportMetadata) => {
        return combinedToJSON(lyrics, chords, meta);
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

    /**
     * Export rapide — détecte automatiquement si des chords sont présents
     * - JSON → ExportData { lyrics, chords?, meta? }
     * - LRC  → lyrics seulement (format standard inchangé)
     */
    const quickExport = useCallback((
        lyrics: (LyricLine | UnifiedLine)[],
        format: 'json' | 'lrc',
        options?: {
            chords?: ChordLine[]; // Legacy separate chords
            metadata?: Partial<UnifiedSong> | ExportMetadata;
            audioBaseName?: string;
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
            const exportMeta = buildExportMeta(options?.metadata);
            const unifiedLines = toUnifiedLines(lyrics);
            content = exportUnifiedJSON(unifiedLines, exportMeta);
        }

        const filename = options?.customName ?? createExportFilename(format, options?.audioBaseName);
        const mimeType = format === 'json' ? 'application/json' : 'text/plain';

        downloadFile(content, filename, mimeType);

        const syncedChords = options?.chords?.filter(c => c.isSynced).length ?? 0;
        return { filename, syncedCount: syncedLyrics, syncedChords };
    }, [buildExportMeta, createExportFilename, exportLRC, exportUnifiedJSON, downloadFile, toUnifiedLines]);

    // Stats d'export (lyrics + chords)
    const getExportStats = useCallback((lyrics: (LyricLine | UnifiedLine)[], chords?: ChordLine[]) => {
        const total = lyrics.length;
        const synced = lyrics.filter(l => l.isSynced).length;
        // For UnifiedLine, check if it has chords
        const unifiedChordsTotal = lyrics.reduce((acc, l) => acc + ('chords' in l ? l.chords.length : 0), 0);
        // We consider chords synced if the line is synced
        const unifiedChordsSynced = lyrics.reduce((acc, l) => acc + (('chords' in l && l.isSynced) ? l.chords.length : 0), 0);

        const totalChords = (chords?.length ?? 0) + unifiedChordsTotal;
        const syncedChords = (chords?.filter(c => c.isSynced).length ?? 0) + unifiedChordsSynced;
        
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
        exportUnifiedJSON, // Expose new method
        downloadFile,
        quickExport,
        getExportStats
    };

}