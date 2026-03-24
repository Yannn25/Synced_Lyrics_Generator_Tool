"use client";

import React from "react";
import { HelpCircle, Keyboard, Info } from "lucide-react";
import { WorkflowStep } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepHelpModalProps {
  step: WorkflowStep;
  className?: string;
}

const HELP_CONTENT: Record<WorkflowStep, { title: string; description: string; hints: string[] }> = {
  1: {
    title: "Aide - Etape Input",
    description: "Charge ton audio puis prepare le texte ChordPro avant la synchro.",
    hints: [
      "Ajoute les accords entre crochets: [C], [Am], [G/B].",
      "Renseigne BPM, signature et tonalite dans la barre metadata.",
      "Les boutons Insert ajoutent sections et accords a la position du curseur.",
    ],
  },
  2: {
    title: "Aide - Etape Sync",
    description: "Synchronise les lignes avec l'audio pour preparer l'export.",
    hints: [
      "Espace: lecture/pause audio.",
      "Entree: synchronise la ligne selectionnee.",
      "La selection passe automatiquement a la prochaine ligne non synchronisee.",
    ],
  },
  3: {
    title: "Aide - Etape Export",
    description: "Verifie les stats puis telecharge le format cible.",
    hints: [
      "JSON exporte le format unifie avec meta + lines.",
      "LRC exporte uniquement les lignes synchronisees.",
      "Le nom de fichier utilise la base du fichier audio upload.",
    ],
  },
};

export default function StepHelpModal({ step, className }: StepHelpModalProps) {
  const content = HELP_CONTENT[step];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <HelpCircle className="h-4 w-4" />
          Aide
        </Button>
      </DialogTrigger>

      <DialogContent className="modal-fullscreen-mobile sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-primary" />
            {content.title}
          </DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {content.hints.map((hint) => (
            <div key={hint} className="flex items-start gap-2 rounded-md border border-white/10 bg-slate-900/30 p-3 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{hint}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

