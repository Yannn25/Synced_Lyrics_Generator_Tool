import { LyricLine, SyncedLyricItem} from "@/types";

/**
 * Convert an array of LyricLine objects into a JSON string
 * Structure: [{ timestamp: number, text: string }]
 * Indentation: 2 spaces
 */

export function toJSON(lyrics: LyricLine[]): string {
    const items: SyncedLyricItem[] = lyrics
        .filter(line => line.isSynced && line.timestamp !== null)
        .sort((a, b) => (a.timestamp! - b.timestamp!) )
        .map(line => ({ time: line.timestamp!, text: line.text }));

    return JSON.stringify(items, null, 2);
}