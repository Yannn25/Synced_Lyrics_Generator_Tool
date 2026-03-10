import { useCallback } from 'react';
import { useSyncEngine } from './useSyncEngine';
import { parseChords as parseChordsUtil, parseChordSymbol } from "@/utils/parseChords";
import { ChordLine, ChordSymbol } from "@/types";

/**
 * Custom hook for managing chords state
 * Uses useSyncEngine as a generic base for sync logic
 */

export function useChords() {
  const engine = useSyncEngine<ChordLine>();

  // Parser et charger les accords
  const loadChords = useCallback((text: string) => {
    const parsed = parseChordsUtil(text);
    engine.loadItems(parsed);
  }, [engine.loadItems]);

  // Modifier les accords d'une ligne (re-parsing depuis texte brut)
  const updateChordText = useCallback((chordId: string | number, newText: string) => {
    const tokens = newText.split(/\s+/).filter(t => t.length > 0);
    const newChords: ChordSymbol[] = tokens.map(parseChordSymbol);
    engine.setItems(prev => prev.map(chord =>
      chord.id === chordId ? { ...chord, chords: newChords } : chord
    ));
  }, [engine.setItems]);

  // Supprimer une ligne d'accords
  const deleteChord = useCallback((chordId: string | number) => {
    engine.setItems(prev => prev.filter(chord => chord.id !== chordId));
    if (engine.selectedId === chordId) {
      engine.selectItem(null);
    }
  }, [engine.setItems, engine.selectedId, engine.selectItem]);

  // Lier une ligne d'accords à une ligne de paroles
  const linkToLyric = useCallback((chordId: string | number, lyricLineId: string | undefined) => {
    engine.setItems(prev => prev.map(chord =>
      chord.id === chordId ? { ...chord, lyricLineId } : chord
    ));
  }, [engine.setItems]);

  return {
    chords: engine.items,
    selectedChordId: engine.selectedId,
    loadChords,
    selectChord: engine.selectItem,
    syncChord: engine.syncItem,
    clearTimestamp: engine.clearTimestamp,
    onUpdateTimestamp: engine.updateTimestamp,
    syncAndAdvance: engine.syncAndAdvance,
    clearList: engine.clearAll,
    updateChordText,
    deleteChord,
    linkToLyric,
    getSyncStats: engine.getSyncStats,
  };
}

