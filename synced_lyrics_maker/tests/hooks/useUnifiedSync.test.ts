import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useUnifiedSync } from "@/hooks/useUnifiedSync";

describe("useUnifiedSync", () => {
  const sampleContent = [
	"{Verse}",
	"[C]Amazing [G]Grace",
	"How sweet the [Am]sound",
  ].join("\n");

  it("charge le contenu ChordPro et selectionne la premiere ligne", () => {
	const { result } = renderHook(() => useUnifiedSync());

	act(() => {
	  result.current.loadContent(sampleContent);
	});

	expect(result.current.lines).toHaveLength(2);
	expect(result.current.selectedLineId).toBe(result.current.lines[0].id);
	expect(result.current.lines[0].section).toBe("Verse");
  });

  it("sync une ligne et auto-avance vers la prochaine non synchronisee", () => {
	const { result } = renderHook(() => useUnifiedSync());

	act(() => {
	  result.current.loadContent(sampleContent);
	});

	const firstId = result.current.lines[0].id;
	const secondId = result.current.lines[1].id;

	act(() => {
	  result.current.syncLine(firstId, 1.25);
	});

	expect(result.current.lines[0].isSynced).toBe(true);
	expect(result.current.lines[0].timestamp).toBe(1.25);
	expect(result.current.selectedLineId).toBe(secondId);
  });

  it("met a jour le contenu d'une ligne et ses accords derives", () => {
	const { result } = renderHook(() => useUnifiedSync());

	act(() => {
	  result.current.loadContent(sampleContent);
	});

	const targetId = result.current.lines[1].id;

	act(() => {
	  result.current.updateLineContent(targetId, "[Dm]Nouveau [G]texte");
	});

	const updated = result.current.lines.find((line) => line.id === targetId);
	expect(updated?.strippedText).toBe("Nouveau texte");
	expect(updated?.chords).toHaveLength(2);
  });

  it("efface un timestamp et met a jour les stats", () => {
	const { result } = renderHook(() => useUnifiedSync());

	act(() => {
	  result.current.loadContent(sampleContent);
	});

	const firstId = result.current.lines[0].id;

	act(() => {
	  result.current.syncLine(firstId, 2);
	  result.current.clearTimestamp(firstId);
	});

	const line = result.current.lines.find((item) => item.id === firstId);
	expect(line?.timestamp).toBeNull();
	expect(line?.isSynced).toBe(false);
	expect(result.current.syncStats()).toMatchObject({ total: 2, synced: 0, percentage: 0 });
  });

  it("conserve les timestamps lors d'un reparse meme apres modification du contenu", () => {
	const { result } = renderHook(() => useUnifiedSync());

	act(() => {
	  result.current.loadContent(sampleContent);
	});

	const firstId = result.current.lines[0].id;
	const secondId = result.current.lines[1].id;

	act(() => {
	  result.current.syncLine(firstId, 1.2);
	  result.current.syncLine(secondId, 3.4);
	  result.current.loadContent("{Verse}\nTexte totalement change\nAutre ligne");
	});

	expect(result.current.lines[0].timestamp).toBe(1.2);
	expect(result.current.lines[1].timestamp).toBe(3.4);
	expect(result.current.lines[0].isSynced).toBe(true);
	expect(result.current.lines[1].isSynced).toBe(true);
  });

  it("auto-avance vers une ligne non synchronisee precedente quand aucune suivante n'existe", () => {
	const { result } = renderHook(() => useUnifiedSync());

	act(() => {
	  result.current.loadContent(sampleContent);
	});

	const firstId = result.current.lines[0].id;
	const secondId = result.current.lines[1].id;

	act(() => {
	  result.current.syncLine(firstId, 1);
	  result.current.selectLine(secondId);
	  result.current.clearTimestamp(firstId);
	  result.current.syncLine(secondId, 2);
	});

	expect(result.current.selectedLineId).toBe(firstId);
  });
});


