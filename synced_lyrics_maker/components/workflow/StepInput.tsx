"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "@/components/AudioPlayer";
import LyricsInput from "@/components/LyricsInput";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";
import { stepVariants, stepTransition, cardVariants } from "@/lib/animations";

interface StepInputProps {
  audio: ReturnType<typeof useAudio>;
  onLoadLyrics: (text: string) => void;
  onContinue: () => void;
  lyricsLoaded: boolean;
}

/**
 * StepInput - Conteneur pour l'étape 1 du workflow
 *
 * Implémente l'effet "Focus" :
 * - Si audio non chargé: Affiche uniquement le AudioPlayer en grand au centre.
 * - Si audio chargé: AudioPlayer passe en haut (compact) et LyricsInput apparaît.
 */
export default function StepInput({
  audio,
  onLoadLyrics,
  onContinue,
  lyricsLoaded,
}: StepInputProps) {
  const audioReady = audio.isLoaded;
  const canContinue = audioReady && lyricsLoaded;

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={stepTransition}
      className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-32"
    >
      {/* Header caché si pas d'audio (focus mode) */}
      <AnimatePresence>
        {audioReady && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Charger vos fichiers
              </h2>
              <p className="text-muted-foreground mt-1">
                L'audio est prêt, ajoutez maintenant les paroles.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="gap-1.5 bg-green-500/20 text-green-400 border-green-500/30"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Audio
              </Badge>
              <Badge
                variant={lyricsLoaded ? "default" : "outline"}
                className={cn(
                  "gap-1.5 transition-all duration-300",
                  lyricsLoaded &&
                    "bg-green-500/20 text-green-400 border-green-500/30"
                )}
              >
                {lyricsLoaded ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                Lyrics
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Area */}
      <div
        className={cn(
          "flex flex-col w-full transition-all duration-700 ease-in-out",
          audioReady
            ? "gap-8"
            : "min-h-[60vh] justify-center"
        )}
      >
        {/* Section Audio */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full shrink-0"
        >
          <AudioPlayer audio={audio} onSyncLine={() => {}} canSync={false} />
        </motion.div>

        {/* Section Lyrics (Reveal animation) */}
        <AnimatePresence>
          {audioReady && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full"
            >
              <LyricsInput onLoadLyrics={onLoadLyrics} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section de progression */}
      <AnimatePresence>
        {audioReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            variants={cardVariants}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all duration-300 backdrop-blur-lg fixed bottom-8 left-1/2 -translate-x-1/2 z-50 shadow-2xl max-w-xl w-[calc(100%-2rem)]",
              canContinue
                ? "border-green-500/30 bg-green-950/40"
                : "border-white/10 bg-slate-900/80"
            )}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                {canContinue
                  ? "Prêt à synchroniser !"
                  : "En attente des paroles..."}
              </span>
              <span className="text-xs text-muted-foreground">
                {!lyricsLoaded &&
                  "Copiez vos paroles ci-dessus pour continuer"}
                {canContinue && "Passez à l'étape suivante"}
              </span>
            </div>

            <Button
              onClick={onContinue}
              disabled={!canContinue}
              className={cn(
                "gap-2 transition-all duration-300",
                canContinue &&
                  "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20"
              )}
            >
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
