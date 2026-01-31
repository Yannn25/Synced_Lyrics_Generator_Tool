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
            <div className="rounded-xl border border-white/5 bg-slate-800/30 px-6 py-12 text-center">
                <p className="text-sm text-slate-400">
                    Aucune lyric chargée. Colle tes paroles à gauche puis clique{" "}
                    <span className="font-semibold text-primary-dark">Load Lyrics</span>
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {lyrics.map((line, index) => {
                const isSelected = selectedLineId === line.id;
                const isSynced = line.isSynced;
                const isEditingTimestamp = editingTimestampId === line.id;
                const isEditingText = editingTextId === line.id;

                return (
                    <div
                        key={line.id}
                        className={[
                            "lyric-line group",
                            isSynced ? "lyric-line--synced" : "lyric-line--not-synced",
                            isSelected ? "lyric-line--selected" : "",
                            "hover:bg-slate-700/40"
                        ].join(" ")}
                        onClick={() => onSelectLine(line.id)}
                    >
                        <div className="flex items-center justify-between gap-4">
                            {/* Left side: index + text */}
                            <div className="min-w-0 flex-1 flex items-center gap-3">
                                <span className="text-xs font-mono text-slate-500 w-6 shrink-0">
                                    {index + 1}
                                </span>

                                {/* Texte de la lyric - éditable en double-clic */}
                                {isEditingText ? (
                                    <input
                                        ref={textInputRef}
                                        type="text"
                                        value={textValue}
                                        onChange={(e) => setTextValue(e.target.value)}
                                        onKeyDown={(e) => handleTextKeyDown(e, line.id)}
                                        onBlur={() => confirmTextEdit(line.id)}
                                        className="flex-1 text-sm text-foreground bg-slate-700 px-3 py-1.5 rounded-lg border border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/60"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span
                                        className="text-sm text-foreground truncate cursor-text hover:text-primary-light transition-colors"
                                        onDoubleClick={(e) => startEditingText(line.id, line.text, e)}
                                        title="Double-clic pour éditer"
                                    >
                                        {line.text}
                                    </span>
                                )}
                            </div>

                            {/* Right side: status + timestamp + actions */}
                            <div className="flex items-center gap-3 shrink-0">
                                {/* Badge de statut */}
                                {isSynced ? (
                                    <span className="badge badge--synced text-[10px]">Synced</span>
                                ) : (
                                    <span className="badge badge--not-synced text-[10px]">Not synced</span>
                                )}

                                {/* Timestamp éditable */}
                                {isEditingTimestamp ? (
                                    <input
                                        ref={timestampInputRef}
                                        type="text"
                                        value={timestampValue}
                                        onChange={(e) => setTimestampValue(e.target.value)}
                                        onKeyDown={(e) => handleTimestampKeyDown(e, line.id)}
                                        onBlur={() => confirmTimestampEdit(line.id)}
                                        placeholder="0:00.00"
                                        className="w-20 text-xs font-mono text-primary-dark bg-slate-700 px-2 py-1 rounded border border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/60"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <button
                                        onClick={(e) => startEditingTimestamp(line.id, line.timestamp, e)}
                                        className="text-xs font-mono text-primary-dark bg-slate-700/50 px-2 py-1 rounded hover:bg-slate-600/50 transition-colors min-w-[70px] text-center"
                                        title="Cliquer pour éditer"
                                    >
                                        {line.timestamp === null ? "--:--.--" : formatTime(line.timestamp as number)}
                                    </button>
                                )}

                                {/* Actions - visible au hover */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-1.5 text-xs rounded bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClearTimestamp(line.id);
                                        }}
                                        title="Effacer le timestamp"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <button
                                        className="p-1.5 text-xs rounded bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                        onClick={(e) => handleDeleteLine(line.id, e)}
                                        title="Supprimer cette ligne"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
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
