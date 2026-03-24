/**
 * Hook générique de synchronisation
 * Utilisé comme base par useLyrics et useChords pour éviter la duplication
 */

import { useState, useCallback } from 'react';
import { SyncableItem } from '@/types';

interface UseSyncEngineOptions<T extends SyncableItem> {
  initialItems?: T[];
}

export function useSyncEngine<T extends SyncableItem>(options: UseSyncEngineOptions<T> = {}) {
  const [items, setItems] = useState<T[]>(options.initialItems || []);
  const [selectedId, setSelectedId] = useState<T['id'] | null>(null);

  // Sélectionner un item
  const selectItem = useCallback((id: T['id'] | null) => {
    setSelectedId(id);
  }, []);

  // Synchroniser un item avec un timestamp
  const syncItem = useCallback((id: T['id'], timestamp: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, timestamp, isSynced: true } : item
    ));
  }, []);

  // Effacer le timestamp d'un item
  const clearTimestamp = useCallback((id: T['id']) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, timestamp: null, isSynced: false } : item
    ));
  }, []);

  // Mettre à jour le timestamp manuellement
  const updateTimestamp = useCallback((id: T['id'], timestamp: number | null) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, timestamp, isSynced: timestamp !== null } : item
    ));
  }, []);

  // Obtenir le prochain item non synchronisé
  const getNextUnsynced = useCallback((): T['id'] | null => {
    const unsynced = items.find(item => !item.isSynced);
    return unsynced?.id ?? null;
  }, [items]);

  // Synchroniser et avancer automatiquement
  const syncAndAdvance = useCallback((id: T['id'], timestamp: number) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, timestamp, isSynced: true } : item
      );
      const nextUnsynced = updated.find(item => !item.isSynced);
      setSelectedId(nextUnsynced?.id ?? null);
      return updated;
    });
  }, []);

  // Effacer tous les items
  const clearAll = useCallback(() => {
    setItems([]);
    setSelectedId(null);
  }, []);

  // Charger des items
  const loadItems = useCallback((newItems: T[]) => {
    setItems(newItems);
    setSelectedId(null);
  }, []);

  // Stats de synchronisation
  const getSyncStats = useCallback(() => {
    const total = items.length;
    const synced = items.filter(i => i.isSynced).length;
    return { total, synced, percentage: total > 0 ? Math.round((synced / total) * 100) : 0 };
  }, [items]);

  return {
    items,
    selectedId,
    setItems,
    selectItem,
    syncItem,
    clearTimestamp,
    updateTimestamp,
    getNextUnsynced,
    syncAndAdvance,
    clearAll,
    loadItems,
    getSyncStats,
  };
}

