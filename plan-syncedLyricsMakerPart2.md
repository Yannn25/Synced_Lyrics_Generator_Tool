# GUIDE COMPLET : PARTIE 2 DU POC SYNCED LYRICS MAKER

## Synchronisation des Accords, Workflow Multi-Étapes, shadcn/ui & Tests

---

## TABLE DES MATIÈRES

1. [Phase 0 : Préparation & Installation shadcn/ui](#phase-0--préparation--installation-shadcnui)
2. [Phase 1 : Refactorisation en Workflow Multi-Étapes](#phase-1--refactorisation-en-workflow-multi-étapes)
3. [Phase 2 : Migration des Composants vers shadcn/ui](#phase-2--migration-des-composants-vers-shadcnui)
4. [Phase 3 : Synchronisation des Accords(Avancées)](#phase-3--synchronisation-des-accords)
5. [Phase 4 : Tests Unitaires et UI](#phase-4--tests-unitaires-et-ui)
6. [Phase 5 : Structure des Fichiers Finale](#phase-5--structure-des-fichiers-finale)
7. [Phase 6 : Polish & Finalisation](#phase-6--polish--finalisation)
8. [Considérations Supplémentaires](#considérations-supplémentaires)

---

## CONTEXTE ACTUEL DU PROJET

### État de la codebase existante

Le POC actuel dispose déjà de :

**Composants :**
- `AudioPlayer.tsx` - Lecteur audio fonctionnel avec upload, play/pause, seek
- `LyricsInput.tsx` - Zone de saisie des paroles avec bouton Load
- `LyricsList.tsx` - Liste des lyrics avec sélection, édition, suppression
- `ExportPanel.tsx` - Export JSON et LRC fonctionnel
- `HelpModal.tsx` - Modal d'aide
- `ShortcutsHints.tsx` - Indicateur des raccourcis
- `LyricsPreview/` - Preview modal avec CurrentLyricsDisplay, PreviewControls

**Hooks :**
- `useAudio.ts` - Gestion complète de l'audio
- `useLyrics.ts` - Gestion des lyrics avec sync, edit, delete
- `useExport.ts` - Export JSON/LRC avec stats
- `useLyricsSync.ts` - Synchronisation pour le preview

**Utils :**
- `formatTime.ts` - Formatage mm:ss.cc
- `parseLyrics.ts` - Parser de texte vers LyricLine[]
- `lrcSerializer.ts` - Export LRC
- `jsonSerializer.ts` - Export JSON
- `detectChorus.ts` - Détection du refrain pour noms de fichiers

**Types :**
- `LyricLine` - Interface principale
- `SyncedLyricItem`, `SyncedLyricsJSON`, `LRCFormat`
- `LyricsListProps`, `AudioPlayerProps`, `CurrentLyricDisplayProps`

---

## PHASE 0 : PRÉPARATION & INSTALLATION SHADCN/UI

### Étape 0.1 : Installer les dépendances de base shadcn/ui

shadcn/ui nécessite quelques dépendances supplémentaires pour fonctionner correctement.

**Commandes à exécuter :**

```bash
# Installer les dépendances core de shadcn/ui
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# Initialiser shadcn/ui
pnpm dlx shadcn@latest init
```

**Lors de l'initialisation, répondre :**
- Style: **New York** (plus proche du look Apple)
- Base color: **Slate**
- CSS variables: **Yes**

### Étape 0.2 : Installer les composants shadcn/ui nécessaires

```bash
pnpm dlx shadcn@latest add button card input textarea tabs dialog progress slider badge tooltip
```

### Étape 0.3 : Créer le fichier lib/utils.ts

**Fichier à créer :** `lib/utils.ts`

Ce fichier est requis par shadcn/ui pour la fonction `cn()` qui merge les classes CSS.

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Étape 0.4 : Configurer le design "Liquid Glass"

**Fichier à modifier :** `app/globals.css`

Le style "Liquid Glass" d'Apple repose sur :
- Transparence avec `backdrop-blur`
- Dégradés subtils et bordures semi-transparentes
- Effets de brillance (highlights) et ombres douces
- Transitions fluides avec courbes d'accélération naturelles

**Ajouter les classes utilitaires suivantes :**

```css
/* Liquid Glass Effect Classes */
@layer components {
  .glass {
    @apply bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl;
  }

  .glass-dark {
    @apply bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl;
  }

  .glass-card {
    @apply rounded-3xl bg-gradient-to-br from-white/15 via-white/5 to-transparent 
           backdrop-blur-2xl border border-white/20 shadow-2xl
           before:absolute before:inset-0 before:rounded-3xl 
           before:bg-gradient-to-br before:from-white/10 before:to-transparent 
           before:opacity-50 before:pointer-events-none;
  }

  .glass-button {
    @apply bg-white/10 backdrop-blur-md border border-white/30 
           hover:bg-white/20 hover:border-white/40
           active:bg-white/30 transition-all duration-300 ease-out;
  }

  .glass-input {
    @apply bg-white/5 backdrop-blur-sm border border-white/20
           focus:bg-white/10 focus:border-white/40
           placeholder:text-white/40 transition-all duration-200;
  }

  /* Glow effects */
  .glow-primary {
    @apply shadow-[0_0_30px_-5px_var(--color-primary-darkest)];
  }

  .glow-subtle {
    @apply shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)];
  }

  /* Smooth transitions Apple-style */
  .transition-apple {
    @apply transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)];
  }
}
```

### Étape 0.5 : Installer framer-motion pour les transitions

```bash
pnpm add framer-motion
```

---

## PHASE 1 : REFACTORISATION EN WORKFLOW MULTI-ÉTAPES

### Étape 1.1 : Définir l'architecture du workflow

**Concept :** Une navigation par étapes avec focus sur la section active et transitions fluides.

```
┌─────────────────────────────────────────────────────────┐
│  ① Input  ─────────► ② Sync  ─────────► ③ Export       │
│  (Audio + Lyrics)    (Synchronisation)  (Download)      │
└─────────────────────────────────────────────────────────┘

Étape 1 : Input (AudioPlayer + LyricsInput)
    ↓ Condition: Audio chargé ET Lyrics loadées
Étape 2 : Synchronisation (LyricsList + Contrôles audio)
    ↓ Condition: Au moins 1 ligne synced
Étape 3 : Export (ExportPanel + Preview)
```

**Fichier principal à modifier :** `app/page.tsx`

Utiliser un state `currentStep: 1 | 2 | 3` pour gérer les transitions.

### Étape 1.2 : Créer les types pour le workflow

**Fichier à modifier :** `types/index.ts`

```typescript
// Types pour le workflow multi-étapes
export type WorkflowStep = 1 | 2 | 3;

export interface WorkflowState {
  currentStep: WorkflowStep;
  canGoToStep2: boolean; // Audio chargé ET lyrics loadées
  canGoToStep3: boolean; // Au moins 1 ligne synced
}

export interface StepIndicatorProps {
  currentStep: WorkflowStep;
  canGoToStep: (step: WorkflowStep) => boolean;
  onStepClick: (step: WorkflowStep) => void;
}
```

### Étape 1.3 : Créer le composant StepIndicator

**Fichier à créer :** `components/workflow/StepIndicator.tsx`

Ce composant affiche une barre de progression horizontale avec 3 étapes cliquables.

**Fonctionnalités :**
- Afficher 3 étapes avec icônes (Upload, Sync, Download)
- Ligne de progression entre les étapes
- État actif/complété/verrouillé pour chaque étape
- Animation de transition lors du changement d'étape
- Utiliser les composants `Badge` et `Progress` de shadcn/ui

**Structure visuelle :**
```
  ①─────────────②─────────────③
 Input         Sync         Export
[Actif]      [Verrouillé]  [Verrouillé]
```

### Étape 1.4 : Créer les conteneurs par étape

**Fichiers à créer :**

1. **`components/workflow/StepInput.tsx`**
   - Regroupe AudioPlayer + LyricsInput (+ ChordsInput futur)
   - Layout en colonnes ou tabs selon le mode
   - Bouton "Continuer" quand les conditions sont remplies

2. **`components/workflow/StepSync.tsx`**
   - Regroupe LyricsList (+ ChordsList futur) + mini-contrôles audio
   - Vue principale de synchronisation
   - Toggle entre mode lyrics/accords/combiné
   - Bouton "Exporter" quand synced

3. **`components/workflow/StepExport.tsx`**
   - Regroupe ExportPanel + Preview button
   - Stats finales
   - Options d'export avancées

### Étape 1.5 : Créer le hook useWorkflow

**Fichier à créer :** `hooks/useWorkflow.ts`

Ce hook gère la logique de navigation entre étapes.

```typescript
// Fonctions à implémenter:
- canGoToStep(step: WorkflowStep): boolean
- goToStep(step: WorkflowStep): void
- goToNextStep(): void
- goToPreviousStep(): void
- checkConditions(): void // Auto-update des conditions
```

### Étape 1.6 : Ajouter les transitions avec framer-motion

**Dans chaque composant Step :**

Wrapper chaque étape avec `<motion.div>` et des animations :

```typescript
import { motion, AnimatePresence } from 'framer-motion';

const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

// Usage:
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    variants={stepVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {/* Contenu de l'étape */}
  </motion.div>
</AnimatePresence>
```

### Étape 1.7 : Modifier la page principale

**Fichier :** `app/page.tsx`

Restructurer pour utiliser le workflow :

```typescript
// Structure simplifiée:
export default function Home() {
  const { currentStep, canGoToStep, goToStep } = useWorkflow();
  const audio = useAudio();
  const lyrics = useLyrics();
  // ... autres hooks

  return (
    <div className="app-shell">
      <Header />
      <StepIndicator 
        currentStep={currentStep}
        canGoToStep={canGoToStep}
        onStepClick={goToStep}
      />
      <main>
        <AnimatePresence mode="wait">
          {currentStep === 1 && <StepInput ... />}
          {currentStep === 2 && <StepSync ... />}
          {currentStep === 3 && <StepExport ... />}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
```

---

## PHASE 2 : MIGRATION DES COMPOSANTS VERS SHADCN/UI

### Étape 2.1 : Refactoriser AudioPlayer

**Fichier :** `components/AudioPlayer.tsx`

**Remplacements à effectuer :**

| Élément actuel | Composant shadcn |
|----------------|------------------|
| Input file custom | `Input` avec styling custom + glass effect |
| Boutons Play/Pause/Sync | `Button` avec variantes (default, secondary, outline) |
| Input range (progress) | `Slider` de shadcn |
| Card wrapper | `Card` + `CardHeader` + `CardContent` avec glass effect |
| Tooltips potentiels | `Tooltip` de shadcn |

**Points d'attention :**
- Conserver toute la logique existante (useAudio)
- Ajouter les effets glass sur le card
- Utiliser les icônes de `lucide-react` (Play, Pause, Upload)

### Étape 2.2 : Refactoriser LyricsInput

**Fichier :** `components/LyricsInput.tsx`

**Remplacements :**
- `textarea` → `Textarea` de shadcn
- `button` → `Button` de shadcn
- Card wrapper → `Card` avec glass effect

### Étape 2.3 : Refactoriser LyricsList

**Fichier :** `components/LyricsList.tsx`

C'est le composant le plus complexe. Garder la logique existante mais remplacer les éléments visuels.

**Remplacements :**
- Lignes de lyrics → `Card` mini avec hover effects
- Boutons d'action → `Button` variant="ghost" ou "outline"
- Inputs d'édition → `Input` de shadcn
- Badges de statut → `Badge` de shadcn

**Structure suggérée pour chaque ligne :**
```tsx
<Card className="glass-card p-2 mb-2 cursor-pointer transition-apple">
  <div className="flex items-center gap-3">
    <Badge variant={isSynced ? "default" : "secondary"}>{index + 1}</Badge>
    <span className="flex-1">{text}</span>
    <span className="text-sm opacity-60">{timestamp || "—"}</span>
    <Button variant="ghost" size="sm" onClick={onClear}>×</Button>
  </div>
</Card>
```

### Étape 2.4 : Refactoriser ExportPanel

**Fichier :** `components/ExportPanel.tsx`

**Remplacements :**
- Boutons → `Button` avec variantes
- Progress bar → `Progress` de shadcn
- Card → `Card` glass effect

### Étape 2.5 : Refactoriser les modales

**Fichier :** `components/HelpModal.tsx`

Remplacer par `Dialog` de shadcn :
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
```

**Fichier :** `components/LyricsPreview/LyricsPreviewModal.tsx`

Utiliser `Dialog` en mode plein écran avec overlay custom pour l'effet immersif.

---

## PHASE 3 : SYNCHRONISATION DES ACCORDS

### Étape 3.1 : Définir les nouveaux types

**Fichier :** `types/index.ts`

Ajouter et adapter les interfaces suivantes pour la gestion avancée des accords :

```typescript
// ═══════════════════════════════════════════════════════
// TYPES POUR LES ACCORDS (MODÈLE AVANCÉ)
// ═══════════════════════════════════════════════════════

export interface ChordSymbol {
  label: string;         // "C/E", "Gmaj7", "F#m7b5"
  root: string;          // "C", "G#", "Bb" (notation anglaise)
  quality: string;       // "", "m", "maj7", "7", "m7", "dim", "aug", "sus2", "sus4", "add9"
  bass?: string;         // "E" dans C/E (slash chords)
  extensions?: string[]; // ["9", "11", "13", "b9", "#11"]
  alterations?: string[];// ["b5", "#5"]
  hint?: string;         // Annotation pédagogique optionnelle
}

export interface ChordLine {
  id: string;            // UUID
  timestamp: number | null; // Temps de début de la ligne d'accords
  chords: ChordSymbol[];    // Liste des accords sur cette ligne
  lyricLineId?: string;     // Lien vers une ligne de paroles
  section?: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
  isSynced: boolean;     // Propriété pour SyncableItem
  isEditing: boolean;    // Propriété pour SyncableItem
}

// ═══════════════════════════════════════════════════════
// FORMAT D'EXPORT JSON (LYRICS + CHORDS)
// ═══════════════════════════════════════════════════════

export interface ExportLyricLine {
  time: number;
  text: string;
}

export interface ExportChordSymbol {
  label: string;
  root: string;
  quality: string;
  bass?: string;
  extensions?: string[];
  alterations?: string[];
}

export interface ExportChordLine {
  time: number;
  chords: ExportChordSymbol[];
}

export interface ExportData {
  lyrics: ExportLyricLine[];
  chords?: ExportChordLine[];
  meta?: {
    key?: string;            // Tonalité globale (ex: "Cm")
    timeSignature?: string;  // Ex: "4/4"
  };
}

// ═══════════════════════════════════════════════════════
// TYPE GÉNÉRIQUE POUR LA SYNCHRONISATION
// ═══════════════════════════════════════════════════════

// Interface commune pour lyrics ET chords (mutualisation)
// Note: Migration vers string ID recommandée pour LyricLine aussi
export interface SyncableItem {
  id: string | number;
  timestamp: number | null;
  isSynced: boolean;
  isEditing: boolean;
}


// ═══════════════════════════════════════════════════════
// MODES D'AFFICHAGE
// ═══════════════════════════════════════════════════════

export type ViewMode = 'lyrics' | 'chords' | 'both';

export type SyncMode = 'lyrics' | 'chords';

export type ChordNotation = 'english' | 'latin' | 'numerical';

// ═══════════════════════════════════════════════════════
// PROPS DES COMPOSANTS CHORDS
// ═══════════════════════════════════════════════════════

export interface ChordsListProps {
  chords: ChordLine[];
  selectedChordId: string | number | null;
  onSelectChord: (chordId: string | number) => void;
  onClearTimestamp: (chordId: string | number) => void;
  onUpdateTimestamp: (chordId: string | number, timestamp: number | null) => void;
  onUpdateChordText: (chordId: string | number, newChords: ChordSymbol[]) => void;
  onDeleteChord: (chordId: string | number) => void;
  notation: ChordNotation; // Système de notation à afficher
}

// ═══════════════════════════════════════════════════════
// COMBINED VIEW
// ═══════════════════════════════════════════════════════

export interface CombinedViewProps {
  lyrics: LyricLine[];
  chords: ChordLine[];
  onSync: (id: string | number, time: number) => void;
  notation: ChordNotation;
}

```

### Étape 3.2 : Créer un hook générique de synchronisation

**Fichier à créer :** `hooks/useSyncEngine.ts`

Ce hook **mutualise** la logique de synchronisation pour lyrics ET accords.

```typescript
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

  // Stats
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
```

### Étape 3.3 : Refactoriser useLyrics pour utiliser useSyncEngine

**Fichier :** `hooks/useLyrics.ts`

Modifier pour utiliser `useSyncEngine` comme base tout en gardant les fonctions spécifiques aux lyrics.

```typescript
import { useCallback } from 'react';
import { useSyncEngine } from './useSyncEngine';
import { parseLyrics as parseLyricsUtil } from "@/utils/parseLyrics";
import { LyricLine } from "@/types";

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
    syncAndAdvance: engine.syncAndAdvance,
    clearList: engine.clearAll,
    updateLineText,
    deleteLine,
    getSyncStats: engine.getSyncStats,
  };
}
```

### Étape 3.4 : Créer le hook useChords

**Fichier à créer :** `hooks/useChords.ts`

Structure similaire à `useLyrics`, mais pour les accords.

```typescript
import { useCallback } from 'react';
import { useSyncEngine } from './useSyncEngine';
import { parseChords as parseChordsUtil } from "@/utils/parseChords";
import { ChordLine } from "@/types";

export function useChords() {
  const engine = useSyncEngine<ChordLine>();

  // Parser et charger les accords
  const loadChords = useCallback((text: string) => {
    const parsed = parseChordsUtil(text);
    engine.loadItems(parsed);
  }, [engine.loadItems]);

  // Modifier le texte d'un accord (re-parsing)
  const updateChordText = useCallback((chordId: string | number, newText: string) => {
    // Cette fonction doit re-parser la ligne pour mettre à jour les ChordSymbol[]
    // Implémentation simplifiée :
    /*
    const newChords = parseLineToSymbols(newText);
    engine.setItems(prev => prev.map(chord =>
      chord.id === chordId ? { ...chord, chords: newChords } : chord
    ));
    */
  }, [engine.setItems]);

  // Supprimer un accord
  const deleteChord = useCallback((chordId: string | number) => {
    engine.setItems(prev => prev.filter(chord => chord.id !== chordId));
    if (engine.selectedId === chordId) {
      engine.selectItem(null);
    }
  }, [engine.setItems, engine.selectedId, engine.selectItem]);

  // Lier un accord à une ligne de lyric
  const linkToLyric = useCallback((chordId: string | number, lyricId: string | undefined) => {
    engine.setItems(prev => prev.map(chord =>
      chord.id === chordId ? { ...chord, linkedLyricId: lyricId } : chord
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
```

### Étape 3.5 : Créer le parser d'accords

**Fichier à créer :** `utils/parseChords.ts`

```typescript
import { ChordLine, ChordSymbol } from "@/types";
import { v4 as uuidv4 } from 'uuid'; // Ou utiliser une génération d'ID simple

/**
 * Regex pour valider un accord (simplifiée)
 */
const CHORD_REGEX = /^([A-G][#b]?)(.*?)(\/([A-G][#b]?))?$/;

/**
 * Parse une chaine d'accord unique "C/E" -> ChordSymbol
 */
function parseChordSymbol(token: string): ChordSymbol {
  const match = token.trim().match(CHORD_REGEX);
  if (!match) {
    return { label: token, root: token, quality: "" };
  }

  const [, root, quality, , bass] = match;

  return {
    label: token,
    root,
    quality: quality || "",
    bass: bass || undefined,
    // Extensions et altérations à parser plus finement si besoin
  };
}

/**
 * Parse les accords depuis un texte brut
 * Supporte plusieurs accords par ligne séparés par des espaces
 */
export function parseChords(text: string): ChordLine[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line) => {
      // Split par espace ou tabulation
      const tokens = line.split(/\s+/).filter(t => t.length > 0);
      const chords = tokens.map(parseChordSymbol);

      return {
        id: crypto.randomUUID(), // Utiliser l'API native ou uuid
        timestamp: null,
        chords: chords,
        isSynced: false,
        isEditing: false,
        linkedLyricId: undefined,
      };
    });
}
```

### Étape 3.6 : Créer les sérialiseurs pour accords

**Fichier à créer :** `utils/chordsSerializer.ts`

```typescript
import { ChordLine, ExportData } from "@/types";

/**
 * Converti les lignes d'accords en format exportable
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
        alterations: s.alterations
      }))
    }));
}


/**
 * Export combiné lyrics + chords
 */
export function combinedToExport(lyrics: LyricLine[], chords: ChordLine[]): ExportData {
  const lyricsExport = lyrics
    .filter(l => l.isSynced && l.timestamp !== null)
    .map(l => ({ time: l.timestamp!, text: l.text, type: 'lyric' }));

  const chordsExport = chordsToExport(chords);

  return {
    lyrics: lyricsExport,
    chords: chordsExport,
    // meta: ...
  };
}

### Étape 3.7 : Créer le composant ChordsInput

**Fichier à créer :** `components/ChordsInput.tsx`

Zone de saisie intelligente pour les accords.

**Fonctionnalités :**
- Supporte le copier-coller de grilles d'accords
- Détecte automatiquement les slash chords (ex: "C/E")
- Validation en temps réel avec feedback visuel
- Statistiques (nombre d'accords détectés)

**Logique de parsing :**
- Split par ligne puis par espace
- Pour chaque token, tentative de parsing en `ChordSymbol`
- Si succès -> Badge vert
- Si échec -> Texte rouge ou souligné

### Étape 3.8 : Créer le composant ChordsList

**Fichier à créer :** `components/ChordsList.tsx`

Affiche la liste des lignes d'accords pour la synchronisation.

**Structure visuelle :**
- Liste déroulante similaire à `LyricsList`
- Chaque ligne affiche les badges d'accords
- **Nouveau :** Affichage selon notation choisie (Anglais / Latin / Chiffres)
- Bouton "Sync" (raccourci clavier) pour synchroniser la ligne entière
- Indicateurs visuels de temps et de statut

### Étape 3.9 : Modifier l'étape Input

**Fichier :** `components/workflow/StepInput.tsx`

Ajouter le support des tabs pour l'input :

```tsx
<Tabs defaultValue="lyrics-only">
  <TabsList className="glass">
    <TabsTrigger value="lyrics-only">Paroles</TabsTrigger>
    <TabsTrigger value="lyrics-chords">Paroles + Accords</TabsTrigger>
  </TabsList>
  {/* Contenu des tabs */}
</Tabs>
```

### Étape 3.10 : Modifier l'étape Sync

**Fichier :** `components/workflow/StepSync.tsx`

Implémenter le sélecteur de vue et de notation :

```tsx
// Toolbar de synchronisation
<div className="flex justify-between mb-4">
  <Tabs value={viewMode} onValueChange={setViewMode}>
    <TabsList>
      <TabsTrigger value="lyrics">Paroles</TabsTrigger>
      <TabsTrigger value="chords">Accords</TabsTrigger>
      <TabsTrigger value="both">Combiné</TabsTrigger>
    </TabsList>
  </Tabs>

  {/* Selecteur de notation */}
  <Select value={notation} onValueChange={setNotation}>
    <SelectTrigger className="w-[140px]">
      <SelectValue placeholder="Notation" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="english">Anglais (C D E)</SelectItem>
      <SelectItem value="latin">Latin (Do Ré Mi)</SelectItem>
      <SelectItem value="numerical">Chiffres (1 2 3)</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### Étape 3.11 : Créer le composant CombinedView

**Fichier à créer :** `components/CombinedView.tsx`

Vue partition affichant les lyrics avec les accords au-dessus.

**Logique :**
- Mappe les lyrics et les accords par timestamp
- Affiche les accords alignés au-dessus du texte (logique d'alignement approximative basée sur le temps)
- Permet de voir la cohérence globale de la synchro

### Étape 3.12 : Traduction et Notation des Accords

**Fichier à créer :** `utils/chordNotation.ts`

Implémenter la logique de conversion de notation.

```typescript
// Maps de conversion
const ENGLISH_TO_LATIN: Record<string, string> = {
  "C": "Do", "D": "Ré", "E": "Mi", "F": "Fa", "G": "Sol", "A": "La", "B": "Si"
  // + dièses et bémols
};

const KEY_TO_NUMBER: Record<string, number> = {
  "C": 1, "D": 2, ... // Logique relative à la tonalité (Key)
};

export function translateChord(chord: ChordSymbol, notation: ChordNotation, key?: string): string {
  if (notation === 'english') return chord.label;
  if (notation === 'latin') {
    // Conversion root -> latin
    // Reconstruire le label (Ex: "Domaj7")
  }
  if (notation === 'numerical' && key) {
    // Calcul de l'intervalle par rapport à la tonalité
    // Ex: Key=C, Accord=G -> "5"
  }
  return chord.label; // Fallback
}
```

### Étape 3.13 : Notions musicales avancées (Optionnel)

Ajouter la gestion des métadonnées musicales pour supporter la notation chiffrée.

**Modifications :**
- Ajouter un champ `Key` (Tonalité) dans `StepInput` ou `ShortcutsHints`
- Stocker `timeSignature` (4/4, 3/4) pour l'affichage de la grille
- Ajouter une propriété `hint` aux `ChordSymbol` pour annotations pédagogiques

### Étape 3.14 : Modifier useExport et ExportPanel

**Fichier :** `hooks/useExport.ts` & `components/ExportPanel.tsx`

Mettre à jour pour utiliser le nouveau format `ExportData`.

- L'export JSON doit retourner un objet `{ lyrics: [...], chords: [...] }`.
- L'export LRC reste inchangé (lyrics seulement).

---

## PHASE 4 : TESTS UNITAIRES ET UI

### Étape 4.1 : Installer les dépendances de test

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

### Étape 4.2 : Configurer Vitest

**Fichier à créer :** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['hooks/**', 'utils/**', 'components/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Étape 4.3 : Créer le fichier setup

**Fichier à créer :** `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Audio API
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: vi.fn(),
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Blob
global.Blob = class Blob {
  constructor(public parts: any[], public options?: any) {}
} as any;
```

### Étape 4.4 : Structure des fichiers de test

```
tests/
├── setup.ts
├── hooks/
│   ├── useSyncEngine.test.ts
│   ├── useAudio.test.ts
│   ├── useLyrics.test.ts
│   ├── useChords.test.ts
│   └── useExport.test.ts
├── utils/
│   ├── formatTime.test.ts
│   ├── parseLyrics.test.ts
│   ├── parseChords.test.ts
│   ├── lrcSerializer.test.ts
│   ├── jsonSerializer.test.ts
│   └── chordsSerializer.test.ts
└── components/
    ├── AudioPlayer.test.tsx
    ├── LyricsList.test.tsx
    ├── ChordsList.test.tsx
    └── ExportPanel.test.tsx
```

### Étape 4.5 : Tests pour useSyncEngine

**Fichier :** `tests/hooks/useSyncEngine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSyncEngine } from '@/hooks/useSyncEngine';

describe('useSyncEngine', () => {
  const mockItems = [
    { id: 1, timestamp: null, isSynced: false, isEditing: false },
    { id: 2, timestamp: null, isSynced: false, isEditing: false },
    { id: 3, timestamp: null, isSynced: false, isEditing: false },
  ];

  it('should initialize with empty items', () => {
    const { result } = renderHook(() => useSyncEngine());
    expect(result.current.items).toEqual([]);
    expect(result.current.selectedId).toBeNull();
  });

  it('should load items correctly', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => {
      result.current.loadItems(mockItems);
    });
    expect(result.current.items).toHaveLength(3);
  });

  it('should select an item', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => {
      result.current.loadItems(mockItems);
      result.current.selectItem(2);
    });
    expect(result.current.selectedId).toBe(2);
  });

  it('should sync an item with timestamp', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => {
      result.current.loadItems(mockItems);
      result.current.syncItem(1, 5.5);
    });
    const syncedItem = result.current.items.find(i => i.id === 1);
    expect(syncedItem?.timestamp).toBe(5.5);
    expect(syncedItem?.isSynced).toBe(true);
  });

  it('should clear timestamp', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => {
      result.current.loadItems(mockItems);
      result.current.syncItem(1, 5.5);
      result.current.clearTimestamp(1);
    });
    const item = result.current.items.find(i => i.id === 1);
    expect(item?.timestamp).toBeNull();
    expect(item?.isSynced).toBe(false);
  });

  it('should get next unsynced item', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => {
      result.current.loadItems(mockItems);
      result.current.syncItem(1, 5.5);
    });
    expect(result.current.getNextUnsynced()).toBe(2);
  });

  it('should sync and auto-advance to next', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => {
      result.current.loadItems(mockItems);
      result.current.selectItem(1);
      result.current.syncAndAdvance(1, 5.5);
    });
    expect(result.current.items[0].isSynced).toBe(true);
    expect(result.current.selectedId).toBe(2); // Auto-advanced
  });

  it('should calculate sync stats correctly', () => {
    const { result } = renderHook(() => useSyncEngine());
    act(() => {
      result.current.loadItems(mockItems);
      result.current.syncItem(1, 5.5);
    });
    const stats = result.current.getSyncStats();
    expect(stats.total).toBe(3);
    expect(stats.synced).toBe(1);
    expect(stats.percentage).toBe(33);
  });
});
```

### Étape 4.6 : Tests pour useExport

**Fichier :** `tests/hooks/useExport.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from '@/hooks/useExport';
import { LyricLine } from '@/types';

