import { LyricLine } from "@/types";
import { formatTime } from "./formatTime";

/**
 * Convert an array of LyricLine objects into a string in the LRC format
 * Format : [mm:ss:ms]Text
 */

export function toLRC(lyrics: LyricLine[]): string {
    return lyrics
        .filter(line => line.isSynced && line.timestamp !== null)
        .sort((a, b) => (a.timestamp! - b.timestamp!) )
        .map(line => `[${formatTime(line.timestamp!)}]${line.text}`)
        .join('\n');
}