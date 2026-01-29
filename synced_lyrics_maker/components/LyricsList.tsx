'use client'

import React from "react";
import { LyricsListProps } from "@/types";

const LyricsList: React.FC<LyricsListProps> = ({ lyrics, selectedLineId, onSelectLine, onClearTimestamp }) => {
    if (lyrics.length === 0) {
        return (
            <div className="rounded-xl border border-primary-darkest/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 text-center">
                <div className="text-4xl mb-3"></div>
                <p className="text-sm text-slate-300">
                    Aucune lyric pour le moment. Colle tes lyrics à gauche puis clique{" "}
                    <span className="font-bold text-primary-darkest">Load Lyrics</span>
                </p>
            </div>
        );
    }

  return (
    <div className="space-y-4">
        {lyrics.map((line, index) => {
            const isSelected = selectedLineId === line.id;
            const isSynced = line.isSynced;

        return (
            <div
                key={line.id}
                className={[
                    "group rounded-xl border p-5 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]",
                    "bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:from-slate-800/80 hover:to-slate-900/80",
                    "border-white/10 hover:border-white/20",
                    isSynced ? "ring-2 ring-primary-darkest/40 shadow-lg shadow-primary-darkest/20" : "",
                    isSelected ? "ring-2 ring-primary/60 border-primary/60 shadow-xl shadow-primary/30" : "",
                ].join(" ")}
                onClick={() => onSelectLine(line.id)}
            >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-400 bg-slate-700/50 px-2 py-1 rounded-md">
                    #{index + 1}
                  </span>
                  {isSynced ? (
                    <span className="rounded-full bg-gradient-to-r from-primary-darkest to-primary-dark px-3 py-1 text-xs font-bold text-white shadow-md">
                      ✓ Synced
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-700/50 border border-white/10 px-3 py-1 text-xs font-semibold text-slate-400">
                       Not synced
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm font-semibold text-foreground leading-relaxed">
                  {line.text}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-3">
                <span className="text-sm font-mono font-bold text-primary-dark bg-slate-700/50 px-3 py-1.5 rounded-lg">
                  {line.timestamp !== null
                    ? `${Math.floor(line.timestamp / 60)}:${(line.timestamp % 60)
                        .toFixed(2)
                        .padStart(5, "0")}`
                    : "--:--.--"}
                </span>

                <button
                  className="btn-danger px-3 py-1.5 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTimestamp(line.id);
                  }}
                >
                   Clear
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LyricsList;
