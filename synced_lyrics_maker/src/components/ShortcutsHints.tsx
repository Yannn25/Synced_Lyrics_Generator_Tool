'use client';

import React from 'react';
import { Keyboard, MousePointerClick } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShortcutsHintProps {
  compact?: boolean;
}

/**
 * ShortcutsHint - Affiche les raccourcis clavier disponibles
 *
 * Peut être affiché en mode compact (icône + tooltip) ou complet.
 */
const ShortcutsHint: React.FC<ShortcutsHintProps> = ({ compact = true }) => {

  const shortcuts = [
    { key: "Entrée", action: "Synchroniser la ligne sélectionnée", icon: Keyboard },
    { key: "Clic", action: "Sélectionner une ligne", icon: MousePointerClick },
  ];

  // Mode compact : juste une icône avec tooltip
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Keyboard className="h-4 w-4" />
              <span className="sr-only">Raccourcis clavier</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="max-w-xs">
            <div className="space-y-2 py-1">
              <p className="font-semibold text-sm">Raccourcis clavier</p>
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] font-mono">
                    {shortcut.key}
                  </kbd>
                  <span className="text-muted-foreground">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Mode complet : carte avec liste
  return (
    <div className={cn(
      "p-4 rounded-xl border",
      "bg-slate-800/30 border-white/10 backdrop-blur-sm"
    )}>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Keyboard className="h-4 w-4 text-primary" />
        Raccourcis clavier
      </h3>
      <ul className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <li key={index} className="flex items-center gap-3 text-sm">
            <kbd className="px-2 py-1 bg-slate-700/50 border border-white/10 rounded text-xs font-mono text-foreground">
              {shortcut.key}
            </kbd>
            <span className="text-muted-foreground">{shortcut.action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShortcutsHint;