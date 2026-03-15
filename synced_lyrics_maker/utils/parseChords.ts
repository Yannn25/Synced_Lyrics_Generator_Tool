import { ChordLine, ChordSymbol } from "@/types";
import { normalizeRootToEnglish, rootToSemitone } from "@/utils/chordNotation";

type InputNotation = "english" | "latin" | "numerical";

/**
 * Root supportés:
 * - English: C, F#, Bb
 * - Latin: Do, Ré, Sol#, Sib, etc.
 * - Nashville: 1..7 avec altérations (#4, b7)
 */
const ENGLISH_ROOT = "[A-G](?:#|b)?";
const LATIN_ROOT = "(?:Do|Re|Ré|Mi|Fa|Sol|La|Si)(?:#|♯|b|♭)?";
const NASHVILLE_ROOT = "(?:[b#]?[1-7])";
const ANY_ROOT = `(?:${ENGLISH_ROOT}|${LATIN_ROOT}|${NASHVILLE_ROOT})`;

/**
 * Capture: root, quality (tout le reste), et bass optionnel (/root)
 * Ex: Cmaj7, Rém7, b7sus4, 5/7, Sol/Si
 */
const CHORD_REGEX = new RegExp(`^(${ANY_ROOT})(.*?)(?:\/(${ANY_ROOT}))?$`, "iu");

function normalizeAccidental(value: string): string {
  return value.replace(/♯/g, "#").replace(/♭/g, "b");
}

function canonicalizeRoot(rawRoot: string): string {
  const root = normalizeAccidental(rawRoot.trim());

  // Nashville: 1..7 avec altération éventuelle
  if (/^[b#]?[1-7]$/i.test(root)) {
    return root.toLowerCase();
  }

  // English: C, F#, Bb (insensible à la casse)
  const englishMatch = root.match(/^([a-g])([#b]?)$/i);
  if (englishMatch) {
    return `${englishMatch[1].toUpperCase()}${englishMatch[2] || ""}`;
  }

  // Latin: Do, Re/Ré, Mi, Fa, Sol, La, Si (insensible à la casse)
  const latinMatch = root.match(/^(do|re|ré|mi|fa|sol|la|si)([#b]?)$/i);
  if (latinMatch) {
    const base = latinMatch[1].toLowerCase();
    const accidental = latinMatch[2] || "";
    const latinBaseMap: Record<string, string> = {
      do: "Do",
      re: "Re",
      "ré": "Ré",
      mi: "Mi",
      fa: "Fa",
      sol: "Sol",
      la: "La",
      si: "Si",
    };
    return `${latinBaseMap[base] ?? latinMatch[1]}${accidental}`;
  }

  // Fallback: on garde tel quel pour ne pas masquer un token invalide
  return root;
}

function inferRootNotation(root: string): InputNotation {
  if (/^[b#]?[1-7]$/i.test(root)) return "numerical";
  if (/^(Do|Re|Ré|Mi|Fa|Sol|La|Si)/i.test(root)) return "latin";
  return "english";
}

function normalizeRoot(root: string, key: string): string {
  const canonicalRoot = canonicalizeRoot(root);
  const notation = inferRootNotation(canonicalRoot);
  return normalizeRootToEnglish(canonicalRoot, notation, key);
}

function isSupportedRoot(root: string, key: string): boolean {
  const normalized = normalizeRoot(root, key);
  return rootToSemitone(normalized) !== -1;
}

/** Validation partagée pour l'UI et le parsing */
export function isChordTokenSupported(token: string, key = "C"): boolean {
  const trimmed = token.trim();
  if (!trimmed) return false;

  const match = trimmed.match(CHORD_REGEX);
  if (!match) return false;

  const [, root, , bass] = match;
  if (!isSupportedRoot(root, key)) return false;
  if (bass && !isSupportedRoot(bass, key)) return false;
  return true;
}

/**
 * Génère un hint pédagogique à partir de la quality d'un accord.
 * Aide les musiciens débutants à comprendre la nature de l'accord.
 */
function generateHint(quality: string, bass?: string): string | undefined {
  const q = quality.toLowerCase();

  // Accords de base
  if (q === '' || q === 'maj') return 'Accord majeur';
  if (q === 'm' || q === 'min') return 'Accord mineur';

  // Septièmes
  if (q === '7') return 'Septième de dominante';
  if (q === 'maj7') return 'Septième majeure';
  if (q === 'm7' || q === 'min7') return 'Septième mineure';
  if (q === 'mmaj7' || q === 'mM7') return 'Mineur avec septième majeure';
  if (q === 'm7b5') return 'Semi-diminué (mineur 7 bémol 5)';
  if (q === 'dim7') return 'Septième diminuée';

  // Diminués / Augmentés
  if (q === 'dim') return 'Accord diminué';
  if (q === 'aug' || q === '+') return 'Accord augmenté';

  // Suspensions
  if (q === 'sus2') return 'Suspendu 2 (sans tierce)';
  if (q === 'sus4') return 'Suspendu 4 (sans tierce)';

  // Extensions
  if (q === 'add9') return 'Ajout de neuvième';
  if (q === '9') return 'Neuvième de dominante';
  if (q === 'maj9') return 'Neuvième majeure';
  if (q === 'm9' || q === 'min9') return 'Neuvième mineure';
  if (q === '11') return 'Onzième de dominante';
  if (q === '13') return 'Treizième de dominante';
  if (q === '6') return 'Sixte ajoutée';
  if (q === 'm6' || q === 'min6') return 'Mineur sixte';

  // Power chord
  if (q === '5') return 'Power chord (quinte)';

  // Slash chord info supplémentaire
  if (!q && bass) return 'Accord majeur avec basse inversée';
  if (q === 'm' && bass) return 'Accord mineur avec basse inversée';

  return undefined;
}

/**
 * Parse une chaîne d'accord unique en ChordSymbol
 * Ex: "C/E" -> { label: "C/E", root: "C", quality: "", bass: "E", hint: "Accord majeur avec basse inversée" }
 * Ex: "Gmaj7" -> { label: "Gmaj7", root: "G", quality: "maj7", hint: "Septième majeure" }
 */
export function parseChordSymbol(token: string, options?: { key?: string }): ChordSymbol {
  const trimmed = token.trim();
  const match = trimmed.match(CHORD_REGEX);

  if (!match) {
    return { label: trimmed, root: trimmed, quality: "" };
  }

  const [, rawRoot, quality, rawBass] = match;
  const key = options?.key ?? "C";
  const root = normalizeRoot(rawRoot, key);
  const bass = rawBass ? normalizeRoot(rawBass, key) : undefined;

  return {
    label: trimmed,
    root,
    quality: quality || "",
    bass: bass || undefined,
    hint: generateHint(quality || "", bass),
  };
}

/**
 * Parse les accords depuis un texte brut multi-lignes
 * Chaque ligne devient une ChordLine contenant un ou plusieurs ChordSymbol
 * Les accords sont séparés par des espaces ou tabulations
 * L'id est un number incrémental (comme parseLyrics)
 */
export function parseChords(text: string, options?: { key?: string }): ChordLine[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line, index) => {
      const tokens = line.split(/\s+/).filter(t => t.length > 0);
      const chords = tokens.map((token) => parseChordSymbol(token, options));

      return {
        id: index + 1,
        timestamp: null,
        chords,
        isSynced: false,
        isEditing: false,
      };
    });
}

