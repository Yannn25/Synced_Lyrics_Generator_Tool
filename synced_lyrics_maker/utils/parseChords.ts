import { ChordLine, ChordSymbol } from "@/types";

/**
 * Regex pour valider un accord (simplifiée)
 * Capture: root (A-G avec # ou b), quality (tout le reste), et bass optionnel (/X)
 */
const CHORD_REGEX = /^([A-G][#b]?)(.*?)(\/([A-G][#b]?))?$/;

/**
 * Parse une chaîne d'accord unique en ChordSymbol
 * Ex: "C/E" -> { label: "C/E", root: "C", quality: "", bass: "E" }
 * Ex: "Gmaj7" -> { label: "Gmaj7", root: "G", quality: "maj7" }
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
  };
}

/**
 * Parse les accords depuis un texte brut multi-lignes
 * Chaque ligne devient une ChordLine contenant un ou plusieurs ChordSymbol
 * Les accords sont séparés par des espaces ou tabulations
 */
export function parseChords(text: string): ChordLine[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line) => {
      const tokens = line.split(/\s+/).filter(t => t.length > 0);
      const chords = tokens.map(parseChordSymbol);

      return {
        id: crypto.randomUUID(),
        timestamp: null,
        chords,
        isSynced: false,
        isEditing: false,
      };
    });
}