describe('useExport', () => {
  const mockLyrics: LyricLine[] = [
    { id: 1, text: 'Line 1', timestamp: 5.5, isSynced: true, isEditing: false },
    { id: 2, text: 'Line 2', timestamp: null, isSynced: false, isEditing: false },
    { id: 3, text: 'Line 3', timestamp: 10.25, isSynced: true, isEditing: false },
  ];

  it('should export only synced lyrics to JSON', () => {
    const { result } = renderHook(() => useExport());
    const json = result.current.exportJSON(mockLyrics);
    const parsed = JSON.parse(json);
    
    // Updated structure: { lyrics: [...], chords?: [...] }
    expect(parsed.lyrics).toHaveLength(2);
    expect(parsed.lyrics[0].text).toBe('Line 1');
    expect(parsed.lyrics[1].text).toBe('Line 3');
  });

  it('should export combined lyrics and chords', () => {
    const { result } = renderHook(() => useExport());
    const mockChords = [{ id: 'c1', timestamp: 5.5, chords: [{ root: 'C', label: 'C', quality: '' }], isSynced: true }];
    
    // @ts-ignore - mock setup for combined
    const output = result.current.combinedToExport(mockLyrics, mockChords);
    expect(output.lyrics).toHaveLength(2);
    expect(output.chords).toHaveLength(1);
    expect(output.chords![0].chords[0].root).toBe('C');
  });

  it('should export lyrics sorted by timestamp', () => {
    const { result } = renderHook(() => useExport());
    const json = result.current.exportJSON(mockLyrics);
    const parsed = JSON.parse(json);
    expect(parsed.lyrics[0].time).toBeLessThan(parsed.lyrics[1].time);
  });

  it('should export to LRC format', () => {
    const { result } = renderHook(() => useExport());
    const lrc = result.current.exportLRC(mockLyrics);
    expect(lrc).toContain('[00:05.50]Line 1');
    expect(lrc).toContain('[00:10.25]Line 3');
  });

  it('should throw error when no synced lyrics', () => {
    const { result } = renderHook(() => useExport());
    const unsyncedLyrics = mockLyrics.map(l => ({ ...l, isSynced: false, timestamp: null }));
    expect(() => result.current.quickExport(unsyncedLyrics, 'json')).toThrow();
  });

  it('should generate correct filename', () => {
    const { result } = renderHook(() => useExport());
    const filename = result.current.generateFilename('json', mockLyrics);
    expect(filename).toMatch(/\.json$/);
    expect(filename).toContain(new Date().toISOString().slice(0, 10));
  });

  it('should calculate export stats', () => {
    const { result } = renderHook(() => useExport());
    const stats = result.current.getExportStats(mockLyrics);
    expect(stats.total).toBe(3);
    expect(stats.synced).toBe(2);
    expect(stats.percentage).toBe(67);
  });
});
```

### Étape 4.7 : Tests pour les utils

**Fichier :** `tests/utils/formatTime.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatTime, parseTimestamp } from '@/utils/formatTime';

