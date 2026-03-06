'use client'

import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, Info } from "lucide-react";

// Composants shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LyricsInputProps {
  onLoadLyrics: (text: string) => void;
}

const LyricsInput: React.FC<LyricsInputProps> = ({ onLoadLyrics }) => {
  const [text, setText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  // Compte le nombre de lignes non vides
  const countLines = (content: string): number => {
    return content.split('\n').filter(line => line.trim()).length;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    // Réinitialiser l'état "loaded" si le texte change après chargement
    if (isLoaded) {
      setIsLoaded(false);
    }
  };

  const handleLoad = () => {
    if (text.trim()) {
      const lines = countLines(text);
      onLoadLyrics(text);
      setLineCount(lines);
      setIsLoaded(true);
      // On ne vide PAS le textarea pour permettre de revenir dessus
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
              <FileText className="h-5 w-5 text-primary" />
              Paroles
            </CardTitle>

            {/* Badge de confirmation quand chargé */}
            {isLoaded && (
              <Badge
                variant="outline"
                className="gap-1 bg-green-500/10 text-green-400 border-green-500/30 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <CheckCircle2 className="h-3 w-3" />
                {lineCount} lignes chargées
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
                <TooltipContent>Effacer tout le texte</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <CardDescription>
          Collez vos paroles ici, une ligne par phrase.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Textarea avec compteur de lignes */}
        <div className="relative flex-1">
          <Textarea
            id="lyrics-textarea"
            value={text}
            onChange={handleTextChange}
            placeholder="Collez vos paroles ici...

Exemple :
Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost, but now I'm found
Was blind, but now I see"
            className={cn(
              "min-h-[280px] h-full w-full resize-none font-mono text-sm leading-relaxed",
              "bg-slate-800/50 border-white/10",
              "focus:border-primary/50 focus:ring-primary/20",
              "placeholder:text-slate-500",
              // Indicateur visuel si chargé
              isLoaded && "border-green-500/30 bg-green-500/5"
            )}
          />

          {/* Compteur de caractères/lignes en bas à droite */}
          {text.length > 0 && (
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground bg-slate-900/80 px-2 py-1 rounded">
              {countLines(text)} lignes · {text.length} caractères
            </div>
          )}
        </div>

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
                      "bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90",
                      "shadow-lg shadow-primary/20",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    )}
                  >
                    <Upload className="h-4 w-4" />
                    {isLoaded ? "Recharger les paroles" : "Charger les paroles"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {text.trim()
                    ? `Charger ${countLines(text)} ligne(s) de paroles`
                    : "Entrez d'abord des paroles"
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Message d'aide avec icône */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
            <p>
              Astuce : Assurez-vous d'avoir une ligne par phrase musicale pour une meilleure synchronisation.
              {isLoaded && " Vous pouvez modifier le texte et recharger à tout moment."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LyricsInput;