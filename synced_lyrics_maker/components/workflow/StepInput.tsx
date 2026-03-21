"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Music, FileText, CheckCircle2, Zap, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AudioPlayer from "@/components/AudioPlayer";
import { useAudio } from "@/hooks/useAudio";
import { cn } from "@/lib/utils";
import { stepVariants, stepTransition } from "@/lib/animations";
import { UnifiedSong } from "@/types";
import { KEY_OPTIONS } from "@/utils/chordNotation";
import { extractMetadata, parseChordPro } from "@/utils/parseChordPro";

// Time signature options
const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8", "12/8"];

// Common chord progressions or sections to insert
const QUICK_INSERTS = [
	{ label: "{Verse}", value: "\n{Verse}\n" },
	{ label: "{Chorus}", value: "\n{Chorus}\n" },
	{ label: "[C]", value: "[C]" },
	{ label: "[G]", value: "[G]" },
	{ label: "[Am]", value: "[Am]" },
	{ label: "[F]", value: "[F]" },
];

interface StepInputProps {
	audio: ReturnType<typeof useAudio>;
	songData: UnifiedSong;
	onSongDataChange: (data: UnifiedSong) => void;
	onContinue: () => void;
}

/**
 * StepInput - Étape 1 : Éditeur Unifié (ChordPro)
 *
 * Permet de charger l'audio et de saisir les paroles/accords au format ChordPro.
 * Comprend :
 * 1. Bloc Métadonnées (BPM, Key, TimeSig)
 * 2. Éditeur Texte Principal
 * 3. Outils d'aide (Détection d'accords, Insertions rapides)
 */
