"use client";

import React from "react";
import Link from "next/link";

/**
 * Header - Composant d'en-tête de l'application
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-6 md:px-10">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-darkest via-primary-dark to-primary md:text-3xl">
            Synced Lyrics Maker
          </h1>
        </Link>
      </div>
    </header>
  );
}

