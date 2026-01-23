import React from "react";
import AudioPlayer from "@/components/AudioPlayer";
import LyricsInput from "@/components/LyricsInput";
import LyricsList    from "@/components/LyricsList";
import ExportPanel from "@/components/ExportPanel";
import ShortcutsHint from "@/components/ShortcutsHints";

export default function Home() {
  return (
      <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="py-4 px-6 shadow bg-[var(--color-primary-lightest)] text-[var(--color-primary-darkest)] text-center font-bold text-4xl mb-12">
          POC Synced Lyrics Maker
        </header>
        <AudioPlayer />
        <LyricsInput />
          {/* <LyricsList /> */}
        <ExportPanel />
        <ShortcutsHint />
        <footer className="py-3 px-6 text-center text-xs text-[var(--color-primary-dark)] bg-[var(--color-primary-lightest)] mt-12">
          © 2026 - Synced Lyrics Maker | <a href="https://github.com/Yannn25/Synced_Lyrics_Generator_Tool" target="_blank" rel="noopener noreferrer" className="underline"> code source</a>
        </footer>
      </div>
  );
}
