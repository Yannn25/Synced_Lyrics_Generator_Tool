'use client'

import React, { useState, useMemo, useRef } from 'react';
import {FileText, Wand2, Zap, AlertCircle, Info, Settings2, CheckCircle2, Music, AudioLines} from "lucide-react";
import { UnifiedSong } from "@/types";
import { parseChordPro, extractMetadata } from "@/utils/parseChordPro";
import { isChordTokenSupported, parseChordSymbol } from "@/utils/parseChords";
import { KEY_OPTIONS, rootToSemitone, semitoneToLatinRoot, semitoneToEnglishRoot } from "@/utils/chordNotation";

// Composants shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Constantes
const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8", "12/8"];

// Quick Insert Options per Notation
const QUICK_INSERTS = {
    english: [
        { label: "[C]", value: "[C]" },
        { label: "[D]", value: "[D]" },
        { label: "[E]", value: "[E]" },
        { label: "[F]", value: "[F]" },
        { label: "[G]", value: "[G]" },
        { label: "[A]", value: "[A]" },
        { label: "[B]", value: "[B]" },
    ],
    latin: [
        { label: "[Do]", value: "[Do]" },
        { label: "[Ré]", value: "[Ré]" },
        { label: "[Mi]", value: "[Mi]" },
        { label: "[Fa]", value: "[Fa]" },
        { label: "[Sol]", value: "[Sol]" },
        { label: "[La]", value: "[La]" },
        { label: "[Si]", value: "[Si]" },
    ],
    numerical: [
        { label: "[1]", value: "[1]" },
        { label: "[2]", value: "[2]" },
        { label: "[3]", value: "[3]" },
        { label: "[4]", value: "[4]" },
        { label: "[5]", value: "[5]" },
        { label: "[6]", value: "[6]" },
        { label: "[7]", value: "[7]" },
    ]
};

const SECTIONS = [
    { label: "{Verse}", value: "\n{Verse}\n" },
    { label: "{Chorus}", value: "\n{Chorus}\n" },
    { label: "{Bridge}", value: "\n{Bridge}\n" },
];

interface UnifiedInputProps {
    value: string;
    onChange: (value: string) => void;
    metadata: UnifiedSong;
    onMetadataChange: (meta: UnifiedSong) => void;
    isAudioLoaded: boolean;
}

/**
 * UnifiedInput - Composant d'édition tout-en-un pour l'étape 1
 *
 * Combine les fonctionnalités de LyricsInput (texte, lignes) et ChordsInput (validation, stats)
 * avec une gestion intégrée des métadonnées et un quick insert contextuel.
 */
