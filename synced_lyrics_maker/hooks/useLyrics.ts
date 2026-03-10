import { useCallback } from 'react';
import { useSyncEngine } from './useSyncEngine';
import { parseLyrics as parseLyricsUtil } from "@/utils/parseLyrics";
import { LyricLine } from "@/types";

/**
 * Custom hook for managing lyrics state
 * Uses useSyncEngine as a generic base for sync logic
 */

export function useLyrics() {
  const engine = useSyncEngine<LyricLine>();

  // Fonction spécifique: parser et charger les lyrics
  const loadLyrics = useCallback((text: string) => {
    const parsed = parseLyricsUtil(text);
    engine.loadItems(parsed);
  }, [engine.loadItems]);

  // Fonction spécifique: modifier le texte d'une ligne
  const updateLineText = useCallback((lineId: number, newText: string) => {
    engine.setItems(prev => prev.map(line =>
      line.id === lineId ? { ...line, text: newText } : line
    ));
  }, [engine.setItems]);

  // Fonction spécifique: supprimer une ligne
  const deleteLine = useCallback((lineId: number) => {
    engine.setItems(prev => prev.filter(line => line.id !== lineId));
    if (engine.selectedId === lineId) {
      engine.selectItem(null);
    }
  }, [engine.setItems, engine.selectedId, engine.selectItem]);

  return {
    lyrics: engine.items,
    selectedLineId: engine.selectedId,
    loadLyrics,
    selectLine: engine.selectItem,
    syncLine: engine.syncItem,
    clearTimestamp: engine.clearTimestamp,
    onUpdateTimestamp: engine.updateTimestamp,
    getNextUnsyncedLine: engine.getNextUnsynced,
    syncAndAdvance: engine.syncAndAdvance,
    clearList: engine.clearAll,
    updateLineText,
    deleteLine,
    getSyncStats: engine.getSyncStats,
  };
}
