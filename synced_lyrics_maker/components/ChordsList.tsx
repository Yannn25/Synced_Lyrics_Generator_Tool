'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Music, Clock, Trash2, X, Check, Pencil } from "lucide-react";
import { ChordsListProps, ChordNotation, ChordSymbol } from "@/types";
import { formatTime } from "@/utils/formatTime";
import { parseChordSymbol } from "@/utils/parseChords";
import { translateChord, NOTATION_LABELS } from "@/utils/chordNotation";

// Composants shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Composants internes
import ShortcutsHint from "@/components/ShortcutsHints";


// ═══════════════════════════════════════════════════════
// COMPOSANT CHORDS LIST
// ═══════════════════════════════════════════════════════

/**
 * ChordsList - Liste des lignes d'accords pour synchronisation
 *
 * Fonctionnalités :
 * - Sélection de ligne par clic
 * - Édition inline des accords (double-clic ou bouton)
 * - Affichage/suppression du timestamp
 * - Affichage selon notation (Anglais / Latin / Chiffres)
 * - Indicateurs visuels de synchronisation
 */
const ChordsList: React.FC<ChordsListProps> = ({
  chords,
  selectedChordId,
  onSelectChord,
  onClearTimestamp,
  onUpdateTimestamp,
  onUpdateChordText,
  onDeleteChord,
  notation,
  musicalKey,
}) => {
  // État pour l'édition inline des accords
  const [editingChordId, setEditingChordId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<HTMLInputElement | null>(null);

  // État pour l'édition du timestamp
  const [editingTimestampId, setEditingTimestampId] = useState<number | null>(null);
  const [editTimestamp, setEditTimestamp] = useState('');
  const timestampInputRef = useRef<HTMLInputElement | null>(null);

  // Focus sur l'input quand on commence à éditer les accords
  useEffect(() => {
    if (editingChordId !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChordId]);

  // Focus sur l'input quand on commence à éditer le timestamp
  useEffect(() => {
    if (editingTimestampId !== null && timestampInputRef.current) {
      timestampInputRef.current.focus();
      timestampInputRef.current.select();
    }
  }, [editingTimestampId]);

  // ═══════════════════════════════════════════════════════
  // ÉDITION DES ACCORDS
  // ═══════════════════════════════════════════════════════

  const startEditing = (chordId: number, currentChords: ChordSymbol[]) => {
    setEditingChordId(chordId);
    // Reconstruit le texte brut à partir des labels
    setEditText(currentChords.map(c => c.label).join(' '));
    setEditingTimestampId(null);
  };

  const saveEdit = () => {
    if (editingChordId !== null && editText.trim()) {
      // Re-parse les accords depuis le texte brut
      const tokens = editText.trim().split(/\s+/).filter((t: string) => t.length > 0);
      const newChords: ChordSymbol[] = tokens.map((t: string) => parseChordSymbol(t));
      onUpdateChordText(editingChordId, newChords);
    }
    setEditingChordId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingChordId(null);
    setEditText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // ═══════════════════════════════════════════════════════
  // ÉDITION DU TIMESTAMP
  // ═══════════════════════════════════════════════════════

  const parseTimestampString = (str: string): number | null => {
    const trimmed = str.trim();
    if (!trimmed) return null;

    const colonMatch = trimmed.match(/^(\d+):(\d+(?:\.\d+)?)$/);
    if (colonMatch) {
      const minutes = parseInt(colonMatch[1], 10);
      const seconds = parseFloat(colonMatch[2]);
      return minutes * 60 + seconds;
    }

    const secondsOnly = parseFloat(trimmed);
    if (!isNaN(secondsOnly) && secondsOnly >= 0) {
      return secondsOnly;
    }

    return null;
  };

  const startEditingTimestamp = (chordId: number, currentTimestamp: number | null) => {
    setEditingTimestampId(chordId);
    setEditTimestamp(currentTimestamp !== null ? formatTime(currentTimestamp) : '');
    setEditingChordId(null);
  };

  const saveTimestampEdit = () => {
    if (editingTimestampId !== null) {
      const parsedTime = parseTimestampString(editTimestamp);
      onUpdateTimestamp(editingTimestampId, parsedTime);
    }
    setEditingTimestampId(null);
    setEditTimestamp('');
  };

  const cancelTimestampEdit = () => {
    setEditingTimestampId(null);
    setEditTimestamp('');
  };

  const handleTimestampKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTimestampEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelTimestampEdit();
    }
  };

  // ═══════════════════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════════════════

  const syncedCount = chords.filter(c => c.isSynced).length;
  const totalCount = chords.length;
  const syncPercentage = totalCount > 0 ? Math.round((syncedCount / totalCount) * 100) : 0;

  // Label de la notation active
  const notationLabel = NOTATION_LABELS;

  return (
    <Card className={cn(
      "relative overflow-hidden h-full flex flex-col",
      "bg-slate-900/40 backdrop-blur-xl",
      "border border-white/10",
      "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    )}>
      {/* Reflet glass subtil en haut */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Music className="h-5 w-5 text-purple-400" />
              Liste des Accords
            </CardTitle>

            {/* Stats de synchronisation */}
            {totalCount > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  syncPercentage === 100
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                )}
              >
                {syncedCount}/{totalCount} ({syncPercentage}%)
              </Badge>
            )}

            {/* Badge notation active */}
            <Badge
              variant="outline"
              className="bg-slate-700/30 text-muted-foreground border-white/10 text-[10px]"
            >
              {notationLabel[notation]}
            </Badge>
          </div>

          {/* Raccourcis clavier (mode compact) */}
          <ShortcutsHint compact />
        </div>
        <CardDescription>
          Cliquez sur une ligne pour la sélectionner, puis appuyez sur <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[10px]">Entrée</kbd> pour synchroniser.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {chords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aucun accord chargé</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Chargez des accords dans l'étape précédente
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chords.map((line, index) => {
              const isSelected = selectedChordId === line.id;
              const isEditing = editingChordId === line.id;

              return (
                <div
                  key={line.id}
                  onClick={() => !isEditing && onSelectChord(line.id)}
                  onDoubleClick={() => startEditing(line.id, line.chords)}
                  className={cn(
                    "group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                    // État par défaut
                    "bg-slate-800/30 border-white/5 hover:bg-slate-800/50 hover:border-white/10",
                    // Sélectionné
                    isSelected && "bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/20",
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
                        ? "bg-purple-500 text-white"
                        : line.isSynced
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-700/50 text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>

                    {/* Contenu : badges accords ou input d'édition */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            ref={editInputRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            onBlur={saveEdit}
                            placeholder="Ex: C G Am F"
                            className="h-8 text-sm font-mono bg-slate-900/50 border-white/20"
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
                        <div className="flex flex-wrap gap-1.5">
                          {line.chords.map((chord, chordIdx) => (
                            <Badge
                              key={`${line.id}-${chordIdx}`}
                              variant="outline"
                              className={cn(
                                "font-mono text-xs px-2 py-0.5",
                                isSelected
                                  ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                                  : line.isSynced
                                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                                    : "bg-slate-700/30 text-foreground/80 border-white/10"
                              )}
                            >
                              {translateChord(chord, notation, musicalKey)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions et timestamp */}
                    {!isEditing && (
                      <div className="flex items-center gap-2">
                        {/* Timestamp éditable */}
                        {editingTimestampId === line.id ? (
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
                                    "hover:ring-1 hover:ring-purple-500/50",
                                    line.isSynced
                                      ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                      : "bg-slate-700/30 text-muted-foreground hover:bg-slate-700/50"
                                  )}
                                >
                                  {line.timestamp !== null
                                    ? formatTime(line.timestamp)
                                    : "Non sync"
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
                                    startEditing(line.id, line.chords);
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-400"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Modifier les accords</TooltipContent>
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
                                    onDeleteChord(line.id);
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

export default ChordsList;