export default function StepInput({
	audio,
	songData,
	onSongDataChange,
	onContinue,
}: StepInputProps) {
	// 1. Détection des accords présents dans le texte
	const detectedChords = useMemo(() => {
		if (!songData?.content) return [];
		try {
			const lines = parseChordPro(songData.content);
			const chords = new Set<string>();
			lines.forEach((line) => {
				line.chords.forEach((c) => chords.add(c.symbol));
			});
			return Array.from(chords).sort();
		} catch (e) {
			return [];
		}
	}, [songData?.content]);

	// 2. Gestion des champs
	const updateField = (field: keyof UnifiedSong, value: any) => {
		onSongDataChange({ ...songData, [field]: value });
	};

	// 3. Scan automatique des métadonnées depuis le texte
	const handleAutoScan = () => {
		const extracted = extractMetadata(songData.content);
		// On ne fusionne que si des valeurs sont trouvées
		const newMeta = { ...songData };
		if (extracted.title) newMeta.title = extracted.title;
		if (extracted.key) newMeta.key = extracted.key;
		if (extracted.bpm) newMeta.bpm = extracted.bpm;
		if (extracted.timeSignature) newMeta.timeSignature = extracted.timeSignature;
		// ... autres champs si nécessaire
		onSongDataChange(newMeta);
	};

	// 4. Insertion de texte au curseur
	const insertAtCursor = (textToInsert: string) => {
		const textarea = document.getElementById(
			"chordpro-editor"
		) as HTMLTextAreaElement;
		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const text = songData.content;
			const newText =
				text.substring(0, start) + textToInsert + text.substring(end);
			updateField("content", newText);

			// Refocus et replacement du curseur
			requestAnimationFrame(() => {
				textarea.focus();
				textarea.setSelectionRange(
					start + textToInsert.length,
					start + textToInsert.length
				);
			});
		} else {
			updateField("content", songData.content + textToInsert);
		}
	};

	// 5. Validation pour continuer
	const isContentReady = songData?.content?.trim().length > 0;
	const canContinue = audio.isLoaded && isContentReady;

	return (
		<motion.div
			variants={stepVariants}
			initial="initial"
			animate="animate"
			exit="exit"
			transition={stepTransition}
			className="flex flex-col gap-6 h-full pb-8"
		>
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
				{/* LEFT COLUMN: EDITOR & METADATA (2/3 width on desktop) */}
				<div className="flex-1 flex flex-col gap-4">
					{/* 1. Bloc Métadonnées (Haut) */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/10">
						<div className="space-y-2 col-span-2 md:col-span-1">
							<Label
								htmlFor="bpm"
								className="text-xs text-muted-foreground"
							>
								BPM (Tempo)
							</Label>
							<div className="relative">
								<Input
									id="bpm"
									type="number"
									placeholder="120"
									className="bg-slate-950/50 border-white/10 pl-8"
									value={songData.bpm || ""}
									onChange={(e) =>
										updateField(
											"bpm",
											parseInt(e.target.value) || 0
										)
									}
								/>
								<Zap className="w-3.5 h-3.5 absolute left-3 top-3 text-yellow-500/70" />
							</div>
						</div>

						<div className="space-y-2 col-span-2 md:col-span-1">
							<Label className="text-xs text-muted-foreground">
								Signature
							</Label>
							<Select
								value={songData.timeSignature}
								onValueChange={(v) =>
									updateField("timeSignature", v)
								}
							>
								<SelectTrigger className="bg-slate-950/50 border-white/10">
									<SelectValue placeholder="4/4" />
								</SelectTrigger>
								<SelectContent>
									{TIME_SIGNATURES.map((sig) => (
										<SelectItem key={sig} value={sig}>
											{sig}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2 col-span-2 md:col-span-1">
							<Label className="text-xs text-muted-foreground">
								Tonalité (Key)
							</Label>
							<Select
								value={songData.key}
								onValueChange={(v) => updateField("key", v)}
							>
								<SelectTrigger className="bg-slate-950/50 border-white/10">
									<SelectValue placeholder="C" />
								</SelectTrigger>
								<SelectContent>
									{KEY_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="col-span-2 md:col-span-1 flex items-end">
							<Button
								variant="outline"
								size="sm"
								onClick={handleAutoScan}
								className="w-full bg-slate-800/50 border-white/10 hover:bg-slate-800 text-xs"
								title="Scanner le texte pour extraire les métadonnées ({bpm}, {key}...)"
							>
								<Wand2 className="w-3.5 h-3.5 mr-2 text-primary" />
								Auto-Scan
							</Button>
						</div>
					</div>

					{/* 2. Bloc Éditeur (Centre) */}
					<div className="flex-1 relative group">
						<Textarea
							id="chordpro-editor"
							className="min-h-[500px] font-mono text-sm leading-relaxed bg-slate-950/30 border-white/10 resize-none p-6"
							placeholder={`{Intro}
[C]Amazing [G]Grace, how [Am]sweet the [F]sound

{Verse 1}
[C]Amazing [G]Grace, how [Am]sweet the [F]sound
That [C]saved a [G]wretch like [C]me`}
							value={songData.content}
							onChange={(e) => updateField("content", e.target.value)}
						/>
					</div>

					{/* 3. Bloc "Accords & Aide" (Bas) */}
					<div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 space-y-4">
						{/* Detected Chords */}
						<div className="flex items-center gap-2 flex-wrap min-h-[32px]">
							<span className="text-xs font-semibold text-muted-foreground mr-2">
								Détectés:
							</span>
							{detectedChords.length > 0 ? (
								detectedChords.map((chord) => (
									<Badge
										key={chord}
										variant="secondary"
										className="font-mono text-xs bg-purple-500/10 text-purple-300 border-purple-500/20"
									>
										{chord}
									</Badge>
								))
							) : (
								<span className="text-xs italic text-slate-600">
									Aucun accord détecté (format [C])
								</span>
							)}
						</div>

						<div className="h-px bg-white/5 w-full" />

						{/* Quick Inserts */}
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-xs font-semibold text-muted-foreground mr-2">
								Insérer:
							</span>
							{QUICK_INSERTS.map((item) => (
								<Button
									key={item.label}
									variant="ghost"
									size="sm"
									className="h-7 text-xs bg-slate-800/50 border border-white/5 hover:bg-slate-700"
									onClick={() => insertAtCursor(item.value)}
								>
									{item.label}
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* RIGHT COLUMN: AUDIO PLAYER & INSTRUCTIONS (1/3 width) */}
				<div className="w-full xl:w-80 flex flex-col gap-4">
					{/* Audio Player Card */}
					<div className="rounded-xl overflow-hidden glass shadow-lg">
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
							"w-full transition-all duration-300",
							canContinue
								? "bg-gradient-to-r from-primary to-purple-600 hover:scale-[1.02] shadow-lg shadow-primary/20"
								: "opacity-50 cursor-not-allowed"
						)}
						disabled={!canContinue}
						onClick={onContinue}
					>
						Continuer vers la Synchro
					</Button>

					{/* Instructions / Tips */}
					<div className="p-4 rounded-xl bg-slate-900/20 border border-white/5 text-xs text-muted-foreground space-y-2">
						<h4 className="font-semibold text-foreground flex items-center gap-2">
							<CheckCircle2 className="w-3.5 h-3.5 text-primary" />
							Format ChordPro
						</h4>
						<ul className="list-disc list-inside space-y-1 ml-1 opacity-80">
							<li>Utilisez <code>[Accord]</code> devant le mot.</li>
							<li>Utilisez <code>{`{Section}`}</code> pour structurer.</li>
							<li>Le BPM peut être détecté depuis les tags <code>{`{bpm: 120}`}</code>.</li>
						</ul>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
