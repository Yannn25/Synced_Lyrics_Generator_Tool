import React from "react";
import AudioPlayer from "@/components/AudioPlayer";
import LyricsInput from "@/components/LyricsInput";
import LyricsList from "@/components/LyricsList";
import ExportPanel from "@/components/ExportPanel";
import ShortcutsHint from "@/components/ShortcutsHints";

export default function Home() {
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
            <AudioPlayer />
            <LyricsInput />
            <ShortcutsHint />
          </section>

          <section className="lg:col-span-7 flex flex-col gap-8">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Lyrics</h2>
                  <p className="card-subtitle">
                    Clique une ligne pour la sélectionner, puis synchronise.
                  </p>
                </div>
              </div>
              <div className="card-body">
                <LyricsList
                  lyrics={[]}
                  selectedLineId={null}
                  onSelectLine={() => {}}
                  onClearTimestamp={() => {}}
                />
              </div>
            </div>

            <ExportPanel />
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
