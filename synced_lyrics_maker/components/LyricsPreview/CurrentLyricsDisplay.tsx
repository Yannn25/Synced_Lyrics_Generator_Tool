'use client'

import React from "react";
import { CurrentLyricDisplayProps } from "@/types";

/**
 * Affiche la lyric actuelle en grand avec les lignes adjacentes.
 * Effet karaoké avec transitions fluides.
 */
const CurrentLyricDisplay: React.FC<CurrentLyricDisplayProps> = ({
    activeLine,
    previousLine,
    nextLine,
    progress,
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center gap-6">
            {/* Ligne précédente */}
            <div className="transition-all duration-500 ease-out">
                <p className="text-xl md:text-2xl text-slate-500 font-medium opacity-50">
                    {previousLine?.text || ""}
                </p>
            </div>

            {/* Ligne actuelle */}
            <div className="relative transition-all duration-300 ease-out">
                {activeLine ? (
                    <>
                        <p className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            {activeLine.text}
                        </p>
                        {/* Barre de progression sous la lyric */}
                        <div className="mt-4 w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-darkest to-primary transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-600 italic">
                        ♪ En attente...
                    </p>
                )}
            </div>

            {/* Ligne suivante */}
            <div className="transition-all duration-500 ease-out">
                <p className="text-xl md:text-2xl text-slate-500 font-medium opacity-50">
                    {nextLine?.text || ""}
                </p>
            </div>
        </div>
    );
};

export default CurrentLyricDisplay;