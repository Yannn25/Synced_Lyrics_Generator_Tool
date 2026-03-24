import { ChordSymbol, ChordNotation } from '@/types';

// ═══════════════════════════════════════════════════════
// TABLES CHROMATIQUES
// ═══════════════════════════════════════════════════════

/**
 * Index chromatique (0–11) pour chaque note anglaise.
 * C = 0 … B = 11.  Les enharmoniques pointent vers le même index.
 */
const ENGLISH_TO_SEMITONE: Record<string, number> = {
  'C': 0,  'C#': 1,  'Db': 1,
  'D': 2,  'D#': 3,  'Eb': 3,
  'E': 4,  'Fb': 4,  'E#': 5,
  'F': 5,  'F#': 6,  'Gb': 6,
  'G': 7,  'G#': 8,  'Ab': 8,
  'A': 9,  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0,
};

/** Noms anglais préférés – index 0-11, version dièses */
const SEMITONE_TO_ENGLISH_SHARP: string[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
];

/** Noms anglais préférés – index 0-11, version bémols */
const SEMITONE_TO_ENGLISH_FLAT: string[] = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
];

// ═══════════════════════════════════════════════════════
// MAPPING LATIN ↔ ANGLAIS
// ═══════════════════════════════════════════════════════

/**
 * Index chromatique pour chaque note latine (avec altérations).
 * Accepte les formes : Do, Do#, Réb, Ré♯, Sib, Sol♭, etc.
 */
const LATIN_TO_SEMITONE: Record<string, number> = {
  'Do': 0,   'Do#': 1,   'Do♯': 1,  'Réb': 1,  'Ré♭': 1,  'Reb': 1,
  'Ré': 2,   'Re': 2,    'Ré#': 3,  'Ré♯': 3,  'Re#': 3,  'Mib': 3,  'Mi♭': 3,
  'Mi': 4,   'Fab': 4,   'Fa♭': 4,  'Mi#': 5,  'Mi♯': 5,
  'Fa': 5,   'Fa#': 6,   'Fa♯': 6,  'Solb': 6, 'Sol♭': 6,
  'Sol': 7,  'Sol#': 8,  'Sol♯': 8, 'Lab': 8,  'La♭': 8,
  'La': 9,   'La#': 10,  'La♯': 10, 'Sib': 10, 'Si♭': 10,
  'Si': 11,  'Dob': 11,  'Do♭': 11, 'Si#': 0,  'Si♯': 0,
};

/** Noms latins préférés – version dièses */
const SEMITONE_TO_LATIN_SHARP: string[] = [
  'Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si',
];

/** Noms latins préférés – version bémols */
const SEMITONE_TO_LATIN_FLAT: string[] = [
  'Do', 'Réb', 'Ré', 'Mib', 'Mi', 'Fa', 'Solb', 'Sol', 'Lab', 'La', 'Sib', 'Si',
];

// ═══════════════════════════════════════════════════════
// NASHVILLE NUMBER SYSTEM
// ═══════════════════════════════════════════════════════

/**
 * Mapping demi-ton relatif → label Nashville.
 * Chaque demi-ton (0-11) est associé au degré le plus proche
 * avec une altération éventuelle (b ou #).
 *
 * Convention Nashville classique :
 *   0  → 1       (unisson)
 *   1  → ♭2
 *   2  → 2
 *   3  → ♭3
 *   4  → 3
 *   5  → 4
 *   6  → ♯4 / ♭5  (on préfère ♯4 car plus courant en pop/rock)
 *   7  → 5
 *   8  → ♭6
 *   9  → 6
 *   10 → ♭7
 *   11 → 7
 */
const SEMITONE_OFFSET_TO_DEGREE: string[] = [
  '1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7',
];

/**
 * Reverse : degré Nashville (string) → demi-tons relatifs.
 * Gère les enharmonies courantes (#4 = b5, b6 = #5, etc.)
 */
const DEGREE_TO_SEMITONE_OFFSET: Record<string, number> = {
  '1': 0,
  'b2': 1,  '#1': 1,
  '2': 2,
  'b3': 3,  '#2': 3,
  '3': 4,
  '4': 5,
  'b5': 6,  '#4': 6,
  '5': 7,
  'b6': 8,  '#5': 8,
  '6': 9,
  'b7': 10, '#6': 10,
  '7': 11,
};

