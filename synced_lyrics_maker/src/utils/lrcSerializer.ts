import { LyricLine, UnifiedLine } from "@/types";
import { formatTime } from "./formatTime";

/**
 * Convert an array of LyricLine or UnifiedLine objects into a string in the LRC format
 * Format : [mm:ss.cc]Text
 * 
 * WHAT: Sérialise paroles synchronisées au format LRC standard
 * HOW: Filtre lignes sync, trie par timestamp, formate [MM:SS.CC]Texte
 * WHY: Format universel pour paroles synchronisées (lecteurs, apps)
 * SUPPORTED TYPES: LyricLine (legacy) et UnifiedLine (moderne avec accords)
 */

export function toLRC(lyrics: (LyricLine | UnifiedLine)[]): string {
    return lyrics
        .filter(line => line.isSynced && line.timestamp !== null)
        .sort((a, b) => (a.timestamp! - b.timestamp!) )
        .map(line => {
            // Support both LyricLine (text) and UnifiedLine (strippedText)
            const text = 'text' in line ? line.text : line.strippedText;
            return `[${formatTime(line.timestamp!)}]${text}`;
        })
        .join('\n');
}