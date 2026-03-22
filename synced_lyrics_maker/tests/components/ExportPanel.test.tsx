import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExportPanel from "@/components/ExportPanel";
import { LyricLine, UnifiedSong } from "@/types";

describe("ExportPanel", () => {
  const lyrics: LyricLine[] = [
    { id: 1, text: "Line 1", timestamp: 1, isSynced: true, isEditing: false },
  ];

  const metadata: Partial<UnifiedSong> = {
    key: "C",
    bpm: 120,
    timeSignature: "4/4",
    about: "Test song",
  };

  it("desactive les exports quand aucune ligne n'est synchronisee", () => {
    const quickExport = vi.fn();
    const exporter = {
      quickExport,
      getExportStats: vi.fn(() => ({
        total: 1,
        synced: 0,
        percentage: 0,
        totalChords: 0,
        syncedChords: 0,
        chordsPercentage: 0,
        hasChords: false,
      })),
    } as any;

    render(
      <ExportPanel
        lyrics={lyrics}
        exporter={exporter}
        metadata={metadata}
        audioBaseName="my-audio"
        showCard={false}
      />
    );

    expect(screen.getByRole("button", { name: /JSON/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /LRC/i })).toBeDisabled();
    expect(screen.getByText(/Les boutons seront actifs après synchronisation/i)).toBeInTheDocument();
    expect(quickExport).not.toHaveBeenCalled();
  });

  it("propage metadata et audioBaseName dans quickExport", () => {
    const quickExport = vi.fn();
    const exporter = {
      quickExport,
      getExportStats: vi.fn(() => ({
        total: 1,
        synced: 1,
        percentage: 100,
        totalChords: 0,
        syncedChords: 0,
        chordsPercentage: 0,
        hasChords: false,
      })),
    } as any;

    render(
      <ExportPanel
        lyrics={lyrics}
        exporter={exporter}
        metadata={metadata}
        audioBaseName="my-audio"
        showCard={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /JSON/i }));
    fireEvent.click(screen.getByRole("button", { name: /LRC/i }));

    expect(quickExport).toHaveBeenNthCalledWith(1, lyrics, "json", {
      chords: undefined,
      metadata,
      audioBaseName: "my-audio",
    });

    expect(quickExport).toHaveBeenNthCalledWith(2, lyrics, "lrc", {
      audioBaseName: "my-audio",
    });
  });
});

