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
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center gap-8 pt-16">
            {/* Ligne précédente */}
            <div className="transition-all duration-500 ease-out transform">
                <p className="text-lg md:text-xl text-slate-500/60 font-medium">
                    {previousLine?.text || "\u00A0"}
                </p>
            </div>

            {/* Ligne actuelle */}
            <div className="relative transition-all duration-300 ease-out max-w-4xl">
                {activeLine ? (
                    <>
                        <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-relaxed tracking-wide">
                            {activeLine.text}
                        </p>
                        {/* Barre de progression sous la lyric */}
                        <div className="mt-6 mx-auto w-48 h-0.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-darkest to-primary-dark transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-2xl md:text-4xl lg:text-5xl font-medium text-slate-600/80">
                        En attente...
                    </p>
                )}
            </div>

            {/* Ligne suivante */}
            <div className="transition-all duration-500 ease-out transform">
                <p className="text-lg md:text-xl text-slate-500/40 font-medium">
                    {nextLine?.text || "\u00A0"}
                </p>
            </div>
        </div>
    );
};

export default CurrentLyricDisplay;