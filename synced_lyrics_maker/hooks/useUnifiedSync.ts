import { useCallback, useEffect, useRef, useState } from "react";
import { UnifiedLine } from "@/types";
import { parseChordPro, extractChords } from "@/utils/parseChordPro";

/**
 * Hook pour gérer la synchronisation unifiée (lyrics + accords)
 * Remplace la distinction entre useLyrics et useChords
 */
export function useUnifiedSync() {
  const [lines, setLines] = useState<UnifiedLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const linesRef = useRef<UnifiedLine[]>([]);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  /**
   * Charger et parser le contenu ChordPro
   */
  const loadContent = useCallback((content: string) => {
    try {
      const parsed = parseChordPro(content);
      const previousLines = linesRef.current;

      // Preserve sync state by index when content is edited/reparsed.
      const mergedLines = parsed.map((line, index) => {
          const previous = previousLines[index];
          if (!previous) return line;

          return {
            ...line,
            timestamp: previous.timestamp,
            isSynced: previous.isSynced,
          };
        });

      linesRef.current = mergedLines;
      setLines(mergedLines);

      setSelectedLineId((previousSelectedId) => {
        if (parsed.length === 0) return null;
        if (previousSelectedId !== null && parsed.some((line) => line.id === previousSelectedId)) {
          return previousSelectedId;
        }
        return parsed[0].id;
      });
    } catch (error) {
      console.error("Erreur parsing ChordPro:", error);
    }
  }, []);

  /**
   * Sélectionner une ligne
   */
  const selectLine = useCallback((lineId: number) => {
    setSelectedLineId(lineId);
  }, []);

  /**
   * Synchroniser une ligne avec un timestamp
   */
  const syncLine = useCallback((lineId: number, timestamp: number) => {
    const currentLines = linesRef.current;
    const updated = currentLines.map((line) =>
      line.id === lineId ? { ...line, timestamp, isSynced: true } : line
    );

    linesRef.current = updated;
    setLines(updated);

    const currentIndex = updated.findIndex((line) => line.id === lineId);
    const nextUnsynced = updated
      .slice(Math.max(currentIndex + 1, 0))
      .find((line) => !line.isSynced) ?? updated.find((line) => !line.isSynced);

    if (nextUnsynced && nextUnsynced.id !== lineId) {
      setSelectedLineId(nextUnsynced.id);
    }
  }, []);

  /**
   * Effacer le timestamp d'une ligne
   */
  const clearTimestamp = useCallback((lineId: number) => {
    const updated = linesRef.current.map((line) =>
        line.id === lineId
          ? { ...line, timestamp: null, isSynced: false }
          : line
    );

    linesRef.current = updated;
    setLines(updated);
  }, []);

  /**
   * Mettre à jour le timestamp manuellement
   */
  const updateTimestamp = useCallback((lineId: number, timestamp: number | null) => {
    const updated = linesRef.current.map((line) =>
        line.id === lineId
          ? { ...line, timestamp, isSynced: timestamp !== null }
          : line
    );

    linesRef.current = updated;
    setLines(updated);
  }, []);

  /**
   * Mettre à jour le contenu (texte + accords) d'une ligne
   */
  const updateLineContent = useCallback((lineId: number, newContent: string) => {
    const updated = linesRef.current.map((line) => {
        if (line.id === lineId) {
          const { strippedText, chords } = extractChords(newContent);
          return {
            ...line,
            originalText: newContent,
            strippedText,
            chords,
          };
        }
        return line;
      });

    linesRef.current = updated;
    setLines(updated);
  }, []);

  /**
   * Supprimer une ligne
   */
  const deleteLine = useCallback((lineId: number) => {
    const currentLines = linesRef.current;
    const index = currentLines.findIndex((line) => line.id === lineId);
    const filtered = currentLines.filter((line) => line.id !== lineId);

    linesRef.current = filtered;
    setLines(filtered);

    if (selectedLineId === lineId) {
      const nextSelectedId = filtered[index]?.id ?? filtered[index - 1]?.id ?? null;
      setSelectedLineId(nextSelectedId);
    }
  }, [selectedLineId]);

  /**
   * Vider la liste complète
   */
  const clearAll = useCallback(() => {
    linesRef.current = [];
    setLines([]);
    setSelectedLineId(null);
  }, []);

  /**
   * Obtenir les statistiques de synchronisation
   */
  const syncStats = useCallback(() => {
    const total = lines.length;
    const synced = lines.filter((l) => l.isSynced).length;
    return {
      total,
      synced,
      percentage: total > 0 ? Math.round((synced / total) * 100) : 0,
    };
  }, [lines]);

  return {
    lines,
    selectedLineId,
    loadContent,
    selectLine,
    syncLine,
    clearTimestamp,
    updateTimestamp,
    updateLineContent,
    deleteLine,
    clearAll,
    syncStats,
  };
}
