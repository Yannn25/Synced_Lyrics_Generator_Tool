'use client'

import React, { useState, useRef, useEffect } from "react";
import { LyricsListProps } from "@/types";
import { formatTime, parseTimestamp } from "@/utils/formatTime";

const LyricsList: React.FC<LyricsListProps> = ({ lyrics, selectedLineId, onSelectLine, onClearTimestamp, onUpdateTimestamp, onUpdateLineText, onDeleteLine }) => {
    // State for editing timestamps
    const [editingTimestampId, setEditingTimestampId] = useState<number | null>(null);
    const [timestampValue, setTimestampValue] = useState<string>("");
    const timestampInputRef = useRef<HTMLInputElement | null>(null);

    // State for editing text
    const [editingTextId, setEditingTextId] = useState<number | null>(null);
    const [textValue, setTextValue] = useState<string>("");
    const textInputRef = useRef<HTMLInputElement | null>(null);

    // Focus on timestamp input when editing timestamp
    useEffect(() => {
        if (editingTimestampId !== null && timestampInputRef.current) {
            timestampInputRef.current.focus();
            timestampInputRef.current.select();
        }
    }, [editingTimestampId]);

    // Focus on text input when editing text
    useEffect(() => {
        if (editingTextId !== null && textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.select();
        }
    }, [editingTextId]);


    // --- Functions for the editing of the timestamps ---
    const startEditingTimestamp = (lineId: number, currentTimestamp: number | null, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTimestampId(lineId);
        setTimestampValue(currentTimestamp !== null ? formatTime(currentTimestamp) : "");
    };

    const confirmTimestampEdit = (lineId: number) => {
        const parsed = parseTimestamp(timestampValue);
        onUpdateTimestamp(lineId, parsed);
        setEditingTimestampId(null);
        setTimestampValue("");
    };

    const cancelTimestampEdit = () => {
        setEditingTimestampId(null);
        setTimestampValue("");
    };

    const handleTimestampKeyDown = (e: React.KeyboardEvent, lineId: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            confirmTimestampEdit(lineId);
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancelTimestampEdit();
        }
    };

    // --- Functions for the text editing ---
    const startEditingText = (lineId: number, currentText: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTextId(lineId);
        setTextValue(currentText);
    };

    const confirmTextEdit = (lineId: number) => {
        // Don't allow empty text
        if (textValue.trim() !== "") {
            onUpdateLineText(lineId, textValue.trim());
        }
        setEditingTextId(null);
        setTextValue("");
    };

    const cancelTextEdit = () => {
        setEditingTextId(null);
        setTextValue("");
    };

    const handleTextKeyDown = (e: React.KeyboardEvent, lineId: number) => {
        if (e.key === "Enter") {
            e.preventDefault();
            confirmTextEdit(lineId);
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancelTextEdit();
        }
    };

    // Function to delete a line
    const handleDeleteLine = (lineId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteLine(lineId);
    };

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
                const isEditingTimestamp = editingTimestampId === line.id;
                const isEditingText = editingTextId === line.id;

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
                                            ○ Not synced
                                        </span>
                                    )}
                                </div>

                                {/* Texte de la lyric - éditable en double-clic */}
                                {isEditingText ? (
                                    <input
                                        ref={textInputRef}
                                        type="text"
                                        value={textValue}
                                        onChange={(e) => setTextValue(e.target.value)}
                                        onKeyDown={(e) => handleTextKeyDown(e, line.id)}
                                        onBlur={() => confirmTextEdit(line.id)}
                                        className="w-full text-sm font-semibold text-foreground bg-slate-700 px-3 py-2 rounded-lg border border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/60 leading-relaxed"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <div
                                        className="mt-2 text-sm font-semibold text-foreground leading-relaxed cursor-text hover:bg-slate-700/30 px-2 py-1 -mx-2 rounded-lg transition-colors"
                                        onDoubleClick={(e) => startEditingText(line.id, line.text, e)}
                                        title="Double-clic pour éditer"
                                    >
                                        {line.text}
                                    </div>
                                )}
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-3">
                                {/* Timestamp éditable */}
                                {isEditingTimestamp ? (
                                    <input
                                        ref={timestampInputRef}
                                        type="text"
                                        value={timestampValue}
                                        onChange={(e) => setTimestampValue(e.target.value)}
                                        onKeyDown={(e) => handleTimestampKeyDown(e, line.id)}
                                        onBlur={() => confirmTimestampEdit(line.id)}
                                        placeholder="--:--:--"
                                        className="w-24 text-sm font-mono font-bold text-primary-dark bg-slate-700 px-3 py-1.5 rounded-lg border border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <button
                                        onClick={(e) => startEditingTimestamp(line.id, line.timestamp, e)}
                                        className="text-sm font-mono font-bold text-primary-dark bg-slate-700/50 px-3 py-1.5 rounded-lg hover:bg-slate-600/50 hover:ring-2 hover:ring-primary/30 transition-all"
                                        title="Cliquer pour éditer le timestamp"
                                    >
                                        {line.timestamp === null ? "--:--:--" : formatTime(line.timestamp as number)}
                                    </button>
                                )}

                                {/* Boutons d'action */}
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn-danger px-3 py-1.5 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClearTimestamp(line.id);
                                        }}
                                        title="Effacer le timestamp"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        className="px-3 py-1.5 text-xs rounded-lg bg-red-900/50 hover:bg-red-800/70 text-red-300 hover:text-red-200 border border-red-700/50 transition-colors"
                                        onClick={(e) => handleDeleteLine(line.id, e)}
                                        title="Supprimer cette ligne"
                                    >🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LyricsList;