describe('formatTime', () => {
  it('should format 0 seconds', () => {
    expect(formatTime(0)).toBe('00:00.00');
  });

  it('should format seconds with padding', () => {
    expect(formatTime(5)).toBe('00:05.00');
  });

  it('should format minutes and seconds', () => {
    expect(formatTime(65.5)).toBe('01:05.50');
  });

  it('should format centiseconds', () => {
    expect(formatTime(12.345)).toBe('00:12.35'); // Rounded
  });

  it('should handle large values', () => {
    expect(formatTime(3599.99)).toBe('59:59.99');
  });
});

describe('parseTimestamp', () => {
  it('should parse mm:ss.cc format', () => {
    expect(parseTimestamp('01:30.50')).toBe(90.5);
  });

  it('should parse seconds only', () => {
    expect(parseTimestamp('45.5')).toBe(45.5);
  });

  it('should return null for invalid format', () => {
    expect(parseTimestamp('invalid')).toBeNull();
  });

  it('should handle edge cases', () => {
    expect(parseTimestamp('00:00.00')).toBe(0);
    expect(parseTimestamp('')).toBeNull();
  });
});
```

### Étape 4.7bis : Tests pour les accords et la notation

**Fichier :** `tests/utils/parseChords.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { parseChords } from '@/utils/parseChords';
import { translateChord } from '@/utils/chordNotation';

