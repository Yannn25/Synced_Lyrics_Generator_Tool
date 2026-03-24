import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedLine } from "@/types";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/formatTime";

interface UnifiedLineItemProps {
  line: UnifiedLine;
  isSelected: boolean;
  onSelect: (lineId: number) => void;
  onDelete: (lineId: number) => void;
  onClearTimestamp: (lineId: number) => void;
}

/**
 * Composant pour afficher une ligne unifiée (paroles + accords positionnés)
 * Au style "partition" ou "leadsheet"
 */
export const UnifiedLineItem = React.memo(function UnifiedLineItem({
  line,
  isSelected,
  onSelect,
  onDelete,
  onClearTimestamp,
}: UnifiedLineItemProps) {
  const renderInlineContent = () => {
    const { strippedText, chords } = line;
    if (!chords || chords.length === 0) return strippedText;

    const sortedChords = [...chords].sort((a, b) => a.index - b.index);
    const parts = [];
    let lastIndex = 0;

    sortedChords.forEach((chord, i) => {
      // Text before chord
      if (chord.index > lastIndex) {
        parts.push(strippedText.slice(lastIndex, chord.index));
      }
      // Chord
      parts.push(
        <span key={i} className="text-purple-400 font-bold mx-0.5 text-sm align-text-top">
          [{chord.symbol}]
        </span>
      );
      lastIndex = chord.index;
    });

    // Remaining text
    if (lastIndex < strippedText.length) {
      parts.push(strippedText.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer group",
        "hover:border-primary/50 hover:bg-slate-800/50",
        isSelected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-white/10 bg-slate-900/20"
      )}
      onClick={() => onSelect(line.id)}
    >
      {/* Entête: Section badge + timestamp */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2 items-center flex-wrap flex-1">
          {line.section && (
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              {line.section}
            </Badge>
          )}
        </div>

        {/* Timestamp et actions */}
        <div className="flex items-center gap-2 ml-auto">
          {line.isSynced && line.timestamp !== null && (
            <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
              {formatTime(line.timestamp)}
            </span>
          )}

          {!line.isSynced && (
            <span className="text-xs text-slate-500 px-2 py-1">
              Not synced
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(line.id);
            }}
            title="Supprimer cette ligne"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      </div>

      {/* Affichage des accords et paroles unifiés */}
      <div className="text-base text-white/90 leading-relaxed whitespace-pre-wrap break-words">
        {renderInlineContent()}
      </div>

      {/* Bouton pour effacer le timestamp si synced */}
      {line.isSynced && line.timestamp !== null && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-xs text-slate-400 hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onClearTimestamp(line.id);
          }}
        >
          Clear timestamp
        </Button>
      )}
    </div>
  );
});

