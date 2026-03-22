import { UnifiedSong, UnifiedLine, ChordPosition } from "@/types";
import { isSectionHeader, extractSectionName } from "@/utils/sections";

/**
 * Regex pour détecter les accords entre crochets : [C], [Am7], [G/B]
 */
const CHORD_REGEX = /\[([^[\]]+)]/g;

/**
 * Extract metadata from ChordPro text
 * Supported tags: {title: ...}, {t: ...}, {key: ...}, {time: ...}, {bpm: ...}
 */
export function extractMetadata(text: string): Partial<UnifiedSong> {
    const meta: Partial<UnifiedSong> = {};
    const lines = text.split('\n');
    
    // Directive regex: {key: value}
    const DIRECTIVE_REGEX = /^{(\w+):([^}]+)}$/;

    for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(DIRECTIVE_REGEX);
        
        if (match) {
            const key = match[1].toLowerCase();
            const value = match[2].trim();

            switch (key) {
                case 'title':
                case 't':
                    meta.title = value;
                    break;
                case 'key':
                case 'k':
                    meta.key = value;
                    break;
                case 'time':
                case 'timesig':
                    meta.timeSignature = value;
                    break;
                case 'bpm':
                case 'tempo':
                    const bpm = parseInt(value, 10);
                    if (!isNaN(bpm)) meta.bpm = bpm;
                    break;
            }
        }
    }
    return meta;
}

/**
 * Parse a text in ChordPro format into UnifiedLine objects
 * @param text The raw text content
 * @returns An array of UnifiedLine
 */
export function parseChordPro(text: string): UnifiedLine[] {
    const lines = text.split('\n');
    const unifiedLines: UnifiedLine[] = [];
    
    let currentSection = '';
    let lineIdCounter = 1;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.length === 0) {
            continue;
        }

        // Check for directive/metadata (e.g. {title: ...})
        // We skip them in lines parsing
        if (trimmedLine.match(/^{(\w+):([^}]+)}$/)) {
            continue;
        }

        // Check for section header (e.g. {Verse}, [Intro], etc.)
        if (isSectionHeader(trimmedLine)) {
            currentSection = extractSectionName(trimmedLine);
            continue; // Sections are not lyric lines themselves in this model
        }

        // Parse chords and strip text
        const { strippedText, chords } = extractChords(trimmedLine);
        
        // Déterminer si c'est une ligne purement instrumentale
        const isInstrumental = chords.length > 0 && strippedText.trim().length === 0;
        
        // IMPORTANT: We always create a UnifiedLine, even if it's instrumental
        // This ensures chord-only lines are included in the sync list
        const unifiedLine: UnifiedLine = {
            id: lineIdCounter++,
            originalText: trimmedLine,
            strippedText: strippedText,
            chords: chords,
            section: currentSection || undefined,
            timestamp: null,
            isSynced: false,
            isInstrumental
        };

        unifiedLines.push(unifiedLine);
    }

    return unifiedLines;
}

/**
 * Extract chords from a line and return the stripped text and chord positions
 * @param text The line with chords (e.g. "Amazing [G]Grace")
 */
export function extractChords(text: string): { strippedText: string, chords: ChordPosition[] } {
    let strippedText = "";
    const chords: ChordPosition[] = [];
    
    // We act manually to rebuild the string and track indices
    // But a simpler approach with split/matchAll might be better
    
    // Let's iterate through matches
    const matches = Array.from(text.matchAll(CHORD_REGEX));
    
    if (matches.length === 0) {
        // If no chords found, verify if we should just return text as stripped
        // Yes, default behavior
        return { strippedText: text, chords: [] };
    }

    let currentIndexInStripped = 0;
    let cursorInOriginal = 0;

    for (const match of matches) {
        // Text before the chord
        const textBefore = text.substring(cursorInOriginal, match.index!);
        strippedText += textBefore;
        currentIndexInStripped += textBefore.length;

        // The chord itself
        const chordSymbol = match[1];
        
        // Add chord position
        chords.push({
            symbol: chordSymbol,
            index: currentIndexInStripped
        });

        // Advance cursor past the chord tag
        cursorInOriginal = match.index! + match[0].length;
    }

    // Add remaining text
    strippedText += text.substring(cursorInOriginal);

    return { strippedText, chords };
}
