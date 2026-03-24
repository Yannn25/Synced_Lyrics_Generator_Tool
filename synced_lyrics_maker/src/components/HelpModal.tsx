'use client'

import React from "react";
import { HelpCircle, Keyboard, MousePointerClick, CornerDownLeft } from "lucide-react";

// Composants shadcn/ui
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * HelpModal - Modal d'aide avec les raccourcis clavier
 *
 * Utilise le Dialog de shadcn/ui pour une meilleure accessibilité.
 */
const HelpModal: React.FC = () => {
    const shortcuts = [
        {
            key: "Entrée",
            action: "Synchroniser la ligne sélectionnée",
            icon: CornerDownLeft,
            keyClass: "bg-green-500/20 text-green-400 border-green-500/30"
        },
        {
            key: "Espace",
            action: "Play / Pause l'audio",
            icon: Keyboard,
            keyClass: "bg-blue-500/20 text-blue-400 border-blue-500/30"
        },
        {
            key: "Clic",
            action: "Sélectionner une ligne",
            icon: MousePointerClick,
            keyClass: "bg-purple-500/20 text-purple-400 border-purple-500/30"
        },
        {
            key: "Double-clic",
            action: "Éditer le texte d'une ligne",
            icon: MousePointerClick,
            keyClass: "bg-orange-500/20 text-orange-400 border-orange-500/30"
        },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "fixed top-4 right-4 z-50",
                        "rounded-full",
                        "bg-slate-800/60 border border-white/10",
                        "hover:bg-slate-700/60 hover:border-primary/40",
                        "text-slate-400 hover:text-primary",
                        "transition-all duration-200"
                    )}
                >
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">Aide</span>
                </Button>
            </DialogTrigger>

            <DialogContent className={cn(
                "modal-fullscreen-mobile sm:max-w-md max-h-[90vh] overflow-y-auto",
                // Effet Glass
                "bg-slate-900/90 backdrop-blur-xl",
                "border border-white/10",
                "shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            )}>
                {/* Reflet glass subtil en haut */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <Keyboard className="h-5 w-5 text-primary" />
                        Raccourcis clavier
                    </DialogTitle>
                    <DialogDescription>
                        Utilisez ces raccourcis pour synchroniser plus rapidement
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                    {shortcuts.map((shortcut, index) => {
                        const Icon = shortcut.icon;
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-lg",
                                    "bg-slate-800/30 border border-white/5",
                                    "transition-all duration-200 hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-[100px]">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <kbd className={cn(
                                        "px-2.5 py-1 rounded border text-xs font-mono font-semibold",
                                        shortcut.keyClass
                                    )}>
                                        {shortcut.key}
                                    </kbd>
                                </div>
                                <span className="text-sm text-foreground/80">
                                    {shortcut.action}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-muted-foreground text-center">
                        Appuyez sur <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Esc</kbd> pour fermer
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default HelpModal;