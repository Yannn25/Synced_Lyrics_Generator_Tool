import { LyricLine } from "@/types";

interface PatternMatch {
    text: string;
    count: number;
    lineIds: string[];
}

/**
 * Detect the most repeated pattern in a list of lyric lines
 * (seems to be probably the chorus)
 * Return the text who is the most repeated or a part of the text
 */

export function detectChorus(lyrics: LyricLine[]): PatternMatch | null {
    const textCount = new Map<string, { count: number, ids: string[] }>();

    for(const line of lyrics) {
        const normalized = line.text.trim().toLowerCase();
        if(normalized.length < 3) continue; // Ignore short lines ???

        const existing = textCount.get(normalized);
        if(existing) {
            existing.count++;
            existing.ids.push(line.id);
        } else {
            textCount.set(normalized, { count: 1, ids: [line.id] });
        }
    }

    let bestMatch: PatternMatch | null = null;

    for(const [text, data] of textCount.entries()) {
        if(data.count >= 2) {
            if(!bestMatch || data.count > bestMatch.count) {
                bestMatch = {
                    text: lyrics.find(l => l.text.trim().toLowerCase() === text)?.text || text,
                    count: data.count,
                    lineIds: data.ids
                };
            }
        }
    }

    return bestMatch;
}

/**
 * Generate a filename based on the content inside the lyrics
 */
export function generateSmartFileName(lyrics: LyricLine[]): string {
    const chorus = detectChorus(lyrics);

    if(chorus) {
        // Take the first word of the chorus
        const words = chorus.text.split(/\s+/).slice(0, 3).join('-');
        const sanitized = words.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
        if (sanitized.length >= 3) {
            return sanitized;
        }
    }

    // Fallback: first words of the first line
    const firstLine = lyrics.find(l => l.text.trim().length > 3);
    if (firstLine) {
        const words = firstLine.text.split(/\s+/).slice(0, 2).join('-');
        return words.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() || 'synced-lyrics';
    }

    return 'synced-lyrics';
}