// ═══════════════════════════════════════════════════════
// TYPES POUR LES LYRICS (EXISTANTS)
// ═══════════════════════════════════════════════════════

// Interface for a single line of lyric
export interface LyricLine {
  id: number;
  text: string; // Text of the lyric line
  timestamp: number | null; // Timestamp of the lyric line in milliseconds (optional can be null if not synced)
  isSynced: boolean; // Whether the lyric line is synced with the audio
  isEditing: boolean; // Whether the lyric line is currently being edited
}


// Interface for the JSON format who will be exported
export interface SyncedLyricItem {
    time: number; // Timestamp of the lyric line in milliseconds
    text: string; // Text of the lyric line
}

// Type for the JSON file containing the lyric lines
export type SyncedLyricsJSON = SyncedLyricItem[];

// Type for the LRC format who will be exported(simple string with a specific format)
export type LRCFormat = string;



export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
}

// Props for the AudioPlayer component
export type AudioPlayerProps = {
    audioFile: File | null; // Audio file to play
    onAudioLoad: (file: File) => void; // Function to call when the audio file is loaded
    onAudioPlay: () => void; // Function to call when the audio is played
    onAudioPause: () => void; // Function to call when the audio is paused
    onAudioSeek: (time: number) => void; // Function to call when the audio is seeked
    onAudioTimeUpdate: (time: number) => void; // Function to call when the audio time is updated
}

export interface CurrentLyricDisplayProps {
    activeLine: LyricLine | UnifiedLine | null;
    previousLine: LyricLine | UnifiedLine | null;
    nextLine: LyricLine | UnifiedLine | null;
    progress: number;
    showChords?: boolean;
}

// Props for the multiple step workflow
export type WorkflowStep = 1 | 2 | 3;

export interface WorkflowState {
    currentStep: WorkflowStep;
    canGoToStep2: boolean; // Audio  AND lyrics loaded
    canGoToStep3: boolean; // At least one line synced
}

export interface StepIndicatorProps {
    currentStep: WorkflowStep;
    canGoToStep: (step: WorkflowStep) => boolean;
    onStepClick: (step: WorkflowStep) => void;
}

// ═══════════════════════════════════════════════════════
// TYPES POUR LES ACCORDS (MODÈLE AVANCÉ)
// ═══════════════════════════════════════════════════════

export interface ChordSymbol {
  label: string;         // "C/E", "Gmaj7", "F#m7b5"
  root: string;          // "C", "G#", "Bb" (notation anglaise)
  quality: string;       // "", "m", "maj7", "7", "m7", "dim", "aug", "sus2", "sus4", "add9"
  bass?: string;         // "E" dans C/E (slash chords)
  extensions?: string[]; // ["9", "11", "13", "b9", "#11"]
  alterations?: string[];// ["b5", "#5"]
  hint?: string;         // Annotation pédagogique optionnelle
}

export interface ChordLine {
  id: number;
  timestamp: number | null; // Temps de début de la ligne d'accords
  chords: ChordSymbol[];    // Liste des accords sur cette ligne
  lyricLineId?: string;     // Lien vers une ligne de paroles
  section?: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
  isSynced: boolean;     // Propriété pour SyncableItem
  isEditing: boolean;    // Propriété pour SyncableItem
}

// ═══════════════════════════════════════════════════════
// FORMAT D'EXPORT JSON (LYRICS + CHORDS)
// ═══════════════════════════════════════════════════════

export interface ExportLyricLine {
  time: number;
  text: string;
}

export interface ExportChordSymbol {
  label: string;
  root: string;
  quality: string;
  bass?: string;
  extensions?: string[];
  alterations?: string[];
}

export interface ExportChordLine {
  time: number;
  chords: ExportChordSymbol[];
}

export interface ExportData {
  lyrics: ExportLyricLine[];
  chords?: ExportChordLine[];
  meta?: ExportMetadata;
}

export interface ExportMetadata {
  key?: string;            // Tonalite globale (ex: "Cm")
  bpm?: number;
  timeSignature?: string;  // Ex: "4/4"
  about?: string;
}

export interface UnifiedExportLine {
  id: number;
  originalText: string;
  strippedText: string;
  chords: ChordPosition[];
  section?: string;
  timestamp: number | null;
  isSynced: boolean;
  isInstrumental?: boolean;
}

export interface UnifiedExportData {
  meta?: ExportMetadata;
  lines: UnifiedExportLine[];
}



// ═══════════════════════════════════════════════════════
// MODES D'AFFICHAGE
// ═══════════════════════════════════════════════════════

export type ViewMode = 'lyrics' | 'chords' | 'both';

export type SyncMode = 'lyrics' | 'chords';

export type ChordNotation = 'english' | 'latin' | 'numerical';




// ═══════════════════════════════════════════════════════
// MODELE UNIFIE (CHORDPRO) - NOUVEAU
// ═══════════════════════════════════════════════════════

// Interface pour le format unifié
export interface UnifiedSong {
    title?: string;        // Titre du chant
    about?: string;        // A propos du chant
    bpm: number;
    timeSignature: string; // Ex: "4/4"
    key: string;           // Ex: "C"
    content: string;       // Le texte brut format ChordPro
}

export interface ChordPosition {
    symbol: string;
    index: number; // Position dans le strippedText
}

export interface UnifiedLine {
    id: number;
    originalText: string; // La ligne complète avec balises [C]
    strippedText: string; // Le texte sans les accords pour l'affichage Clean (vide pour instrumentales)
    chords: ChordPosition[];
    section?: string;     // "Verse", "Chorus", "Intro", ...
    timestamp: number | null;
    isSynced: boolean;
    isInstrumental?: boolean; // true si la ligne ne contient que des accords (strippedText vide)
}
