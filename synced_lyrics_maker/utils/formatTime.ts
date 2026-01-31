/**
 * Utility functions for formatting time strings.
 * The output format is a string "mm:ss:ms"
 */
import React from "react";

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centi = Math.round((seconds - Math.floor(seconds)) * 100); // The millisecond part are obtained by rounding the decimal part of the seconds

    const minsStr = mins.toString().padStart(2, '0');
    const secsStr = secs.toString().padStart(2, '0');
    const centiStr = centi.toString().padStart(2, '0');

    return `${minsStr}:${secsStr}.${centiStr}`;
}

// Parser a string in mm:ss.cc or ss.cc to seconds number
export function parseTimestamp(value: string): number | null {
    const match = value.match(/^(\d{1,2}):(\d{1,2}(?:\.\d{0,2})?)$/);
    if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        if (seconds < 60) {
            return minutes * 60 + seconds;
        }}
    const secondsOnly = parseFloat(value);
    if (!isNaN(secondsOnly) && secondsOnly >= 0) {
        return secondsOnly;
    }
    return null;
};