describe('parseChords', () => {
  it('should parse simple chords', () => {
    const [line] = parseChords('C D E');
    expect(line.chords[0].root).toBe('C');
    expect(line.chords[1].root).toBe('D');
  });

  it('should parse slash chords', () => {
    const [line] = parseChords('C/E G/B');
    expect(line.chords[0].root).toBe('C');
    expect(line.chords[0].bass).toBe('E');
    expect(line.chords[1].root).toBe('G');
    expect(line.chords[1].bass).toBe('B');
  });

  it('should parse complex qualities', () => {
    const [line] = parseChords('Gmaj7 F#m7b5 Cadd9');
    expect(line.chords[0].quality).toBe('maj7');
    expect(line.chords[1].root).toBe('F#');
    expect(line.chords[1].quality).toBe('m7b5');
    expect(line.chords[2].quality).toBe('add9');
  });
});

describe('translateChord', () => {
  const cMaj: any = { label: 'C', root: 'C', quality: '' };
  const g7: any = { label: 'G7', root: 'G', quality: '7' };
  const am: any = { label: 'Am', root: 'A', quality: 'm' };

  it('should translate to Latin', () => {
    expect(translateChord(cMaj, 'latin')).toBe('Do');
    expect(translateChord(g7, 'latin')).toBe('Sol7');
  });

  it('should translate to Numerical (Nashville)', () => {
    // Key = C
    expect(translateChord(cMaj, 'numerical', 'C')).toBe('1');
    expect(translateChord(g7, 'numerical', 'C')).toBe('57');
    expect(translateChord(am, 'numerical', 'C')).toBe('6m');
  });
});
```
```

