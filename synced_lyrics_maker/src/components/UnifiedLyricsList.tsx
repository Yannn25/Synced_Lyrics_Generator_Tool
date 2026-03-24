'use client'

import React, { useState, useRef, useEffect } from 'react';
import { List, Clock, Trash2, X, Check, Pencil } from "lucide-react";
import { UnifiedLine } from "@/types";
import { formatTime } from "@/utils/formatTime";

// Composants shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Composants internes
import ShortcutsHint from "@/components/ShortcutsHints";

interface UnifiedLyricsListProps {
    lines: UnifiedLine[];
    selectedLineId: number | null;
    onSelectLine: (lineId: number) => void;
    onClearTimestamp: (lineId: number) => void;
    onUpdateTimestamp: (lineId: number, timestamp: number | null) => void;
    onUpdateLineContent: (lineId: number, newContent: string) => void;
    onDeleteLine: (lineId: number) => void;
}

/**
 * UnifiedLyricsList - Liste des lignes unifiées (paroles + accords) avec édition inline
 *
 * Fonctionnalités :
 * - Sélection de ligne par clic
 * - Édition inline du contenu (originalText) (double-clic ou bouton)
 * - Affichage/suppression du timestamp
 * - Indicateur de synchronisation
 * - Affichage des accords en mode lecture
 */
