import { ChordLine, LyricLine, ExportData, ExportMetadata } from "@/types";

/**
 * Convertit les lignes d'accords en format exportable
 * Filtre les lignes synchronisées, trie par timestamp
 */
export function chordsToExport(chords: ChordLine[]): ExportData['chords'] {
  return chords
    .filter(c => c.isSynced && c.timestamp !== null)
    .sort((a, b) => a.timestamp! - b.timestamp!)
    .map(c => ({
      time: c.timestamp!,
      chords: c.chords.map(s => ({
        label: s.label,
        root: s.root,
        quality: s.quality,
        bass: s.bass,
        extensions: s.extensions,
        alterations: s.alterations,
      })),
    }));
}

/**
 * Convertit les lignes d'accords synchronisées en JSON string
 * Structure: [{ time: number, chords: ChordSymbol[] }]
 */
export function chordsToJSON(chords: ChordLine[]): string {
  const items = chordsToExport(chords);
  return JSON.stringify(items, null, 2);
}

/**
 * Export combiné lyrics + chords en ExportData
 * Les deux sont optionnels : fonctionne avec lyrics seules, chords seuls, ou les deux
 */
export function combinedToExport(lyrics: LyricLine[], chords: ChordLine[], meta?: ExportMetadata): ExportData {
  const lyricsExport = lyrics
    .filter(l => l.isSynced && l.timestamp !== null)
    .sort((a, b) => a.timestamp! - b.timestamp!)
    .map(l => ({ time: l.timestamp!, text: l.text }));

  const chordsExport = chordsToExport(chords);

  const data: ExportData = {
    lyrics: lyricsExport,
    chords: chordsExport && chordsExport.length > 0 ? chordsExport : undefined,
  };

  // Ajoute les metadonnees si au moins une est presente
  if (meta && Object.values(meta).some((value) => value !== undefined && value !== null && value !== '')) {
    data.meta = meta;
  }

  return data;
}

/**
 * Export combiné en JSON string
 */
export function combinedToJSON(lyrics: LyricLine[], chords: ChordLine[], meta?: ExportMetadata): string {
  const data = combinedToExport(lyrics, chords, meta);
  return JSON.stringify(data, null, 2);
}