### Étape 4.8 : Tests UI avec React Testing Library

**Fichier :** `tests/components/LyricsList.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LyricsList from '@/components/LyricsList';
import { LyricLine } from '@/types';

describe('LyricsList', () => {
  const mockLyrics: LyricLine[] = [
    { id: 1, text: 'First line', timestamp: null, isSynced: false, isEditing: false },
    { id: 2, text: 'Second line', timestamp: 5.5, isSynced: true, isEditing: false },
  ];

  const defaultProps = {
    lyrics: mockLyrics,
    selectedLineId: null,
    onSelectLine: vi.fn(),
    onClearTimestamp: vi.fn(),
    onUpdateTimestamp: vi.fn(),
    onUpdateLineText: vi.fn(),
    onDeleteLine: vi.fn(),
  };

  it('should render all lyrics', () => {
    render(<LyricsList {...defaultProps} />);
    expect(screen.getByText('First line')).toBeInTheDocument();
    expect(screen.getByText('Second line')).toBeInTheDocument();
  });

  it('should show synced indicator for synced lines', () => {
    render(<LyricsList {...defaultProps} />);
    const syncedLine = screen.getByText('Second line').closest('div');
    expect(syncedLine).toHaveClass('lyric-line--synced');
  });

  it('should call onSelectLine when clicking a line', async () => {
    const user = userEvent.setup();
    render(<LyricsList {...defaultProps} />);
    await user.click(screen.getByText('First line'));
    expect(defaultProps.onSelectLine).toHaveBeenCalledWith(1);
  });

  it('should highlight selected line', () => {
    render(<LyricsList {...defaultProps} selectedLineId={1} />);
    const selectedLine = screen.getByText('First line').closest('div');
    expect(selectedLine).toHaveClass('lyric-line--selected');
  });

  it('should show empty state when no lyrics', () => {
    render(<LyricsList {...defaultProps} lyrics={[]} />);
    expect(screen.getByText(/Aucune lyric/i)).toBeInTheDocument();
  });

  it('should call onClearTimestamp when clearing', async () => {
    const user = userEvent.setup();
    render(<LyricsList {...defaultProps} />);
    // Find and click the clear button for the synced line
    const clearButtons = screen.getAllByRole('button');
    // ... test logic
  });
});
```

