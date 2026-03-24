'use client'

import React, { useState, useMemo } from 'react';
import { Music, Upload, CheckCircle2, Info, AlertCircle } from "lucide-react";

// Composants shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Utils
import { isChordTokenSupported } from "@/utils/parseChords";

interface ChordsInputProps {
  onLoadChords: (text: string) => void;
  value?: string;
  onValueChange?: (text: string) => void;
}

interface ChordValidation {
  token: string;
  isValid: boolean;
}

interface LineValidation {
  chords: ChordValidation[];
}

const ChordsInput: React.FC<ChordsInputProps> = ({ onLoadChords, value, onValueChange }) => {
  const [internalText, setInternalText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  const text = value ?? internalText;
  const setText = onValueChange ?? setInternalText;

  // Validation en temps réel des accords
  const validation = useMemo((): LineValidation[] => {
    if (!text.trim()) return [];

    return text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        const tokens = line.trim().split(/\s+/).filter(t => t.length > 0);
        return {
          chords: tokens.map(token => ({
            token,
            isValid: isChordTokenSupported(token),
          })),
        };
      });
  }, [text]);

  // Statistiques dérivées
  const stats = useMemo(() => {
    const totalChords = validation.reduce((sum, line) => sum + line.chords.length, 0);
    const validChords = validation.reduce(
      (sum, line) => sum + line.chords.filter(c => c.isValid).length, 0
    );
    const invalidChords = totalChords - validChords;
    return { totalChords, validChords, invalidChords, totalLines: validation.length };
  }, [validation]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (isLoaded) {
      setIsLoaded(false);
    }
  };

  const handleLoad = () => {
    if (text.trim()) {
      const lines = text.split('\n').filter(line => line.trim()).length;
      onLoadChords(text);
      setLineCount(lines);
      setIsLoaded(true);
    }
  };

  const handleClear = () => {
    setText('');
    setIsLoaded(false);
    setLineCount(0);
  };

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

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Music className="h-5 w-5 text-purple-400" />
              Accords
            </CardTitle>

            {/* Badge de confirmation quand chargé */}
            {isLoaded && (
              <Badge
                variant="outline"
                className="gap-1 bg-green-500/10 text-green-400 border-green-500/30 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <CheckCircle2 className="h-3 w-3" />
                {lineCount} lignes · {stats.validChords} accords
              </Badge>
            )}
          </div>

          {/* Bouton pour effacer */}
          {text.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-red-400 h-8"
                  >
                    Effacer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Effacer tous les accords</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <CardDescription>
          Collez vos accords ici, séparés par des espaces (un groupe par ligne).
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Textarea */}
        <div className="relative flex-1">
          <Textarea
            id="chords-textarea"
            value={text}
            onChange={handleTextChange}
            placeholder={"Collez vos accords ici...\n\nExemple :\nC G Am F\nDm7 G7 Cmaj7\nEm C/E D/F# G"}
            className={cn(
              "min-h-[200px] h-full w-full resize-none font-mono text-sm leading-relaxed",
              "bg-slate-800/50 border-white/10",
              "focus:border-purple-500/50 focus:ring-purple-500/20",
              "placeholder:text-slate-500",
              isLoaded && "border-green-500/30 bg-green-500/5"
            )}
          />

          {/* Compteur en bas à droite */}
          {text.length > 0 && (
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground bg-slate-900/80 px-2 py-1 rounded">
              {stats.totalLines} lignes · {stats.totalChords} accords
            </div>
          )}
        </div>

        {/* Preview de validation en temps réel */}
        {validation.length > 0 && (
          <div className={cn(
            "rounded-lg p-3 space-y-2",
            "bg-slate-800/30 border border-white/5"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Aperçu des accords détectés</span>
              {stats.invalidChords > 0 && (
                <Badge
                  variant="outline"
                  className="gap-1 text-amber-400 border-amber-500/30 bg-amber-500/10"
                >
                  <AlertCircle className="h-3 w-3" />
                  {stats.invalidChords} non reconnu{stats.invalidChords > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
              {validation.map((line, lineIdx) => (
                <div key={lineIdx} className="flex flex-wrap gap-1.5">
                  {line.chords.map((chord, chordIdx) => (
                    <Badge
                      key={`${lineIdx}-${chordIdx}`}
                      variant="outline"
                      className={cn(
                        "font-mono text-xs px-2 py-0.5 transition-colors",
                        chord.isValid
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30 line-through"
                      )}
                    >
                      {chord.token}
                    </Badge>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    onClick={handleLoad}
                    disabled={!text.trim()}
                    className={cn(
                      "flex-1 gap-2 h-11",
                      "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-500/90 hover:to-violet-500/90",
                      "shadow-lg shadow-purple-500/20",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    )}
                  >
                    <Upload className="h-4 w-4" />
                    {isLoaded ? "Recharger les accords" : "Charger les accords"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {text.trim()
                    ? `Charger ${stats.totalChords} accord(s) sur ${stats.totalLines} ligne(s)`
                    : "Entrez d'abord des accords"
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Message d'aide */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-purple-400/60" />
            <p>
              Astuce : Séparez les accords par des espaces. Accords slash supportés (ex: C/E, D/F#).
              {isLoaded && " Vous pouvez modifier les accords et recharger à tout moment."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChordsInput;

