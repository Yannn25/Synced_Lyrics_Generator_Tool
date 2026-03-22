# Synced Lyrics Generator Tool - AI Developer Guide

This guide provides the essential context for AI agents to work effectively on this codebase.

## 1. Project Context & Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + `clsx`/`tailwind-merge` (via `cn()` utility)
- **UI Library**: Shadcn/UI (Radix Primitives) + Lucide React icons
- **State Management**: React Hooks (Custom hooks for business logic, lifted state for composition)
- **Root Directory**: The Next.js application lives in `synced_lyrics_maker/`. All commands should be run from there.

## 2. High-Level Architecture
The application is a client-side tool for creating synchronized lyrics (LRC/JSON) from audio and text. It follows a **3-Step Workflow Pattern**:

1.  **Input (`StepInput`)**: User uploads audio and pastes/edits lyrics (supports ChordPro format).
2.  **Sync (`StepSync`)**: User plays audio and taps controls to synchronize lines.
3.  **Export (`StepExport`)**: User downloads the result in various formats.

### Key Architectural Decisions
- **Orchestrator**: `app/page.tsx` holds the high-level state (`currentStep`, `songData`) and composes the steps.
- **Hook-Based Logic**: Business logic is encapsulated in `hooks/` ensuring components remain presentational.
    - `useAudio.ts`: Wraps HTML5 Audio element, handles playback/seeking.
    - `useUnifiedSync.ts`: Manages the list of `UnifiedLine` items and their timestamps.
    - `useWorkflow.ts`: Manages step transitions and validation logic.
- **Unified Data Model**: The app moved from separate Lyrics/Chords to a `UnifiedLine` model (ChordPro style) where chords are embedded in text.

## 3. Core Data Structures (`types/index.ts`)
Understanding these types is critical for any logic changes:
- **`UnifiedLine`**: The atomic unit of the editor. Contains `originalText` (ChordPro), `strippedText` (Display), `chords` (Positions), and `timestamp`.
- **`UnifiedSong`**: Metadata + Raw content string.
- **`WorkflowStep`**: `1 | 2 | 3`.

## 4. Key Directories & Files
- **`synced_lyrics_maker/utils/`**:
    - **Parsers**: `parseChordPro.ts`, `lrcSerializer.ts`. All text transformation logic lives here. **Do not inline parsing logic in components.**
    -  **Formatters**: `formatTime.ts`.
- **`synced_lyrics_maker/components/workflow/`**: Contains the main views for each step (`StepInput`, `StepSync`, `StepExport`).
- **`synced_lyrics_maker/components/ui/`**: Reusable primitives (Shadcn).

## 5. Development Patterns & Conventions
- **Sync Logic**: Synchronization creates a timestamp link between `audio.currentTime` and a `UnifiedLine`. This is manual (user-triggered), not automatic detection.
- **Styling**: Use the `cn()` utility for conditional classes. Example: `className={cn("base-class", condition && "active-class")}`.
- **Refactoring**: When modifying syncing logic, check generic hooks like `useSyncEngine.ts` first, as they are shared across different sync modes.
- **Build**: Run `npm run dev` inside `synced_lyrics_maker/`.

## 6. Common Tasks
- **Adding a new Export Format**:
    1. Create a serializer in `utils/`.
    2. Update `StepExport.tsx` to include the option.
    3. Update `useExport.ts` hook.
- **Modifying Sync Behavior**:
    1. Check `hooks/useUnifiedSync.ts` for state updates.
    2. Check `components/workflow/StepSync.tsx` for key interactions (Enter/Space).