### Étape 4.9 : Ajouter les scripts de test au package.json

**Fichier :** `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

---

## PHASE 5 : STRUCTURE DES FICHIERS FINALE

### Arborescence recommandée après refactorisation

```
synced_lyrics_maker/
├── app/
│   ├── globals.css          # Styles globaux + glass effect
│   ├── layout.tsx           # Layout racine
│   └── page.tsx             # Page principale avec workflow
│
├── components/
│   ├── ui/                  # Composants shadcn générés automatiquement
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   ├── slider.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   └── tooltip.tsx
│   │
│   ├── workflow/            # Composants du workflow multi-étapes
│   │   ├── StepIndicator.tsx
│   │   ├── StepInput.tsx
│   │   ├── StepSync.tsx
│   │   └── StepExport.tsx
│   │
│   ├── audio/               # Composants liés à l'audio
│   │   └── AudioPlayer.tsx
│   │
│   ├── lyrics/              # Composants liés aux paroles
│   │   ├── LyricsInput.tsx
│   │   ├── LyricsList.tsx
│   │   └── LyricLine.tsx    # Composant isolé pour une ligne
│   │
│   ├── chords/              # Composants liés aux accords (NOUVEAU)
│   │   ├── ChordsInput.tsx
│   │   ├── ChordsList.tsx
│   │   └── ChordLine.tsx
│   │
│   ├── sync/                # Composants de synchronisation
│   │   └── CombinedView.tsx # Vue combinée lyrics + chords
│   │
│   ├── export/              # Composants d'export
│   │   └── ExportPanel.tsx
│   │
│   ├── preview/             # Composants de prévisualisation
│   │   ├── PreviewModal.tsx
│   │   ├── CurrentDisplay.tsx
│   │   └── PreviewControls.tsx
│   │
│   └── shared/              # Composants partagés
│       ├── HelpModal.tsx
│       └── ShortcutsHints.tsx
│
├── hooks/
│   ├── useAudio.ts          # Gestion audio
│   ├── useSyncEngine.ts     # Logique mutualisée de sync (NOUVEAU)
│   ├── useLyrics.ts         # Refactorisé avec useSyncEngine
│   ├── useChords.ts         # Gestion des accords (NOUVEAU)
│   ├── useLyricsSync.ts     # Sync pour preview
│   ├── useExport.ts         # Étendu pour accords
│   └── useWorkflow.ts       # Gestion du workflow (NOUVEAU)
│
├── utils/
│   ├── formatTime.ts
│   ├── parseLyrics.ts
│   ├── parseChords.ts       # Parser d'accords (NOUVEAU)
│   ├── lrcSerializer.ts
│   ├── jsonSerializer.ts
│   ├── chordsSerializer.ts  # Export accords (NOUVEAU)
│   └── detectChorus.ts
│
├── types/
│   └── index.ts             # Étendu avec types chords + workflow
│
├── lib/
│   └── utils.ts             # Fonction cn() pour shadcn
│
├── tests/
│   ├── setup.ts
│   ├── hooks/
│   │   ├── useSyncEngine.test.ts
│   │   ├── useAudio.test.ts
│   │   ├── useLyrics.test.ts
│   │   ├── useChords.test.ts
│   │   └── useExport.test.ts
│   ├── utils/
│   │   ├── formatTime.test.ts
│   │   ├── parseLyrics.test.ts
│   │   ├── parseChords.test.ts
│   │   └── serializers.test.ts
│   └── components/
│       ├── LyricsList.test.tsx
│       ├── ChordsList.test.tsx
│       └── ExportPanel.test.tsx
│
├── vitest.config.ts         # Configuration Vitest
├── components.json          # Configuration shadcn (auto-généré)
└── package.json
```

---

## PHASE 6 : POLISH & FINALISATION

### Étape 6.1 : Responsive design

**Vérifications sur mobile :**
- Le workflow doit fonctionner avec un layout vertical
- Les boutons doivent être assez grands pour le touch
- Les modales doivent être plein écran sur mobile
- La liste de lyrics doit être scrollable facilement

**Breakpoints recommandés :**
```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg - layout 2 colonnes */ }
@media (min-width: 1280px) { /* xl */ }
```

### Étape 6.2 : Accessibilité

**Améliorations à apporter :**
- Ajouter des `aria-label` sur tous les boutons avec icônes
- Navigation au clavier dans le workflow (Tab, Enter, Escape)
- Focus visible sur tous les éléments interactifs
- Contraste suffisant pour le texte sur fond glass
- Screen reader support pour les changements d'état

```tsx
// Exemple d'amélioration accessibilité:
<Button
  aria-label="Synchroniser la ligne sélectionnée"
  aria-pressed={isSynced}
  aria-disabled={!canSync}
