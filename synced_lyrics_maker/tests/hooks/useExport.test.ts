import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useExport } from "@/hooks/useExport";
import { LyricLine, UnifiedLine } from "@/types";

describe("useExport", () => {
  const legacyLyrics: LyricLine[] = [
    { id: 1, text: "Premiere", timestamp: 0.5, isSynced: true, isEditing: false },
    { id: 2, text: "Deuxieme", timestamp: 3.2, isSynced: true, isEditing: false },
    { id: 3, text: "Ignoree", timestamp: null, isSynced: false, isEditing: false },
  ];

  const unifiedLyrics: UnifiedLine[] = [
    {
      id: 1,
      originalText: "[C]Premiere",
      strippedText: "Premiere",
      chords: [{ symbol: "C", index: 0 }],
      section: "Verse",
      timestamp: 0.5,
      isSynced: true,
      isInstrumental: false,
    },
    {
      id: 2,
      originalText: "Deuxieme",
      strippedText: "Deuxieme",
      chords: [],
      timestamp: 2,
      isSynced: true,
      isInstrumental: false,
    },
  ];

  beforeEach(() => {
    vi.mocked(URL.createObjectURL).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("genere un JSON unifie canonique { meta, lines } via quickExport", async () => {
    const { result } = renderHook(() => useExport());

    let exportResult: { filename: string; syncedCount: number; syncedChords: number };

    await act(async () => {
      exportResult = result.current.quickExport(unifiedLyrics, "json", {
        audioBaseName: "mon-audio",
        metadata: {
          key: "C",
          bpm: 84,
          timeSignature: "4/4",
          about: "Chant assemblee",
        },
      });
    });

    expect(exportResult!.filename).toBe("mon-audio.json");
    expect(vi.mocked(URL.createObjectURL)).toHaveBeenCalledTimes(1);

    const createObjectUrlMock = vi.mocked(URL.createObjectURL);
    const blobArg = createObjectUrlMock.mock.calls[0][0] as Blob;
    const payload = JSON.parse(await blobArg.text());

    expect(payload.meta).toEqual({
      key: "C",
      bpm: 84,
      timeSignature: "4/4",
      about: "Chant assemblee",
    });
    expect(payload.lines).toHaveLength(2);
    expect(payload.lines[0]).toMatchObject({
      originalText: "[C]Premiere",
      strippedText: "Premiere",
    });
  });

  it("adapte les anciennes LyricLine au contrat JSON unifie", async () => {
    const { result } = renderHook(() => useExport());

    await act(async () => {
      result.current.quickExport(legacyLyrics, "json", {
        audioBaseName: "legacy",
      });
    });

    const createObjectUrlMock = vi.mocked(URL.createObjectURL);
    const blobArg = createObjectUrlMock.mock.calls[0][0] as Blob;
    const payload = JSON.parse(await blobArg.text());

    expect(payload.lines).toHaveLength(3);
    expect(payload.lines[0]).toMatchObject({
      originalText: "Premiere",
      strippedText: "Premiere",
      chords: [],
    });
  });

  it("retourne un nom base sur le fichier audio en LRC", () => {
    const { result } = renderHook(() => useExport());

    const response = result.current.quickExport(legacyLyrics, "lrc", {
      audioBaseName: "my-song",
    });

    expect(response.filename).toBe("my-song.lrc");
  });

  it("leve une erreur quand aucune ligne n'est synchronisee", () => {
    const { result } = renderHook(() => useExport());

    expect(() =>
      result.current.quickExport(
        [{ id: 1, text: "x", timestamp: null, isSynced: false, isEditing: false }],
        "json"
      )
    ).toThrow(/Aucune ligne/);
  });
});


