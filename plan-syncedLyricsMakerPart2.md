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

## PHASE 3 : REFONTE UX - WORKFLOW UNIFIÉ

### Étape 3.1 : Redéfinir le modèle en Input Unifié (ChordPro)

**Objectif :** Simplifier l'expérience utilisateur en fusionnant l'édition des paroles et des accords dans une vue unique de type "ChordPro".

**Format Cible (ChordPro) :**
```text
[Intro]
[C]Amazing [G]Grace, how [Am]sweet the [F]sound

[Verse 1]
[C]Amazing [G]Grace, how [Am]sweet the [F]sound
That [C]saved a [G]wretch like [C]me
```

**Modifications dans `types/index.ts` :**

```typescript
// Interface pour le format unifié
export interface UnifiedSong {
  title: string;
  artist: string;
  bpm: number;
  timeSignature: string; // Ex: "4/4"
  key: string;           // Ex: "C"
  content: string;       // Le texte brut format ChordPro
}

export interface UnifiedLine {
  id: string;
  originalText: string; // La ligne complète avec balises [C]
  strippedText: string; // Le texte sans les accords pour l'affichage Clean
  chords: ChordPosition[];
  section?: string;     // "Verse", "Chorus", ...
  timestamp: number | null;
  isSynced: boolean;
}

export interface ChordPosition {
  symbol: string;
  index: number; // Position dans le strippedText
}
```

### Étape 3.2 : Mise à jour du Parser (Utils)

**Fichier à modifier/créer :** `utils/parseChordPro.ts`

Créer un parser robuste capable de :
1.  Extraire les métadonnées (Title, Artist, Key...) si présentes dans le texte.
2.  Parser les lignes de texte pour séparer les accords des paroles.
3.  Identifier les sections (`[Verse]`, `[Chorus]`, etc.) en Anglais et Français.

**Logique de parsing :**
- Regex pour `[Chord]` -> extraction et calcul de l'index dans le texte nettoyé.
- Regex pour `[Section]` -> assignation d'une métadonnée de section à la ligne suivante ou au groupe.

### Étape 3.3 : Refonte de StepInput (L'Input Unifié)

**Fichier :** `components/workflow/StepInput.tsx`

Restructurer l'écran en 3 blocs verticaux :

**1. Bloc Métadonnées (Haut)**
   - Inputs "Titre" et "Artiste" côte à côte.
   - Sélecteur "Tonalité (Key)" (C, Cm, D, ...).
   - Sélecteur "Signature Temporelle" (3/4, 4/4, 6/8).
   - Input "BPM" (Tempo).

**2. Bloc Éditeur (Centre - Principal)**
   - Un grand `Textarea` (ou éditeur de code simple) pour saisir le texte au format ChordPro.
   - Placeholder explicite montrant l'exemple du format `[Am]`.

**3. Bloc "Accords & Aide" (Bas)**
   - **Détecteur d'accords :** Affiche la liste des accords uniques détectés dans le texte (ex: C, G, Am, F). Use `utils/parseChords` logic to detect them.
   - **Helper :** Boutons rapides pour insérer des accords courants ou des balises de section (`[Verse]`, `[Chorus]`).

### Étape 3.4 : Refonte de StepSync (Outil de Synchro Unique)

**Fichier :** `components/workflow/StepSync.tsx`

Supprimer la distinction "Lyrics" vs "Chords" vs "Both".

**Interface Unifiée :**
- Liste unique scrollable.
- Chaque ligne affiche :
  - Le texte des paroles (taille normale).
  - Les accords positionnés au-dessus des syllabes correspondantes (style partition/leadsheet).
  - Indicateur de section (Badge "Verse 1", "Chorus").
- **Comportement de Synchro :**
  - La logique reste la même (`Espace` pour play, `Entrée` pour timestamp).
  - Le timestamp s'applique à la ligne entière (paroles + accords).

### Étape 3.5 : Mise à jour du Preview

**Fichier :** `components/LyricsPreview/CurrentLyricsDisplay.tsx`

- Mettre à jour l'affichage "Karaoké" pour inclure les accords.
- Si le mode "Afficher les accords" est activé :
  - Afficher l'accord au-dessus du mot courant ou de la syllabe courante.
  - Mettre en évidence l'accord actif en même temps que la ligne/mot.

### Étape 3.6 : Mise à jour de l'Export

**Fichier :** `components/ExportPanel.tsx` & `hooks/useExport.ts`

- Export JSON doit inclure la structure `UnifiedLine` complète.
- Export LRC standard (paroles uniquement pour compatibilité maximale).
- Export ChordPro (le texte brut original).

