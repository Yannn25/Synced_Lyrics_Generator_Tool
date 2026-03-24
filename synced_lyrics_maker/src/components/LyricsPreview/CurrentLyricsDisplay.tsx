'use client'

import React from "react";
import { CurrentLyricDisplayProps, UnifiedLine, LyricLine } from "@/types";
import { cn } from "@/lib/utils"; // Assuming cn is available in utils, based on other files using it.

function isUnifiedLine(line: any): line is UnifiedLine {
    return line && 'chords' in line && 'strippedText' in line;
}

/**
 * Affiche la lyric actuelle en grand avec les lignes adjacentes.
 * Effet karaoké avec transitions fluides.
 * Supporte l'affichage des accords (UnifiedLine).
 */
const CurrentLyricDisplay: React.FC<CurrentLyricDisplayProps> = ({
    activeLine,
    previousLine,
    nextLine,
    progress,
    showChords = false,
}) => {

    const getLineText = (line: LyricLine | UnifiedLine | null) => {
        if (!line) return "\u00A0";
        return isUnifiedLine(line) ? line.strippedText : line.text;
    };

    /**
     * Renders the active line with optional chords
     */
    const renderActiveLine = () => {
        if (!activeLine) {
             return (
                <p className="text-2xl md:text-4xl lg:text-5xl font-medium text-slate-600/80">
                    En attente...
                </p>
            );
        }

        // If simple text or chords disabled
        if (!showChords || !isUnifiedLine(activeLine) || !activeLine.chords || activeLine.chords.length === 0) {
            return (
                <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-relaxed tracking-wide">
                    {getLineText(activeLine)}
                </p>
            );
        }

        // Render with chords
        const { strippedText, chords } = activeLine;
        const sortedChords = [...chords].sort((a, b) => a.index - b.index);
        
        // Calculate estimated current position in text based on progress (0-100)
        // This assumes linear distribution of text over time
        const currentTextIndex = strippedText.length * (Math.min(100, Math.max(0, progress)) / 100);
        
        const segments: { text: string; chord: string | null; startIndex: number; endIndex: number }[] = [];
        let lastIndex = 0;

        sortedChords.forEach((chord, i) => {
             // Text segment before this chord
             if (chord.index > lastIndex) {
                 segments.push({
                     text: strippedText.slice(lastIndex, chord.index),
                     chord: null,
                     startIndex: lastIndex,
                     endIndex: chord.index
                 });
             }
             
             // Text segment starting at this chord until next chord or end
             const nextIndex = (i + 1 < sortedChords.length) ? sortedChords[i+1].index : strippedText.length;
             
             segments.push({
                 text: strippedText.slice(chord.index, nextIndex),
                 chord: chord.symbol,
                 startIndex: chord.index,
                 endIndex: nextIndex
             });
             
             lastIndex = nextIndex;
        });
        
        // Final text segment if any
        if (lastIndex < strippedText.length) {
             segments.push({
                 text: strippedText.slice(lastIndex),
                 chord: null,
                 startIndex: lastIndex,
                 endIndex: strippedText.length
             });
        }

        return (
            <div className="flex flex-wrap justify-center items-end gap-x-0.5 px-4">
                {segments.map((seg, idx) => {
                    const isCurrent = currentTextIndex >= seg.startIndex && currentTextIndex < seg.endIndex;
                    const isPassed = currentTextIndex >= seg.endIndex;
                    
                    return (
                        <div key={idx} className="flex flex-col items-center group"> 
                            {/* Chord */}
                            <div className="h-10 mb-1 flex items-end">
                                <span className={cn(
                                    "text-xl md:text-3xl font-bold transition-all duration-300",
                                    isCurrent ? "text-primary scale-110" : isPassed ? "text-primary/60" : "text-slate-500/80"
                                )}>
                                    {seg.chord || "\u00A0"}
                                </span>
                            </div>
                            {/* Text */}
                            <p className={cn(
                                "text-2xl md:text-4xl lg:text-5xl font-bold leading-relaxed tracking-wide whitespace-pre transition-colors duration-300",
                                isCurrent ? "text-white" : isPassed ? "text-slate-300" : "text-slate-500"
                            )}>
                                 {seg.text}
                            </p>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-8 pt-16">
            {/* Ligne précédente */}
            <div className="transition-all duration-500 ease-out transform">
                <p className="text-lg md:text-xl text-slate-500/60 font-medium h-8">
                    {getLineText(previousLine)}
                </p>
            </div>

            {/* Ligne actuelle */}
            <div className="relative transition-all duration-300 ease-out max-w-5xl w-full">
                {renderActiveLine()}
                
                {/* Barre de progression optionnelle */}
                {/* 
                {activeLine && (
                    <div className="mt-8 mx-auto w-1/3 h-1 bg-slate-800 rounded-full overflow-hidden opacity-50">
                        <div
                            className="h-full bg-primary transition-all duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
                */}
            </div>

            {/* Ligne suivante */}
            <div className="transition-all duration-500 ease-out transform">
                <p className="text-lg md:text-xl text-slate-500/40 font-medium h-8">
                    {getLineText(nextLine)}
                </p>
            </div>
        </div>
    );
};


export default CurrentLyricDisplay;