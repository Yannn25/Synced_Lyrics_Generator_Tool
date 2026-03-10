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

// Props for the LyricsList component
export type LyricsListProps = {
    lyrics: LyricLine[]; // Array of lyric lines to display
    selectedLineId: number | null; // ID of the lyric line currently selected
    onSelectLine: (lineId: number) => void; // Function to call when a lyric line is selected
    onClearTimestamp: (lineId: number) => void; // Function to call when a lyric line's timestamp is cleared
    onUpdateTimestamp: (lineId: number, timestamp: number | null) => void; // Function to call when a lyric line's timestamp is updated
    onUpdateLineText: (lineId: number, newText: string) => void; // Function to call when a lyric line text is updated
    onDeleteLine: (lineId: number) => void; // Function to call when a lyric line is deleted
}

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
    activeLine: LyricLine | null;
    previousLine: LyricLine | null;
    nextLine: LyricLine | null;
    progress: number;
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
  id: string;            // UUID
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
  meta?: {
    key?: string;            // Tonalité globale (ex: "Cm")
    timeSignature?: string;  // Ex: "4/4"
  };
}

// ═══════════════════════════════════════════════════════
// TYPE GÉNÉRIQUE POUR LA SYNCHRONISATION
// ═══════════════════════════════════════════════════════

// Interface commune pour lyrics ET chords (mutualisation)
// Note: Migration vers string ID recommandée pour LyricLine aussi
export interface SyncableItem {
  id: string | number;
  timestamp: number | null;
  isSynced: boolean;
  isEditing: boolean;
}

// ═══════════════════════════════════════════════════════
// MODES D'AFFICHAGE
// ═══════════════════════════════════════════════════════

export type ViewMode = 'lyrics' | 'chords' | 'both';

export type SyncMode = 'lyrics' | 'chords';

export type ChordNotation = 'english' | 'latin' | 'numerical';

// ═══════════════════════════════════════════════════════
// PROPS DES COMPOSANTS CHORDS
// ═══════════════════════════════════════════════════════

export interface ChordsListProps {
  chords: ChordLine[];
  selectedChordId: string | number | null;
  onSelectChord: (chordId: string | number) => void;
  onClearTimestamp: (chordId: string | number) => void;
  onUpdateTimestamp: (chordId: string | number, timestamp: number | null) => void;
  onUpdateChordText: (chordId: string | number, newChords: ChordSymbol[]) => void;
  onDeleteChord: (chordId: string | number) => void;
  notation: ChordNotation; // Système de notation à afficher
}

// ═══════════════════════════════════════════════════════
// COMBINED VIEW
// ═══════════════════════════════════════════════════════

export interface CombinedViewProps {
  lyrics: LyricLine[];
  chords: ChordLine[];
  onSync: (id: string | number, time: number) => void;
  notation: ChordNotation;
}
