import { describe, expect, it } from "vitest";
import { isSectionHeader } from "@/utils/sections";

describe("sections", () => {
  it("considere [Verse] et {Chorus} comme des headers de section", () => {
    expect(isSectionHeader("[Verse]")).toBe(true);
    expect(isSectionHeader("{Chorus}")).toBe(true);
  });

  it("ne considere pas les lignes d'accords comme des headers", () => {
    expect(isSectionHeader("[C]")).toBe(false);
    expect(isSectionHeader("[Am]")).toBe(false);
    expect(isSectionHeader("[G/B]")).toBe(false);
    expect(isSectionHeader("[Do]")).toBe(false);
  });
});