// ═══════════════════════════════════════════════════════
// DÉTECTION DE PRÉFÉRENCE # OU b
// ═══════════════════════════════════════════════════════

/**
 * Tonalités qui utilisent conventionnellement des bémols.
 * Utilisé pour choisir entre l'affichage # ou b.
 */
const FLAT_KEYS = new Set([
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb',
  'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm',
]);

/**
 * Détermine si une tonalité devrait utiliser des bémols.
 * Fallback : si la root du chord contient un 'b', on préfère bémol.
 */
function prefersFlats(key?: string, chordRoot?: string): boolean {
  if (key && FLAT_KEYS.has(key)) return true;
  if (chordRoot?.includes('b')) return true;
  return false;
}

// ═══════════════════════════════════════════════════════
// UTILITAIRES PUBLICS
// ═══════════════════════════════════════════════════════

/**
 * Convertit une note anglaise (ex: "C#", "Bb") en index chromatique 0-11.
 * Retourne -1 si la note est invalide.
 */
export function rootToSemitone(root: string): number {
  return ENGLISH_TO_SEMITONE[root] ?? -1;
}

/**
 * Convertit un index chromatique 0-11 en note anglaise.
 */
export function semitoneToEnglishRoot(semitone: number, useFlats = false): string {
  const idx = ((semitone % 12) + 12) % 12;
  return useFlats ? SEMITONE_TO_ENGLISH_FLAT[idx] : SEMITONE_TO_ENGLISH_SHARP[idx];
}

/**
 * Convertit un index chromatique 0-11 en note latine.
 */
export function semitoneToLatinRoot(semitone: number, useFlats = false): string {
  const idx = ((semitone % 12) + 12) % 12;
  return useFlats ? SEMITONE_TO_LATIN_FLAT[idx] : SEMITONE_TO_LATIN_SHARP[idx];
}

/**
 * Retourne les 12 notes chromatiques dans la notation demandée.
 */
export function getChromaticScale(notation: ChordNotation, useFlats = false): string[] {
  switch (notation) {
    case 'english':
      return useFlats ? [...SEMITONE_TO_ENGLISH_FLAT] : [...SEMITONE_TO_ENGLISH_SHARP];
    case 'latin':
      return useFlats ? [...SEMITONE_TO_LATIN_FLAT] : [...SEMITONE_TO_LATIN_SHARP];
    case 'numerical':
      return [...SEMITONE_OFFSET_TO_DEGREE];
    default:
      return [...SEMITONE_TO_ENGLISH_SHARP];
  }
}

// ═══════════════════════════════════════════════════════
// NORMALISATION : TOUTE NOTATION → ANGLAIS
// ═══════════════════════════════════════════════════════

/**
 * Normalise une root depuis n'importe quelle notation vers l'anglais.
 *
 * @param root       La note à normaliser (ex: "Sol#", "b3", "C")
 * @param from       Notation source
 * @param key        Tonalité (requise si `from === 'numerical'`)
 * @returns          La note en notation anglaise (ex: "G#")
 */
export function normalizeRootToEnglish(
  root: string,
  from: ChordNotation,
  key?: string,
): string {
  switch (from) {
    case 'english': {
      // Déjà anglais — on valide juste
      return ENGLISH_TO_SEMITONE[root] !== undefined ? root : root;
    }
    case 'latin': {
      const semitone = LATIN_TO_SEMITONE[root];
      if (semitone === undefined) return root; // fallback inchangé
      const useFlats = root.includes('b') || root.includes('♭');
      return semitoneToEnglishRoot(semitone, useFlats);
    }
    case 'numerical': {
      if (!key) return root; // impossible sans tonalité
      const keySemitone = resolveKeySemitone(key);
      if (keySemitone === -1) return root;

      const offset = DEGREE_TO_SEMITONE_OFFSET[root];
      if (offset === undefined) return root;

      const targetSemitone = (keySemitone + offset) % 12;
      return semitoneToEnglishRoot(targetSemitone, prefersFlats(key));
    }
    default:
      return root;
  }
}

// ═══════════════════════════════════════════════════════
// TRADUCTION PRINCIPALE
// ═══════════════════════════════════════════════════════

