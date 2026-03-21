import { useCallback, useState } from "react";
import { UnifiedLine } from "@/types";
import { parseChordPro } from "@/utils/parseChordPro";

/**
 * Hook pour gérer la synchronisation unifiée (lyrics + accords)
 * Remplace la distinction entre useLyrics et useChords
 */
export function useUnifiedSync() {
  const [lines, setLines] = useState<UnifiedLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

  /**
   * Charger et parser le contenu ChordPro
   */
  const loadContent = useCallback((content: string) => {
    try {
      const parsed = parseChordPro(content);
      setLines(parsed);
      if (parsed.length > 0) {
        setSelectedLineId(parsed[0].id);
      }
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
    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? { ...line, timestamp, isSynced: true }
          : line
      )
    );
    // Auto-avancer au prochain non-synced
    const nextUnsynced = lines.find((l) => !l.isSynced);
    if (nextUnsynced) {
      setSelectedLineId(nextUnsynced.id);
    }
  }, [lines]);

  /**
   * Effacer le timestamp d'une ligne
   */
  const clearTimestamp = useCallback((lineId: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? { ...line, timestamp: null, isSynced: false }
          : line
      )
    );
  }, []);

  /**
   * Mettre à jour le timestamp manuellement
   */
  const updateTimestamp = useCallback((lineId: number, timestamp: number | null) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? { ...line, timestamp, isSynced: timestamp !== null }
          : line
      )
    );
  }, []);

  /**
   * Supprimer une ligne
   */
  const deleteLine = useCallback((lineId: number) => {
    setLines((prev) => prev.filter((line) => line.id !== lineId));
    if (selectedLineId === lineId) {
      const nextLine = lines.find((l) => l.id !== lineId);
      setSelectedLineId(nextLine?.id ?? null);
    }
  }, [lines, selectedLineId]);

  /**
   * Vider la liste complète
   */
  const clearAll = useCallback(() => {
    setLines([]);
    setSelectedLineId(null);
  }, []);

  /**
   * Obtenir les statistiques de synchronisation
   */
  const getSyncStats = useCallback(() => {
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
    deleteLine,
    clearAll,
    getSyncStats,
  };
}