const UnifiedInput: React.FC<UnifiedInputProps> = ({
    value,
    onChange,
    metadata,
    onMetadataChange,
    isAudioLoaded
}) => {
    // État local pour le textarea si non contrôlé (ici on suppose contrôlé via value/onChange)
    // État pour la notation des quick inserts
    const [notation, setNotation] = useState<'english' | 'latin' | 'numerical'>('english');
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const selectionRef = useRef({ start: 0, end: 0 });

    // --- LOGIQUE METADATA ---

    const updateMetadata = (field: keyof UnifiedSong, val: any) => {
        onMetadataChange({ ...metadata, [field]: val });
    };

    // --- LOGIQUE SSTATS & VALIDATION ---

    const stats = useMemo(() => {
        const lines = value.split('\n');
        const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
        const chars = value.length;
        
        // Extraction des accords via regex simple [Accord]
        const chordRegex = /\[([^[\]]+)]/g;
        const chordsMatches = [...value.matchAll(chordRegex)];
        const chords = chordsMatches.map(m => m[1]);
        const uniqueChords = new Set(chords).size;
        
        // Validation robuste
        const validChords = chords.filter(c => isChordTokenSupported(c, metadata.key)).length;
        const invalidChords = chords.length - validChords;

        return {
            lines: nonEmptyLines,
            chars,
            totalChords: chords.length,
            uniqueChords,
            validChords,
            invalidChords
        };
    }, [value, metadata.key]);

    // --- LOGIQUE TRANSLATION & TEXTAREA ---

    const convertRootToTarget = (root: string, targetSystem: 'english' | 'latin' | 'numerical', key: string): string => {
        const semitone = rootToSemitone(root);
        if (semitone === -1) return root; // Si on ne reconnaît pas, on renvoie tel quel
        
        if (targetSystem === 'latin') {
             return semitoneToLatinRoot(semitone, root.includes('b'));
        }
        if (targetSystem === 'english') {
             return semitoneToEnglishRoot(semitone, root.includes('b'));
        }
        // Numerical logic (skipped for simplicity or need specific helper in context)
        // Pour l'instant on ne gère pas numerical car cela dépend fortement de la tonalité
        return semitoneToEnglishRoot(semitone, root.includes('b')); 
    };

    const convertChordToNotation = (chordToken: string, targetSystem: 'english' | 'latin' | 'numerical'): string => {
        // Parse le symbole
         const parsed = parseChordSymbol(chordToken, { key: metadata.key });
         // parsed.root est déjà normalisé en anglais (ex: C, F#, Bb)
         
         const newRoot = convertRootToTarget(parsed.root, targetSystem, metadata.key);
         let newBass = undefined;
         
         if (parsed.bass) {
             newBass = convertRootToTarget(parsed.bass, targetSystem, metadata.key);
         }
         
         return `${newRoot}${parsed.quality}${newBass ? `/${newBass}` : ''}`;
    };

    const handleNotationChange = (newNotation: 'english' | 'latin' | 'numerical') => {
        setNotation(newNotation);
        
        // Si on passe en numerical, on peut avertir ou gérer plus tard
        if (newNotation === 'numerical') return;

        // On traduit tous les accords présents dans le texte
        const chordRegex = /\[([^[\]]+)]/g;
        
        const newText = value.replace(chordRegex, (match, chordToken) => {
             // Si l'accord est valide
             if (isChordTokenSupported(chordToken, metadata.key)) {
                 const translated = convertChordToNotation(chordToken, newNotation);
                 return `[${translated}]`;
             }
             return match;
        });
        
        if (newText !== value) {
            onChange(newText);
        }
    };


    const insertAtCursor = (textToInsert: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const isFocused = document.activeElement === textarea;
        const start = isFocused ? textarea.selectionStart : selectionRef.current.start;
        const end = isFocused ? textarea.selectionEnd : selectionRef.current.end;
        const currentText = value;
        
        const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
        onChange(newText);

        const nextCursor = start + textToInsert.length;
        selectionRef.current = { start: nextCursor, end: nextCursor };

        // Refocus et replacement du curseur
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
                nextCursor,
                nextCursor
            );
        });
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* 1. BARRE DE MÉTADONNÉES (Style Glass) */}
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 p-3 rounded-xl bg-slate-900/40 border border-white/10 backdrop-blur-md shadow-sm items-end">
                {/* BPM */}
                <div className="col-span-1 lg:col-span-2 space-y-1.5">
                    <Label htmlFor="bpm" className="text-xs text-muted-foreground ml-1">BPM</Label>
                    <div className="relative">
                        <Input
                            id="bpm"
                            type="number"
                            placeholder="120"
                            className="bg-slate-950/50 border-white/10 pl-8 h-9 text-sm"
                            value={metadata.bpm || ""}
                            onChange={(e) => updateMetadata("bpm", parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>

                {/* Signature */}
                <div className="col-span-1 lg:col-span-2 space-y-1.5">
                    <Label className="text-xs text-muted-foreground ml-1">Signature</Label>
                    <Select
                        value={metadata.timeSignature}
                        onValueChange={(v) => updateMetadata("timeSignature", v)}
                    >
                        <SelectTrigger className="bg-slate-950/50 border-white/10 h-9 text-sm">
                            <SelectValue placeholder="4/4" />
                        </SelectTrigger>
                        <SelectContent>
                            {TIME_SIGNATURES.map((sig) => (
                                <SelectItem key={sig} value={sig}>{sig}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Key */}
                <div className="col-span-1 lg:col-span-3 space-y-1.5">
                    <Label className="text-xs text-muted-foreground ml-1">Tonalité (Key)</Label>
                    <Select
                        value={metadata.key}
                        onValueChange={(v) => updateMetadata("key", v)}
                    >
                        <SelectTrigger className="bg-slate-950/50 border-white/10 h-9 text-sm">
                            <SelectValue placeholder="C" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {KEY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    <span className="font-mono mr-2">{opt.label}</span>
                                    <span className="text-muted-foreground text-xs">({opt.value})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Info Button - First Position */}
                <div className="col-span-1 lg:col-span-1">
                    <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="w-full h-9 border-white/10 bg-gradient-to-br from-slate-950/60 to-slate-900/40 text-slate-100 hover:bg-gradient-to-br hover:from-slate-900/80 hover:to-slate-800/60 hover:border-purple-500/30 transition-all duration-200"
                                title="À propos du chant"
                            >
                                <AudioLines className="h-4 w-4 text-purple-400" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 shadow-2xl backdrop-blur-xl z-50">
                            {/* Décoration dégradé subtil en haut */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

                            <DialogHeader className="relative px-6 py-5 border-b border-white/5 bg-slate-950/30 backdrop-blur-sm">
                                <div className="flex flex-col gap-1">
                                    <DialogTitle className="text-lg font-semibold tracking-tight text-slate-100">À propos du chant</DialogTitle>
                                </div>
                            </DialogHeader>

                            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="about" className="text-sm font-medium text-slate-200">
                                            Informations
                                        </Label>
                                        <span className="text-xs text-slate-500">
                                            {(metadata.about || "").length}/750
                                        </span>
                                    </div>
                                    <Textarea
                                        id="about"
                                        value={metadata.about || ""}
                                        onChange={(e) => updateMetadata("about", e.target.value.slice(0, 500))}
                                        maxLength={500}
                                        className="h-[240px] max-h-[240px] resize-none rounded-lg border-white/10 bg-slate-950/50 text-slate-100 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/30 transition-colors overflow-y-auto"
                                        placeholder={`Ce chant a été reçu...`}
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-white/5 bg-slate-950/20 backdrop-blur-sm flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                    Ces informations enrichissent votre fiche chant
                                </span>
                                <Button
                                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20 transition-all duration-200"
                                    onClick={() => setIsInfoOpen(false)}
                                >
                                    Terminer
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>


            {/* 2. ÉDITEUR PRINCIPAL (Card) */}
            <Card className={cn(
                "flex-1 flex flex-col overflow-hidden border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-lg",
                isAudioLoaded && stats.lines > 0 && "border-green-500/20 shadow-green-500/5"
            )}>

                {/* Header Status Bar */}
                <div className="px-4 py-2 bg-slate-950/50 border-t border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                        {stats.totalChords > 0 && (
                            <div className={cn("flex items-center gap-2", stats.invalidChords > 0 ? "text-amber-400" : "text-purple-400")}>
                                <Zap className="w-3.5 h-3.5" />
                                <span>{stats.totalChords} accords</span>
                                {stats.invalidChords > 0 && (
                                    <span className="opacity-80">({stats.invalidChords} non reconnus)</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isAudioLoaded && stats.lines > 0 ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 h-5 px-2 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Prêt pour Synchro
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" />
                                {stats.lines === 0 ? "En attente de contenu..." : "Audio requis"}
                            </span>
                        )}
                    </div>
                </div>
                <div className="relative flex-1 flex flex-col group min-h-0">
                    <Textarea
                        ref={textareaRef}
                        className="flex-1 w-full rounded-none border-0 bg-transparent p-6 font-mono text-sm leading-relaxed resize-none focus-visible:ring-0 placeholder:text-slate-600"
                        placeholder={`{Title: Amazing Grace}
{Key: C}
{BPM: 100}

[C]Amazing [G]Grace, how [Am]sweet the [F]sound
That [C]saved a [G]wretch like [C]me

{Verse 2}
...`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onSelect={(e) => {
                            selectionRef.current = {
                                start: e.currentTarget.selectionStart,
                                end: e.currentTarget.selectionEnd,
                            };
                        }}
                        onKeyUp={(e) => {
                            selectionRef.current = {
                                start: e.currentTarget.selectionStart,
                                end: e.currentTarget.selectionEnd,
                            };
                        }}
                        onClick={(e) => {
                            selectionRef.current = {
                                start: e.currentTarget.selectionStart,
                                end: e.currentTarget.selectionEnd,
                            };
                        }}
                    />
                    
                    {/* Stats Flottantes (Bottom Right) */}
                    <div className="absolute bottom-6 right-6 flex items-center gap-3 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                         <div className="bg-slate-950/80 backdrop-blur rounded px-2 py-1 text-[10px] text-muted-foreground border border-white/5 shadow-xl">
                            {stats.lines} lignes
                        </div>
                        <div className="bg-slate-950/80 backdrop-blur rounded px-2 py-1 text-[10px] text-muted-foreground border border-white/5 shadow-xl">
                            {stats.chars} car.
                        </div>
                        {stats.invalidChords > 0 && (
                             <div className="bg-red-500/20 backdrop-blur rounded px-2 py-1 text-[10px] text-red-300 border border-red-500/20 shadow-xl flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {stats.invalidChords} invalides
                            </div>
                        )}
                    </div>
                </div>

                {/* Toolbar Rapide - Positionnée en bas */}
                <div className="flex items-center gap-2 p-2 border-t border-white/5 bg-slate-950/30 overflow-x-auto no-scrollbar">
                    {/* Selecteur de notation pour l'insertion */}
                    <Select
                        value={notation}
                        onValueChange={(v: any) => handleNotationChange(v)}
                    >
                        <SelectTrigger className="h-7 w-[100px] text-xs bg-slate-800/50 border-white/5">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="english">Anglais</SelectItem>
                            <SelectItem value="latin">Latin</SelectItem>
                            {/* Numerical removed/disabled for translation logic safety for now or kept as insert only */}
                             <SelectItem value="numerical">Chiffres</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    {/* Sections */}
                    {SECTIONS.map((sec) => (
                        <Button
                            key={sec.label}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 text-muted-foreground hover:text-white hover:bg-white/5"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => insertAtCursor(sec.value)}
                        >
                            {sec.label}
                        </Button>
                    ))}

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    {/* Accords Rapides */}
                    {QUICK_INSERTS[notation].map((chord) => (
                        <Button
                            key={chord.label}
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs px-2 font-mono bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/20"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => insertAtCursor(chord.value)}
                        >
                            {chord.label}
                        </Button>
                    ))}
                </div>


            </Card>
        </div>
    );
};

export default UnifiedInput;

