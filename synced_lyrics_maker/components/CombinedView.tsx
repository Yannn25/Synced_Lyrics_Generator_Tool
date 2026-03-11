'use client';

import React, { useMemo } from 'react';
import { Music, FileText, Guitar, AlertCircle } from 'lucide-react';
import { CombinedViewProps, LyricLine, ChordLine, ChordNotation } from '@/types';
import { formatTime } from '@/utils/formatTime';
import { translateChord } from '@/utils/chordNotation';

// Composants shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


// ═══════════════════════════════════════════════════════
// TYPES INTERNES
// ═══════════════════════════════════════════════════════

/** Paire lyric + chord(s) alignée par proximité de timestamp */
interface CombinedRowData {
  lyric: LyricLine | null;
  chord: ChordLine | null;
  /** true si l'association est approximative (écart > seuil) */
  approximate: boolean;
}

// Seuil (en secondes) au-delà duquel on considère l'association "approximative"
const APPROX_THRESHOLD = 2;

// ═══════════════════════════════════════════════════════
// LOGIQUE D'ALIGNEMENT LYRICS <-> CHORDS
// ═══════════════════════════════════════════════════════

/**
 * Aligne les lyrics et les chords par proximité de timestamp.
 *
 * Stratégie :
 * 1. On trie lyrics et chords par timestamp (les non-synchronisés vont en fin de liste).
 * 2. Pour chaque lyric synchronisé, on cherche le chord synchronisé le plus proche.
 * 3. Si l'écart est inférieur au seuil, on les groupe.
 * 4. Les éléments non-appariés ou non-synchronisés sont ajoutés séparément.
 */
function alignLyricsAndChords(
  lyrics: LyricLine[],
  chords: ChordLine[],
): CombinedRowData[] {
  const rows: CombinedRowData[] = [];

  // Sépare synced / non-synced
  const syncedLyrics = lyrics
    .filter((l) => l.isSynced && l.timestamp !== null)
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  const unsyncedLyrics = lyrics.filter((l) => !l.isSynced || l.timestamp === null);

  const syncedChords = chords
    .filter((c) => c.isSynced && c.timestamp !== null)
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  const unsyncedChords = chords.filter((c) => !c.isSynced || c.timestamp === null);

  // Track quels chords ont déjà été utilisés
  const usedChordIds = new Set<number>();

  // Pour chaque lyric synchronisé, cherche le chord le plus proche
  for (const lyric of syncedLyrics) {
    const lyricTime = lyric.timestamp!;

    let bestChord: ChordLine | null = null;
    let bestDist = Infinity;

    for (const chord of syncedChords) {
      if (usedChordIds.has(chord.id)) continue;
      const dist = Math.abs(lyricTime - chord.timestamp!);
      if (dist < bestDist) {
        bestDist = dist;
        bestChord = chord;
      }
    }

    if (bestChord && bestDist <= APPROX_THRESHOLD) {
      usedChordIds.add(bestChord.id);
      rows.push({
        lyric,
        chord: bestChord,
        approximate: bestDist > 0.5,
      });
    } else {
      rows.push({ lyric, chord: null, approximate: false });
    }
  }

  // Chords synchronisés non-appariés
  for (const chord of syncedChords) {
    if (!usedChordIds.has(chord.id)) {
      rows.push({ lyric: null, chord, approximate: false });
    }
  }

  // Trie les rows par timestamp (le plus petit entre lyric et chord)
  rows.sort((a, b) => {
    const tA = a.lyric?.timestamp ?? a.chord?.timestamp ?? Infinity;
    const tB = b.lyric?.timestamp ?? b.chord?.timestamp ?? Infinity;
    return tA - tB;
  });

  // Ajoute les non-synchronisés à la fin (lyrics puis chords)
  for (const lyric of unsyncedLyrics) {
    rows.push({ lyric, chord: null, approximate: false });
  }
  for (const chord of unsyncedChords) {
    rows.push({ lyric: null, chord, approximate: false });
  }

  return rows;
}

// ═══════════════════════════════════════════════════════
// COMPOSANT COMBINED VIEW
// ═══════════════════════════════════════════════════════

/**
 * CombinedView - Vue partition : accords au-dessus des paroles
 *
 * Affiche une vue unifiée lyrics + chords alignés par timestamp.
 * Permet de voir la cohérence globale de la synchronisation.
 */
