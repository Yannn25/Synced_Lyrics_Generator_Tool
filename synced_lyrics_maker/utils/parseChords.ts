import { ChordLine, ChordSymbol } from "@/types";

/**
 * Regex pour valider un accord (simplifiée)
 * Capture: root (A-G avec # ou b), quality (tout le reste), et bass optionnel (/X)
 */
const CHORD_REGEX = /^([A-G][#b]?)(.*?)(\/([A-G][#b]?))?$/;

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
export function parseChordSymbol(token: string): ChordSymbol {
  const trimmed = token.trim();
  const match = trimmed.match(CHORD_REGEX);

  if (!match) {
    return { label: trimmed, root: trimmed, quality: "" };
  }

  const [, root, quality, , bass] = match;

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
export function parseChords(text: string): ChordLine[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line, index) => {
      const tokens = line.split(/\s+/).filter(t => t.length > 0);
      const chords = tokens.map(parseChordSymbol);

      return {
        id: index + 1,
        timestamp: null,
        chords,
        isSynced: false,
        isEditing: false,
      };
    });
}