/**
 * Traduit un `ChordSymbol` complet dans la notation cible.
 *
 * Le `ChordSymbol` stocke toujours sa `root` en anglais.
 * Cette fonction reconstruit le label entier :
 *   root traduite + quality + extensions + /bass traduit
 *
 * @param chord     L'accord à traduire
 * @param notation  Notation cible ('english' | 'latin' | 'numerical')
 * @param key       Tonalité (nécessaire pour 'numerical')
 * @returns         Le label traduit complet
 *
 * @example
 * translateChord({ label: "C/E", root: "C", quality: "", bass: "E" }, 'latin')
 * // → "Do/Mi"
 *
 * translateChord({ label: "Gmaj7", root: "G", quality: "maj7" }, 'numerical', 'C')
 * // → "5maj7"
 *
 * translateChord({ label: "F#m7", root: "F#", quality: "m7" }, 'latin')
 * // → "Fa#m7"
 *
 * translateChord({ label: "Bbdim", root: "Bb", quality: "dim" }, 'numerical', 'C')
 * // → "b7dim"
 */
export function translateChord(
  chord: ChordSymbol,
  notation: ChordNotation,
  key?: string,
): string {
  // Fastpath : si english → retourne le label original
  if (notation === 'english') return chord.label;

  const semitone = rootToSemitone(chord.root);
  if (semitone === -1) return chord.label; // root non reconnue → fallback

  const useFlats = prefersFlats(key, chord.root);

  // Traduit la root
  const translatedRoot = translateNoteName(semitone, notation, useFlats, key);

  // Traduit la bass si présente
  let translatedBass: string | undefined;
  if (chord.bass) {
    const bassSemitone = rootToSemitone(chord.bass);
    if (bassSemitone !== -1) {
      translatedBass = translateNoteName(bassSemitone, notation, useFlats, key);
    } else {
      translatedBass = chord.bass; // fallback
    }
  }

  // Reconstruit le label : root + quality + /bass
  let result = translatedRoot + chord.quality;
  if (translatedBass) {
    result += '/' + translatedBass;
  }

  return result;
}

// ═══════════════════════════════════════════════════════
// TRADUCTION DE NOTE INDIVIDUELLE
// ═══════════════════════════════════════════════════════

/**
 * Traduit un semiton en nom de note dans la notation cible.
 */
function translateNoteName(
  semitone: number,
  notation: ChordNotation,
  useFlats: boolean,
  key?: string,
): string {
  switch (notation) {
    case 'english':
      return semitoneToEnglishRoot(semitone, useFlats);

    case 'latin':
      return semitoneToLatinRoot(semitone, useFlats);

    case 'numerical': {
      if (!key) return semitoneToEnglishRoot(semitone, useFlats); // fallback
      const keySemitone = resolveKeySemitone(key);
      if (keySemitone === -1) return semitoneToEnglishRoot(semitone, useFlats);

      const offset = ((semitone - keySemitone) % 12 + 12) % 12;
      return SEMITONE_OFFSET_TO_DEGREE[offset];
    }

    default:
      return semitoneToEnglishRoot(semitone, useFlats);
  }
}

// ═══════════════════════════════════════════════════════
// TRADUCTION ENTRE DEUX NOTATIONS QUELCONQUES
// ═══════════════════════════════════════════════════════

/**
 * Traduit une root note depuis **n'importe quelle** notation vers
 * **n'importe quelle** autre notation.
 *
 * @param root   La note source (ex: "Sol#", "b3", "Bb")
 * @param from   Notation source
 * @param to     Notation cible
 * @param key    Tonalité (requise si from ou to === 'numerical')
 *
 * @example
 * translateRoot("Sol#", "latin", "english")       // → "G#"
 * translateRoot("G",    "english", "numerical", "C") // → "5"
 * translateRoot("b3",   "numerical", "latin", "C")   // → "Mib"
 * translateRoot("La",   "latin", "numerical", "F")   // → "3"
 */
export function translateRoot(
  root: string,
  from: ChordNotation,
  to: ChordNotation,
  key?: string,
): string {
  // Step 1 : Normalise vers semiton
  const semitone = rootToSemitoneFromAny(root, from, key);
  if (semitone === -1) return root; // non reconnu → retourne tel quel

  // Step 2 : Convertit semiton vers la notation cible
  const useFlats = prefersFlats(key, root);
  return translateNoteName(semitone, to, useFlats, key);
}

/**
 * Résout un semiton (0-11) depuis une root dans n'importe quelle notation.
 */
