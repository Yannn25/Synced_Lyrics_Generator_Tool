import { LyricLine} from "@/types";
import {v4 as uuidv4} from "uuid";

/**
 * Parse lyrics from a text who is copy and pasted in the textarea
 * - Split the text into lines
 * - Trim each line
 * - Remove empty lines
 * - Generate a id for each line
 * - Initialize a LyricLine object for each line
 */

export function parseLyrics(text: string): {
    id: number;
    text: string;
    timestamp: null;
    isSynced: boolean;
    isEditing: boolean
}[] {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, index) => ({
            id: index + 1,
            text: line,
            timestamp: null,
            isSynced: false,
            isEditing: false
        }));
}