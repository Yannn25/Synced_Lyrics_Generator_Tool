import { describe, expect, it } from "vitest";
import { extractChords, extractMetadata, parseChordPro } from "@/utils/parseChordPro";

describe("parseChordPro", () => {
  it("parse les directives metadata connues", () => {
    const text = ["{title: Amazing Grace}", "{key: D}", "{time: 6/8}", "{bpm: 72}"].join("\n");
    const meta = extractMetadata(text);

    expect(meta).toMatchObject({
      title: "Amazing Grace",
      key: "D",
      timeSignature: "6/8",
      bpm: 72,
    });
  });

  it("ignore les lignes vides/directives et conserve la section sur les lignes parsees", () => {
    const text = [
      "{key: C}",
      "",
      "{Verse}",
      "[C]Amazing [G]Grace",
      "How sweet the [Am]sound",
    ].join("\n");

    const lines = parseChordPro(text);

    expect(lines).toHaveLength(2);
    expect(lines[0].section).toBe("Verse");
    expect(lines[0].strippedText).toBe("Amazing Grace");
    expect(lines[0].chords).toHaveLength(2);
    expect(lines[1].strippedText).toBe("How sweet the sound");
    expect(lines[1].chords).toHaveLength(1);
  });

  it("retourne le texte nettoye et les positions d'accords", () => {
    const parsed = extractChords("[C]Hello [G]World");

    expect(parsed.strippedText).toBe("Hello World");
    expect(parsed.chords).toEqual([
      { symbol: "C", index: 0 },
      { symbol: "G", index: 6 },
    ]);
  });
});


