/**
 * Utility functions for formatting time strings.
 * The output format is a string "mm:ss:ms"
 */

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centi = Math.round((seconds - Math.floor(seconds)) * 100); // The millisecond part are obtained by rounding the decimal part of the seconds

    const minsStr = mins.toString().padStart(2, '0');
    const secsStr = secs.toString().padStart(2, '0');
    const centiStr = centi.toString().padStart(2, '0');

    return `${minsStr}:${secsStr}.${centiStr}`;
}