### Étape 3.7 : Notion de Sections (Intro, Verse, Chorus...)

**Fichier :** `utils/sections.ts` (Nouveau)

- Définir les types de sections supportés : `Intro`, `Verse`, `Chorus`, `Bridge`, `Outro`.
- Support multilingue : `Couplet` = `Verse`, `Refrain` = `Chorus`.
- Fonction utilitaire pour détecter et normaliser les noms de sections.

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

## PHASE 5 : STRUCTURE DES FICHIERS FINALE (REFONTE)

### Arborescence cible

```
synced_lyrics_maker/
├── app/
│   ├── globals.css          # Styles globaux + glass effect
│   ├── layout.tsx
│   └── page.tsx             # Gestionnaire d'état global du Workflow
│
├── components/
│   ├── ui/                  # Composants shadcn
│   │   ├── ...
│   │
│   ├── workflow/            # Les étapes principales
│   │   ├── StepIndicator.tsx
│   │   ├── StepInput.tsx    # Éditeur Unifié (ChordPro)
│   │   ├── StepSync.tsx     # Outil de Synchro Unifié
│   │   └── StepExport.tsx
│   │
│   ├── editor/              # Composants de l'éditeur (NOUVEAU)
│   │   ├── UnifiedInput.tsx # Textarea intelligent
│   │   ├── ChordDetector.tsx
│   │   └── MetadataForm.tsx
│   │
│   ├── sync/                # Composants de synchronisation
│   │   ├── SyncList.tsx     # Liste unifiée (Paroles + Accords)
│   │   └── SyncItem.tsx     # Ligne individuelle
│   │
│   ├── audio/
│   │   └── AudioPlayer.tsx
│   │
│   ├── preview/
│   │   ├── LyricsPreviewModal.tsx
│   │   └── KaraokeDisplay.tsx # Supporte l'affichage des accords
│   │
│   └── shared/
│       ├── HelpModal.tsx
│       └── ShortcutsHints.tsx
│
├── hooks/
│   ├── useAudio.ts
│   ├── useUnifiedWorkflow.ts # Gestion des étapes
│   ├── useUnifiedSong.ts     # Hook principal (CRUD + Sync)
│   ├── useSyncEngine.ts      # Moteur bas niveau (optionnel)
│   └── useExport.ts
│
├── utils/
│   ├── parseChordPro.ts      # Parser principal
│   ├── chordDetection.ts     # Logique de détection
│   ├── formatTime.ts
│   └── serializers/
│       ├── jsonSerializer.ts
│       └── lrcSerializer.ts
│
└── types/
    └── index.ts              # Types UnifiedSong, UnifiedLine
```

---

## PHASE 6 : FINALISATION & NETTOYAGE

### Étape 6.1 : Nettoyage du code obsolète

- Supprimer les anciens fichiers `uils/parseLyrics.ts` et `utils/parseChords.ts` s'ils sont remplacés par `parseChordPro.ts`.
- Supprimer les composants inutilisés (`LyricsInput` version 1, `StepSync` version onglets).

### Étape 6.2 : Polish UI

- Vérifier que le "Glassmorphism" ne nuit pas à la lisibilité des accords.
- Ajouter des animations fluides lors de l'apparition du panneau de détection d'accords.

---

## CONSIDÉRATIONS SUPPLÉMENTAIRES (MISES À JOUR)

### 1. Avantages du format ChordPro

Le passage au format ChordPro (`[C]Lyrics`) simplifie considérablement la gestion de l'état.
Au lieu de maintenir deux listes (Lyrics[] et Chords[]) et de tenter de les synchroniser, vous avez une seule source de vérité (le texte).
Lors de la synchronisation, vous synchronisez une ligne de texte entière.

### 2. Gestion de la synchronisation

Puisque les accords sont intégrés au texte, le timestamp s'applique à la ligne.
Pour l'affichage "Karaoké", il faudra calculer la position relative des accords dans le temps (interpolé) ou simplement les afficher en même temps que la ligne (ce qui est le standard pour les "Lead Sheets").

### 3. Responsive Design

L'input unifié doit prendre toute la largeur disponible.
Sur mobile, le clavier virtuel réduira l'espace visible : assurez-vous que la zone de texte reste scrollable et que le détecteur d'accords ne cache pas le curseur.

---

## CONCLUSION

La refonte vers un workflow unifié (ChordPro) est un excellent choix qui simplifie à la fois le code (une seule structure de données) et l'expérience utilisateur (un seul input à gérer).

Bon courage pour cette refonte ! 🎵