const UnifiedLyricsList: React.FC<UnifiedLyricsListProps> = ({
    lines,
    selectedLineId,
    onSelectLine,
    onClearTimestamp,
    onUpdateTimestamp,
    onUpdateLineContent,
    onDeleteLine
}) => {
    // État pour l'édition inline du texte
    const [editingLineId, setEditingLineId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    // État pour l'édition du timestamp
    const [editingTimestampId, setEditingTimestampId] = useState<number | null>(null);
    const [editTimestamp, setEditTimestamp] = useState('');
    const timestampInputRef = useRef<HTMLInputElement>(null);

    // Focus sur l'input quand on commence à éditer le texte
    useEffect(() => {
        if (editingLineId !== null && editInputRef.current) {
            editInputRef.current.focus();
            // editInputRef.current.select(); // Optionnel : sélectionner tout le texte
        }
    }, [editingLineId]);

    // Focus sur l'input quand on commence à éditer le timestamp
    useEffect(() => {
        if (editingTimestampId !== null && timestampInputRef.current) {
            timestampInputRef.current.focus();
            timestampInputRef.current.select();
        }
    }, [editingTimestampId]);

    // Démarrer l'édition du texte (contenu original avec accords)
    const startEditing = (lineId: number, currentText: string) => {
        setEditingLineId(lineId);
        setEditText(currentText);
        // Annuler l'édition du timestamp si en cours
        setEditingTimestampId(null);
    };

    // Sauvegarder l'édition du contenu
    const saveEdit = () => {
        if (editingLineId !== null && editText.trim()) {
            onUpdateLineContent(editingLineId, editText); // On garde les espaces potentiels pour les accords
        }
        setEditingLineId(null);
        setEditText('');
    };

    // Annuler l'édition du texte
    const cancelEdit = () => {
        setEditingLineId(null);
        setEditText('');
    };

    // Gestion des touches clavier dans l'input d'édition du texte
    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    };

    // === ÉDITION DU TIMESTAMP ===

    /**
     * Parse un string de timestamp au format "mm:ss.ms" vers un nombre en secondes
     * Supporte : "1:23.45", "01:23.45", "83.45" (secondes seules), "1:23"
     */
    const parseTimestampString = (str: string): number | null => {
        const trimmed = str.trim();
        if (!trimmed) return null;

        // Format mm:ss.ms ou mm:ss
        const colonMatch = trimmed.match(/^(\d+):(\d+(?:\.\d+)?)$/);
        if (colonMatch) {
            const minutes = parseInt(colonMatch[1], 10);
            const seconds = parseFloat(colonMatch[2]);
            return minutes * 60 + seconds;
        }

        // Format secondes seules (ex: "83.45")
        const secondsOnly = parseFloat(trimmed);
        if (!isNaN(secondsOnly) && secondsOnly >= 0) {
            return secondsOnly;
        }

        return null;
    };

    // Démarrer l'édition du timestamp
    const startEditingTimestamp = (lineId: number, currentTimestamp: number | null) => {
        setEditingTimestampId(lineId);
        setEditTimestamp(currentTimestamp !== null ? formatTime(currentTimestamp) : '');
        // Annuler l'édition du texte si en cours
        setEditingLineId(null);
    };

    // Sauvegarder l'édition du timestamp
    const saveTimestampEdit = () => {
        if (editingTimestampId !== null) {
            const parsedTime = parseTimestampString(editTimestamp);
            onUpdateTimestamp(editingTimestampId, parsedTime);
        }
        setEditingTimestampId(null);
        setEditTimestamp('');
    };

    // Annuler l'édition du timestamp
    const cancelTimestampEdit = () => {
        setEditingTimestampId(null);
        setEditTimestamp('');
    };

    // Gestion des touches clavier dans l'input d'édition du timestamp
    const handleTimestampKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTimestampEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelTimestampEdit();
        }
    };

    // Rendu du contenu d'une ligne (texte + accords)
    const renderLineContent = (line: UnifiedLine) => {
        const { strippedText, chords } = line;
        
        // Cas spécial : ligne purement instrumentale (accords seuls)
        if (line.isInstrumental) {
            return (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30 font-medium">
                            🎸 Instrumental
                        </Badge>
                        <span className="text-xs text-slate-400">Accords uniquement</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {chords.map((chord, i) => (
                            <span 
                                key={i} 
                                className="text-purple-400 font-bold text-xs bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20"
                            >
                                {chord.symbol}
                            </span>
                        ))}
                    </div>
                </div>
            );
        }

        // Cas normal : texte avec accords
        if (!chords || chords.length === 0) {
             return <span className="text-foreground/80">{strippedText}</span>;
        }

        const sortedChords = [...chords].sort((a, b) => a.index - b.index);
        const parts = [];
        let lastIndex = 0;

        sortedChords.forEach((chord, i) => {
            // Text before chord
            if (chord.index > lastIndex) {
                parts.push(strippedText.slice(lastIndex, chord.index));
            }
            // Chord
            parts.push(
                <span key={`chord-${i}`} className="text-purple-400 font-bold mx-0.5 text-xs align-text-top bg-purple-500/10 px-1 rounded inline-block -mt-1 transform -translate-y-[2px]">
                    {chord.symbol}
                </span>
            );
            lastIndex = chord.index;
        });

        // Remaining text
        if (lastIndex < strippedText.length) {
            parts.push(strippedText.slice(lastIndex));
        }

        return <div className="leading-snug">{parts}</div>;
    };


    // Stats
    const syncedCount = lines.filter(l => l.isSynced).length;
    const totalCount = lines.length;
    const syncPercentage = totalCount > 0 ? Math.round((syncedCount / totalCount) * 100) : 0;

    return (
        <Card className={cn(
            "relative overflow-hidden h-full flex flex-col",
            // Effet Glass
            "bg-slate-900/40 backdrop-blur-xl",
            "border border-white/10",
            "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        )}>
            {/* Reflet glass subtil en haut */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <List className="h-5 w-5 text-primary" />
                            Liste des Lignes
                        </CardTitle>

                        {/* Stats de synchronisation */}
                        {totalCount > 0 && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "gap-1",
                                    syncPercentage === 100
                                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                )}
                            >
                                {syncedCount}/{totalCount} ({syncPercentage}%)
                            </Badge>
                        )}
                    </div>

                    {/* Raccourcis clavier (mode compact) */}
                    <ShortcutsHint compact />
                </div>
                <CardDescription>
                    Clique sur une ligne pour la sélectionner, puis appuie sur <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[10px]">Entrée</kbd> ou <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[10px]">Sync</kbd>. Double-clique pour éditer le ChordPro.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto px-2">
                {lines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <List className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Aucun contenu chargé</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Chargez des paroles dans l'étape précédente
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 pb-4">
                        {lines.map((line, index) => {
                            const isSelected = selectedLineId === line.id;
                            const isEditing = editingLineId === line.id;

                            return (
                                <div
                                    key={line.id}
                                    onClick={() => !isEditing && onSelectLine(line.id)}
                                    onDoubleClick={() => startEditing(line.id, line.originalText)}
                                    className={cn(
                                        "group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                                        // État par défaut
                                        "bg-slate-800/30 border-white/5 hover:bg-slate-800/50 hover:border-white/10",
                                        // Sélectionné
                                        isSelected && "bg-primary/10 border-primary/30 ring-1 ring-primary/20",
                                        // Synchronisé
                                        line.isSynced && !isSelected && "bg-green-500/5 border-green-500/20",
                                        // En édition
                                        isEditing && "bg-blue-500/10 border-blue-500/30"
                                    )}
                                >
                    <div className="flex items-center gap-3">
                        {/* Numéro de ligne */}
                        <span className={cn(
                            "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                            isSelected
                                ? "bg-primary text-primary-foreground"
                                : line.isSynced
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-slate-700/50 text-muted-foreground"
                        )}>
                            {index + 1}
                        </span>

                        {/* Section badge (AMÉLIORÉ) */}
                        {line.section && (
                            <Badge
                                className={cn(
                                    "text-xs font-semibold px-2 py-0.5",
                                    line.isInstrumental
                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                        : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                )}
                            >
                                {line.isInstrumental ? "🎸" : "♪"} {line.section}
                            </Badge>
                        )}

                        {/* Texte de la ligne (éditable ou non) */}
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        ref={editInputRef}
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={handleEditKeyDown}
                                        onBlur={saveEdit}
                                        placeholder="[C] Lyrics..."
                                        className="h-8 text-sm bg-slate-900/50 border-white/20 font-mono"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                                                    className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Sauvegarder (Entrée)</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Annuler (Échap)</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            ) : (
                                <div className={cn(
                                    "text-sm",
                                    isSelected ? "text-foreground font-medium" : "text-foreground/80"
                                )}>
                                    {renderLineContent(line)}
                                </div>
                            )}
                        </div>

                                        {/* Actions et timestamp */}
                                        {!isEditing && (
                                            <div className="flex items-center gap-2">
                                                {/* Timestamp éditable */}
                                                {editingTimestampId === line.id ? (
                                                    // Mode édition du timestamp
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            ref={timestampInputRef}
                                                            value={editTimestamp}
                                                            onChange={(e) => setEditTimestamp(e.target.value)}
                                                            onKeyDown={handleTimestampKeyDown}
                                                            onBlur={saveTimestampEdit}
                                                            placeholder="mm:ss.ms"
                                                            className="h-7 w-24 text-xs font-mono bg-slate-900/50 border-white/20 text-center"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={(e) => { e.stopPropagation(); saveTimestampEdit(); }}
                                                                        className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                                                                    >
                                                                        <Check className="h-3 w-3" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Sauvegarder</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={(e) => { e.stopPropagation(); cancelTimestampEdit(); }}
                                                                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Annuler</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                ) : (
                                                    // Affichage normal du timestamp (cliquable pour éditer)
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startEditingTimestamp(line.id, line.timestamp);
                                                                    }}
                                                                    className={cn(
                                                                        "text-xs font-mono px-2 py-1 rounded cursor-pointer transition-all",
                                                                        "hover:ring-1 hover:ring-primary/50",
                                                                        line.isSynced
                                                                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                                                            : "bg-slate-700/30 text-muted-foreground hover:bg-slate-700/50"
                                                                    )}
                                                                >
                                                                    {line.timestamp !== null
                                                                        ? formatTime(line.timestamp)
                                                                        : "Not synced"
                                                                    }
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Cliquer pour modifier le timestamp
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}

                                                {/* Boutons d'action (visibles au hover) */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {/* Éditer */}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startEditing(line.id, line.originalText);
                                                                    }}
                                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-400"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Modifier le texte (Double-clic)</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    {/* Clear timestamp */}
                                                    {line.isSynced && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onClearTimestamp(line.id);
                                                                        }}
                                                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-orange-400"
                                                                    >
                                                                        <Clock className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Supprimer le timestamp</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}

                                                    {/* Supprimer ligne */}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDeleteLine(line.id);
                                                                    }}
                                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Supprimer la ligne</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UnifiedLyricsList;

