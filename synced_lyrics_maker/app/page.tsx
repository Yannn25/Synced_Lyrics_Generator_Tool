'use client'

import React, {useCallback, useEffect, useRef, useState} from "react";
import AudioPlayer from "@/components/AudioPlayer";
import LyricsInput from "@/components/LyricsInput";
import LyricsList from "@/components/LyricsList";
import ExportPanel from "@/components/ExportPanel";
import ShortcutsHint from "@/components/ShortcutsHints";
import { useLyrics } from "@/hooks/useLyrics";
import { useAudio } from "@/hooks/useAudio";
import { useExport } from "@/hooks/useExport";

export default function Home() {
  const {
      lyrics,
      selectedLineId,
      loadLyrics,
      selectLine,
      clearTimestamp,
      syncAndAdvance,
  } = useLyrics();

  const audio = useAudio();

  const exporter = useExport();

  // Ref to store the previous timestamp for syncing
  const prevTimeStampRef = useRef<number | null>(null);

  // Main function to sync a line with audioPlayer et lyricInput component
  const handleSyncLine = useCallback(() => {
    if(!audio.isLoaded) {
      return;
    }
    if(!selectedLineId) {
      console.warn('No line selected');
      return;
    }
    const currentTimestamp = audio.getCurrentTimestamp();

    // The new timestamp should be greater than the previous one
    const selectedLine = lyrics.find(line => line.id === selectedLineId);
    const prevLineIndex = lyrics.findIndex(line => line.id === selectedLineId) - 1;
    const prevLine = prevLineIndex >= 0 ? lyrics[prevLineIndex] : null;
    if(prevLine?.timestamp !== null && currentTimestamp <= prevLine?.timestamp) {
      console.warn('Le timestamp doit être supérieur à la ligne précédente');
      return;
    }

    syncAndAdvance(selectedLineId, currentTimestamp);
    prevTimeStampRef.current = currentTimestamp;

  }, [selectedLineId, audio, syncAndAdvance]);

  // EventListener when the touch ENTER is press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if(event.key === 'Enter') {
        event.preventDefault();
        handleSyncLine();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSyncLine]);

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl text-center font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-darkest via-primary-dark to-primary md:text-3xl">
              Synced Lyrics Maker
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="lg:col-span-5 flex flex-col gap-8">
            <AudioPlayer
                audio={audio}
                onSyncLine={handleSyncLine}
                canSync={selectedLineId != null && audio.isLoaded}
            />
            <LyricsInput onLoadLyrics={loadLyrics} />
          </section>

          <section className="lg:col-span-7 flex flex-col gap-8">
            <div className="card">
              <div className="card-header">

                {/* Help button */}
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-700/50 border border-white/10 hover:bg-slate-600/50 hover:border-primary-darkest/50 transition-all flex items-center justify-center text-slate-400 hover:text-primary-dark z-20"
                    title="Aide"
                >
                  <span className="text-sm font-bold">?</span>
                </button>

                {/* Help modal */}
                { showHelp && (
                    <>
                      <div
                          className="fixed inset-0 z-100"
                          onClick={() => setShowHelp(false)}
                      />
                      <div className="absolute top-8 right-0 z-40 w-80 shadow-2xl rounded-xl overflow-hidden bg-slate-800">
                        <div className="relative">
                          <button
                              onClick={() => setShowHelp(false)}
                              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
                          >
                            x
                          </button>
                          <ShortcutsHint />
                        </div>
                      </div>
                    </>
                )}
                <div>
                  <h2 className="card-title">Lyrics</h2>
                  <p className="card-subtitle">
                    Clique sur une ligne pour la sélectionner, puis synchronise la.
                  </p>
                </div>
              </div>
              <div className="card-body">
                <LyricsList
                    lyrics={lyrics}
                    selectedLineId={selectedLineId}
                    onSelectLine={selectLine}
                    onClearTimestamp={clearTimestamp}
                />
              </div>
            </div>

            <ExportPanel
                lyrics={lyrics}
                exporter={exporter}
            />
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-400 md:px-8">
          © 2026 - Synced Lyrics Maker ·{" "}
          <a
            href="https://github.com/Yannn25/Synced_Lyrics_Generator_Tool"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary-darkest hover:text-primary transition-colors underline decoration-primary-darkest/40 underline-offset-4"
          >
            Code Source
          </a>
        </div>
      </footer>
    </div>
  );
}