>
  Sync
</Button>
```

### Étape 6.3 : Performance

**Optimisations recommandées :**

1. **Lazy loading des composants par étape :**
```tsx
const StepInput = React.lazy(() => import('@/components/workflow/StepInput'));
const StepSync = React.lazy(() => import('@/components/workflow/StepSync'));
const StepExport = React.lazy(() => import('@/components/workflow/StepExport'));
```

2. **Mémoisation des callbacks avec useCallback** (déjà en place)

3. **Éviter les re-renders avec React.memo :**
```tsx
export const LyricLine = React.memo(function LyricLine({ ... }) {
  // ...
});
```

4. **Virtualisation pour les longues listes :**
```bash
pnpm add @tanstack/react-virtual
```

### Étape 6.4 : Documentation du code

**Ajouter des commentaires JSDoc sur :**
- Tous les hooks
- Les fonctions utilitaires
- Les composants complexes
- Les types

```typescript
/**
 * Hook de synchronisation générique utilisé comme base par useLyrics et useChords.
 * Fournit les opérations CRUD et de synchronisation communes.
 * 
 * @template T - Type qui étend SyncableItem
 * @param options - Options d'initialisation
 * @returns Objet contenant l'état et les méthodes de manipulation
 * 
 * @example
 * const engine = useSyncEngine<LyricLine>();
 * engine.syncItem(1, 5.5);
 */
