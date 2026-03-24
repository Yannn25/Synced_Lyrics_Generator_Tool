"use client";
import React from "react";
/**
 * Footer - Composant de pied de page de l'application
 */
export default function Footer() {
  return (
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
  );
}
