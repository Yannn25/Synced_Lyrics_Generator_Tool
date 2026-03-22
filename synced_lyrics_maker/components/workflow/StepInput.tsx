"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, FileText, CheckCircle2, Zap, Wand2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "@/components/AudioPlayer";
import UnifiedInput from "@/components/UnifiedInput"; // Import du nouveau composant
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";
import { stepVariants, stepTransition } from "@/lib/animations";
import { UnifiedSong } from "@/types";

interface StepInputProps {
	audio: ReturnType<typeof useAudio>;
	songData: UnifiedSong;
	onSongDataChange: (data: UnifiedSong) => void;
	onContinue: () => void;
}

/**
 * StepInput - Étape 1 : Éditeur Unifié (ChordPro)
 *
 * Intègre maintenant UnifiedInput pour une expérience d'édition améliorée.
 */
export default function StepInput({
	audio,
	songData,
	onSongDataChange,
	onContinue,
}: StepInputProps) {
	const [isDragging, setIsDragging] = useState(false);

	// Validation pour continuer
	const isContentReady = songData?.content?.trim().length > 0;
	const canContinue = audio.isLoaded && isContentReady;

	// Gestion du Drag & Drop global sur l'étape
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		if (!audio.isLoaded) {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		// Évite le clignotement si on passe sur un enfant
		if (e.currentTarget.contains(e.relatedTarget as Node)) return;
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		
		const file = e.dataTransfer.files?.[0];
		if (file && file.type.startsWith('audio/') && !audio.isLoaded) {
			audio.loadAudio(file);
		}
	};

	return (
		<motion.div
			variants={stepVariants}
			initial="initial"
			animate="animate"
			exit="exit"
			transition={stepTransition}
			className="flex flex-col gap-6 h-full pb-8 relative"
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{/* Overlay de Drag & Drop */}
			<AnimatePresence>
				{isDragging && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md border-2 border-primary border-dashed rounded-xl flex flex-col items-center justify-center gap-6"
					>
						<div className="p-6 rounded-full bg-primary/10 animate-bounce">
							<Upload className="w-12 h-12 text-primary" />
						</div>
						<div className="text-center space-y-2">
							<h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
								Lâchez le fichier ici !
							</h3>
							<p className="text-muted-foreground">
								Votre audio sera automatiquement chargé
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-foreground">
						Éditeur & Source Audio
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Chargez un fichier audio et saisissez vos paroles avec accords.
					</p>
				</div>

				{/* Status Badges */}
				<div className="flex gap-2">
					<Badge
						variant={audio.isLoaded ? "default" : "outline"}
						className={cn(
							audio.isLoaded &&
								"bg-green-500/20 text-green-400 border-green-500/30"
						)}
					>
						<Music className="w-3 h-3 mr-1" />
						Audio
					</Badge>
					<Badge
						variant={isContentReady ? "default" : "outline"}
						className={cn(
							isContentReady &&
								"bg-blue-500/20 text-blue-400 border-blue-500/30"
						)}
					>
						<FileText className="w-3 h-3 mr-1" />
						Contenu
					</Badge>
				</div>
			</div>

			<div className="flex flex-col xl:flex-row gap-6">
				{/* Audio Player Card - Full width on mobile/tablet */}
				<div className="xl:hidden rounded-xl overflow-hidden glass shadow-lg">
					<AudioPlayer
						audio={audio}
						onSyncLine={() => {}}
						canSync={false}
					/>
				</div>
			</div>

			<div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-250px)] min-h-[600px]">
				{/* LEFT COLUMN: UNIFIED EDITOR (2/3 width) */}
				<div className="flex-[2] flex flex-col gap-4 min-h-0 bg-transparent">
					<UnifiedInput 
						value={songData.content}
						onChange={(content) => onSongDataChange({ ...songData, content })}
						metadata={songData}
						onMetadataChange={onSongDataChange}
						isAudioLoaded={audio.isLoaded}
					/>
				</div>

				{/* RIGHT COLUMN: AUDIO PLAYER (Desktop) & INSTRUCTIONS (1/3 width) */}
				<div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
					{/* Audio Player (Desktop only) */}
					<div className="hidden xl:block rounded-xl overflow-hidden glass shadow-lg shrink-0">
						<AudioPlayer
							audio={audio}
							onSyncLine={() => {}}
							canSync={false}
						/>
					</div>

					{/* Continue Button */}
					<Button
						size="lg"
						className={cn(
							"w-full transition-all duration-300 shrink-0",
							canContinue
								? "bg-primary hover:scale-[1.02] shadow-lg shadow-primary/20"
								: "opacity-50 cursor-not-allowed"
						)}
						disabled={!canContinue}
						onClick={onContinue}
					>
						Continuer vers la Synchro
					</Button>

					{/* Instructions / Tips */}
					<div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-muted-foreground space-y-3 shrink-0">
						<h4 className="font-semibold text-foreground flex items-center gap-2">
							<CheckCircle2 className="w-3.5 h-3.5 text-primary" />
							Format ChordPro Supporté
						</h4>
						<div className="space-y-2">
							<div className="p-2 bg-slate-950/50 rounded border border-white/5">
								<code className="text-purple-300">[C]</code> <span className="text-slate-400">Amazing</span> <code className="text-purple-300">[G]</code> <span className="text-slate-400">Grace</span>
							</div>
							<p>Les accords doivent être entre crochets, placés juste devant la syllabe concernée.</p>
						</div>
						
						<h4 className="font-semibold text-foreground mt-4 flex items-center gap-2">
							<Zap className="w-3.5 h-3.5 text-yellow-500" />
							Fonctionnalités
						</h4>
						<ul className="list-disc list-inside space-y-1 ml-1 opacity-80">
							<li><strong className="text-white">Auto-Scan</strong> : Détecte automatiquement Titre, BPM et Key dans le texte.</li>
							<li><strong className="text-white">Insertion Rapide</strong> : Utilisez la barre d'outils pour ajouter des accords ou sections.</li>
							<li><strong className="text-white">Notation</strong> : Choisissez entre Anglais (C), Latin (Do) ou Nashville (1).</li>
						</ul>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