export function useSyncEngine<T extends SyncableItem>(options: UseSyncEngineOptions<T> = {}) {
  // ...
}
```

---

## CONSIDÉRATIONS SUPPLÉMENTAIRES

### 1. Design "Liquid Glass" avec shadcn/ui

**Oui, c'est totalement possible !**

shadcn/ui est hautement personnalisable car les composants sont copiés dans votre projet. Vous devrez :

1. Modifier les variables CSS dans `globals.css` pour les couleurs de base
2. Ajouter les classes utilitaires pour le glassmorphism (`.glass`, `.glass-card`, etc.)
3. Personnaliser les composants générés dans `components/ui/` pour appliquer l'effet glass

**Caractéristiques du style Apple Liquid Glass :**
- `backdrop-blur-xl` (20-30px de blur)
- `bg-white/10` à `bg-white/20` (transparence)
- `border-white/20` à `border-white/30`
- Ombres douces et diffuses
- Transitions `duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]`
- Dégradés subtils (from-white/15 via-white/5 to-transparent)

### 2. Coexistence lyrics + accords (UX)

**Recommandation :**

Utiliser des onglets (`Tabs` de shadcn) pour basculer entre les vues :

1. **Vue "Paroles"** - Focus synchronisation lyrics (mode par défaut)
2. **Vue "Accords"** - Focus synchronisation accords (si activé)
3. **Vue "Combinée"** - Aperçu final avec les deux superposés

**Workflow utilisateur suggéré :**
1. Charger l'audio
2. Charger les paroles (obligatoire)
3. Optionnellement charger les accords
4. Synchroniser les paroles EN PREMIER (car les accords peuvent s'y référer)
5. Synchroniser les accords (en les liant optionnellement aux lignes de paroles)
6. Prévisualiser en mode combiné
7. Exporter

### 3. Mutualisation de la logique de sync

Le hook `useSyncEngine` est la clé pour éviter la duplication de code.

**Architecture :**
```
useSyncEngine (logique générique)
    ├── useLyrics (extends + text specifics)
    └── useChords (extends + chord specifics)
```

Cela permet :
- Un seul endroit pour la logique de sync/select/clear
- Tests plus simples (tester useSyncEngine une fois)
- Cohérence entre lyrics et chords
- Facilité d'extension future (ex: annotations, sections...)

### 4. Complexité estimée par phase

| Phase | Description | Estimation |
|-------|-------------|------------|
| **Phase 0** | Setup shadcn + Glass CSS | 1-2h |
| **Phase 1** | Workflow multi-étapes | 4-5h |
| **Phase 2** | Migration composants shadcn | 3-4h |
| **Phase 3** | Synchronisation accords | 6-8h |
| **Phase 4** | Tests unitaires + UI | 4-5h |
| **Phase 5** | Réorganisation fichiers | 1-2h |
| **Phase 6** | Polish & accessibilité | 2-3h |
| **TOTAL** | | **21-29h** |

**En pratique :**
- 3-4 jours de travail concentré
- 1 semaine si réparti avec d'autres tâches

### 5. Ordre d'implémentation recommandé

1. **Phase 0** en premier (shadcn/ui est une base nécessaire)
2. **Phase 2** ensuite (migrer les composants existants)
3. **Phase 1** après (workflow utilise les nouveaux composants)
4. **Phase 3** (accords, la feature principale)
5. **Phase 4** (tests, idéalement en parallèle de la Phase 3)
6. **Phases 5 et 6** en dernier (polish)

---

## CHECKPOINTS DE VALIDATION

### ✓ Après Phase 0
- [ ] shadcn/ui initialisé et configuré
- [ ] Composants de base installés (Button, Card, Tabs, etc.)
- [ ] Styles glass fonctionnels
- [ ] framer-motion installé

### ✓ Après Phase 1
- [ ] Workflow 3 étapes navigable
- [ ] Transitions fluides entre étapes
- [ ] Conditions de passage validées
- [ ] StepIndicator cliquable et visuel

### ✓ Après Phase 2
- [ ] Tous les composants migrent vers shadcn
- [ ] Look & feel cohérent "liquid glass"
- [ ] Toutes les fonctionnalités existantes préservées

### ✓ Après Phase 3
- [ ] ChordsInput fonctionnel
- [ ] ChordsList avec sélection/sync
- [ ] Vue combinée lyrics + chords
- [ ] Export JSON des accords
- [ ] Export combiné

### ✓ Après Phase 4
- [ ] Tests hooks passent (useSyncEngine, useExport, etc.)
- [ ] Tests utils passent (formatTime, parsers, serializers)
- [ ] Tests composants passent
- [ ] Coverage > 70%

### ✓ Après Phase 5 & 6
- [ ] Structure de fichiers propre
- [ ] Code commenté
- [ ] Responsive OK
- [ ] Accessibilité vérifiée
- [ ] Performance acceptable

---

## RESSOURCES UTILES

**Documentation :**
- shadcn/ui : https://ui.shadcn.com/docs
- framer-motion : https://www.framer.com/motion/
- Vitest : https://vitest.dev/
- React Testing Library : https://testing-library.com/docs/react-testing-library/intro/

**Inspirations design Apple Liquid Glass :**
- Apple Human Interface Guidelines
- Glassmorphism CSS generators
- Tailwind Glass components

**Références techniques :**
- Format des accords : https://en.wikipedia.org/wiki/Chord_notation
- LRC Format : https://en.wikipedia.org/wiki/LRC_(file_format)

---

## CONCLUSION

Ce guide vous fournit une feuille de route complète pour la partie 2 de votre POC.

**Points clés à retenir :**

1. **Commencer par shadcn/ui** - C'est la fondation de tout le reste
2. **Le hook useSyncEngine est central** - Il évite la duplication et simplifie les tests
3. **Le workflow améliore grandement l'UX** - Focus utilisateur à chaque étape
4. **Les tests sont essentiels** - Pour la fiabilité du moteur de sync
5. **Le design glass est faisable** - shadcn est entièrement personnalisable

Bonne continuation ! 🎵🎸