function rootToSemitoneFromAny(root: string, notation: ChordNotation, key?: string): number {
  switch (notation) {
    case 'english':
      return ENGLISH_TO_SEMITONE[root] ?? -1;

    case 'latin':
      return LATIN_TO_SEMITONE[root] ?? -1;

    case 'numerical': {
      if (!key) return -1;
      const keySemitone = resolveKeySemitone(key);
      if (keySemitone === -1) return -1;
      const offset = DEGREE_TO_SEMITONE_OFFSET[root];
      if (offset === undefined) return -1;
      return (keySemitone + offset) % 12;
    }

    default:
      return -1;
  }
}

// ═══════════════════════════════════════════════════════
// RÉSOLUTION DE TONALITÉ
// ═══════════════════════════════════════════════════════

/**
 * Résout la tonalité (key) en semiton.
 * Accepte : "C", "Am", "F#m", "Bb", "Mib", "Sol", etc.
 */
function resolveKeySemitone(key: string): number {
  // Enlève le 'm' / 'min' / 'minor' final pour trouver la root
  const cleaned = key.replace(/(minor|min|m)$/i, '');

  // Essaie anglais d'abord, puis latin
  const eng = ENGLISH_TO_SEMITONE[cleaned];
  if (eng !== undefined) return eng;

  const lat = LATIN_TO_SEMITONE[cleaned];
  if (lat !== undefined) return lat;

  return -1;
}

// ═══════════════════════════════════════════════════════
// LISTES DE TONALITÉS POUR L'UI
// ═══════════════════════════════════════════════════════

export interface KeyOption {
  value: string;    // Valeur stockée (anglais toujours, ex: "C", "Am")
  label: string;    // Label affiché (ex: "Do majeur", "La mineur")
  english: string;  // Label anglais (ex: "C major", "A minor")
}

/** Toutes les tonalités majeures + mineures courantes */
export const KEY_OPTIONS: KeyOption[] = [
  // Majeures
  { value: 'C',  label: 'Do majeur',   english: 'C major' },
  { value: 'Db', label: 'Réb majeur',  english: 'Db major' },
  { value: 'D',  label: 'Ré majeur',   english: 'D major' },
  { value: 'Eb', label: 'Mib majeur',  english: 'Eb major' },
  { value: 'E',  label: 'Mi majeur',   english: 'E major' },
  { value: 'F',  label: 'Fa majeur',   english: 'F major' },
  { value: 'F#', label: 'Fa# majeur',  english: 'F# major' },
  { value: 'G',  label: 'Sol majeur',  english: 'G major' },
  { value: 'Ab', label: 'Lab majeur',  english: 'Ab major' },
  { value: 'A',  label: 'La majeur',   english: 'A major' },
  { value: 'Bb', label: 'Sib majeur',  english: 'Bb major' },
  { value: 'B',  label: 'Si majeur',   english: 'B major' },
  // Mineures
  { value: 'Cm',  label: 'Do mineur',   english: 'C minor' },
  { value: 'C#m', label: 'Do# mineur',  english: 'C# minor' },
  { value: 'Dm',  label: 'Ré mineur',   english: 'D minor' },
  { value: 'Ebm', label: 'Mib mineur',  english: 'Eb minor' },
  { value: 'Em',  label: 'Mi mineur',   english: 'E minor' },
  { value: 'Fm',  label: 'Fa mineur',   english: 'F minor' },
  { value: 'F#m', label: 'Fa# mineur',  english: 'F# minor' },
  { value: 'Gm',  label: 'Sol mineur',  english: 'G minor' },
  { value: 'G#m', label: 'Sol# mineur', english: 'G# minor' },
  { value: 'Am',  label: 'La mineur',   english: 'A minor' },
  { value: 'Bbm', label: 'Sib mineur',  english: 'Bb minor' },
  { value: 'Bm',  label: 'Si mineur',   english: 'B minor' },
];

// ═══════════════════════════════════════════════════════
// HELPERS POUR L'UI
// ═══════════════════════════════════════════════════════

/** Labels courts pour chaque notation */
export const NOTATION_LABELS: Record<ChordNotation, string> = {
  english: 'EN',
  latin: 'Latin',
  numerical: 'Nashville',
};

/** Descriptions pour les tooltips */
export const NOTATION_DESCRIPTIONS: Record<ChordNotation, string> = {
  english: 'Notation anglaise (C D E F G A B)',
  latin: 'Notation latine (Do Ré Mi Fa Sol La Si)',
  numerical: 'Nashville Number System (1 2 3 4 5 6 7)',
};