const CombinedView: React.FC<CombinedViewProps> = ({
  lyrics,
  chords,
  notation,
  musicalKey,
}) => {
  // Calcul de l'alignement (mémoïsé)
  const rows = useMemo(
    () => alignLyricsAndChords(lyrics, chords),
    [lyrics, chords],
  );

  // Stats
  const syncedLyricsCount = lyrics.filter((l) => l.isSynced).length;
  const syncedChordsCount = chords.filter((c) => c.isSynced).length;
  const pairedCount = rows.filter((r) => r.lyric && r.chord).length;

  return (
    <Card
      className={cn(
        'relative overflow-hidden h-full flex flex-col',
        'bg-slate-900/40 backdrop-blur-xl',
        'border border-white/10',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
      )}
    >
      {/* Reflet glass subtil en haut */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Music className="h-5 w-5 text-amber-400" />
              Vue Combinée
            </CardTitle>

            {/* Stats */}
            <Badge
              variant="outline"
              className="gap-1 bg-amber-500/10 text-amber-400 border-amber-500/30"
            >
              {pairedCount} paire{pairedCount > 1 ? 's' : ''}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]"
            >
              {syncedLyricsCount} lyrics · {syncedChordsCount} accords
            </Badge>
          </div>
        </div>
        <CardDescription>
          Vue partition — accords alignés au-dessus des paroles selon leur timestamp.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          /* État vide */
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aucune donnée à afficher</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Synchronisez des paroles et/ou des accords pour voir la vue combinée.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {rows.map((row, index) => (
              <CombinedRowComponent
                key={`row-${index}`}
                row={row}
                index={index}
                notation={notation}
                musicalKey={musicalKey}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
// SOUS-COMPOSANT : LIGNE COMBINÉE
// ═══════════════════════════════════════════════════════

interface CombinedRowComponentProps {
  row: CombinedRowData;
  index: number;
  notation: ChordNotation;
  musicalKey?: string;
}

/**
 * CombinedRowComponent - Affiche une paire lyric/chord alignée
 *
 * Layout :
 *   [n°] [timestamp]  │  accords (au-dessus)
 *                      │  paroles (en-dessous)
 */
const CombinedRowComponent: React.FC<CombinedRowComponentProps> = ({
  row,
  index,
  notation,
  musicalKey,
}) => {
  const { lyric, chord, approximate } = row;
  const isSyncedPair = lyric !== null && chord !== null;

  // Timestamp à afficher (priorité lyric, sinon chord)
  const timestamp = lyric?.timestamp ?? chord?.timestamp ?? null;

  // Statut de la ligne
  const isBothSynced = !!(lyric?.isSynced && chord?.isSynced);
  const isPartialSync = !!(
    (lyric?.isSynced && !chord) ||
    (chord?.isSynced && !lyric)
  );
  const isUnsynced = !lyric?.isSynced && !chord?.isSynced;

  return (
    <div
      className={cn(
        'group relative rounded-lg border p-3 transition-all duration-200',
        // Fond selon état
        isBothSynced && 'bg-green-500/5 border-green-500/15',
        isPartialSync && 'bg-amber-500/5 border-amber-500/15',
        isUnsynced && 'bg-slate-800/30 border-white/5',
        isSyncedPair && approximate && 'border-dashed',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Numéro + timestamp */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0 w-20">
          <span
            className={cn(
              'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold',
              isBothSynced
                ? 'bg-green-500/20 text-green-400'
                : isPartialSync
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-700/50 text-muted-foreground',
            )}
          >
            {index + 1}
          </span>
          {timestamp !== null ? (
            <span
              className={cn(
                'text-[10px] font-mono px-1.5 py-0.5 rounded',
                isBothSynced
                  ? 'bg-green-500/10 text-green-400/80'
                  : 'bg-slate-700/30 text-muted-foreground/70',
              )}
            >
              {formatTime(timestamp)}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/40">—</span>
          )}
        </div>

        {/* Séparateur vertical */}
        <div
          className={cn(
            'w-px self-stretch min-h-[40px] flex-shrink-0',
            isBothSynced
              ? 'bg-green-500/20'
              : isPartialSync
                ? 'bg-amber-500/20'
                : 'bg-white/5',
          )}
        />

        {/* Contenu : accords + paroles */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Ligne d'accords (au-dessus) */}
          {chord ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <Guitar className="h-3 w-3 text-purple-400/60 flex-shrink-0" />
              {chord.chords.map((c, chordIdx) => (
                <Badge
                  key={`chord-${chord.id}-${chordIdx}`}
                  variant="outline"
                  className={cn(
                    'font-mono text-xs px-2 py-0.5',
                    chord.isSynced
                      ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      : 'bg-slate-700/30 text-foreground/60 border-white/10',
                  )}
                >
                  {translateChord(c, notation, musicalKey)}
                </Badge>
              ))}
              {!chord.isSynced && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 bg-orange-500/10 text-orange-400 border-orange-500/20"
                >
                  non sync
                </Badge>
              )}
            </div>
          ) : lyric ? (
            // Pas d'accord associé — indicateur discret
            <div className="flex items-center gap-1.5 opacity-40">
              <Guitar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] italic text-muted-foreground">
                aucun accord
              </span>
            </div>
          ) : null}

          {/* Ligne de paroles (en-dessous) */}
          {lyric ? (
            <div className="flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-blue-400/60 flex-shrink-0" />
              <span
                className={cn(
                  'text-sm leading-relaxed',
                  lyric.isSynced
                    ? 'text-foreground'
                    : 'text-muted-foreground/60 italic',
                )}
              >
                {lyric.text}
              </span>
              {!lyric.isSynced && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 bg-orange-500/10 text-orange-400 border-orange-500/20"
                >
                  non sync
                </Badge>
              )}
            </div>
          ) : chord ? (
            // Pas de lyric associé — indicateur discret
            <div className="flex items-center gap-1.5 opacity-40">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] italic text-muted-foreground">
                aucune parole
              </span>
            </div>
          ) : null}

          {/* Indicateur d'association approximative */}
          {approximate && (
            <div className="flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3 text-amber-400/60" />
              <span className="text-[9px] text-amber-400/60">
                Association approximative (timestamps proches mais pas identiques)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombinedView;

