/**
 * Tests pour lrcSerializer
 * 
 * OBJECTIF: Vérifier que la sérialisation au format LRC (LyRiCs format)
 * génère un fichier texte conforme au standard LRC utilisé par les lecteurs
 * de karaoké et applications de paroles synchronisées.
 * 
 * FORMAT LRC: 
 * - [MM:SS.xx] Ligne de paroles
 * - Métadonnées: [ti:titre], [ar:artiste], [al:album]
 * - Tri chronologique obligatoire
 * 
 * POURQUOI: Le format LRC est un standard universel pour les paroles
 * synchronisées. Un export incorrect rendrait le fichier inutilisable
 * dans d'autres applications.
 */

import { describe, it, expect } from "vitest";
import { toLRC } from "@/utils/lrcSerializer";
import { UnifiedLine } from "@/types";

describe("lrcSerializer - toLRC", () => {
  /**
   * TEST: Export basique sans métadonnées
   * 
   * WHAT: Vérifier l'export minimal d'une ligne avec timestamp
   * HOW: Créer une ligne simple et vérifier le format [MM:SS.CC]texte
   * WHY: Cas d'usage minimal, doit fonctionner sans métadonnées
   * EXPECTED: Format LRC valide avec timestamp centisecondes (espace entre timestamp et texte)
   */
  it("devrait exporter une ligne basique au format LRC", () => {
    // GIVEN: Une ligne synchronisée à 5.5 secondes
    const lines: UnifiedLine[] = [
      {
        id: 1,
        originalText: "Hello world",
        strippedText: "Hello world",
        chords: [],
        timestamp: 5.5,
        isSynced: true,
      },
    ];

    // WHEN: On sérialise au format LRC
    const result = toLRC(lines);

    // THEN: Le format doit être [00:05.50]Hello world (pas d'espace entre] et texte)
    expect(result).toContain("[00:05.50]Hello world");
  });

  /**
   * TEST: Lignes multiples chronologiques
   * 
   * WHAT: Vérifier l'export de plusieurs lignes dans l'ordre
   * HOW: Créer 3 lignes avec timestamps croissants
   * WHY: Les lecteurs LRC nécessitent un ordre chronologique strict
   * EXPECTED: Lignes exportées dans l'ordre avec timestamps corrects (pas d'espace après])
   */
  it("devrait exporter plusieurs lignes dans l'ordre chronologique", () => {
    // GIVEN: Trois lignes de paroles chronologiques
    const lines: UnifiedLine[] = [
      {
        id: 1,
        originalText: "First line",
        strippedText: "First line",
        chords: [],
        timestamp: 10.0,
        isSynced: true,
      },
      {
        id: 2,
        originalText: "Second line",
        strippedText: "Second line",
        chords: [],
        timestamp: 15.5,
        isSynced: true,
      },
      {
        id: 3,
        originalText: "Third line",
        strippedText: "Third line",
        chords: [],
        timestamp: 25.25,
        isSynced: true,
      },
    ];

    // WHEN: On sérialise au format LRC
    const result = toLRC(lines);

    // THEN: Les trois lignes doivent apparaître dans l'ordre (pas d'espace après])
    expect(result).toContain("[00:10.00]First line");
    expect(result).toContain("[00:15.50]Second line");
    expect(result).toContain("[00:25.25]Third line");
    
    // Vérifier l'ordre dans le résultat
    const firstIndex = result.indexOf("First line");
    const secondIndex = result.indexOf("Second line");
    const thirdIndex = result.indexOf("Third line");
    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });

  /**
   * TEST: Lignes non synchronisées (ignorées)
   * 
   * WHAT: Vérifier que les lignes sans timestamp ne sont pas exportées
   * HOW: Mélanger lignes sync et non-sync, vérifier présence/absence
   * WHY: Le format LRC nécessite des timestamps, lignes non-sync invalides
   * EXPECTED: Seules les lignes avec timestamp valide sont exportées
   */
  it("devrait ignorer les lignes non synchronisées", () => {
    // GIVEN: Lignes mixtes (sync et non-sync)
    const lines: UnifiedLine[] = [
      {
        id: 1,
        originalText: "Synced line",
        strippedText: "Synced line",
        chords: [],
        timestamp: 10.0,
        isSynced: true,
      },
      {
        id: 2,
        originalText: "Unsynced line",
        strippedText: "Unsynced line",
        chords: [],
        timestamp: null,
        isSynced: false,
      },
    ];

    // WHEN: On sérialise au format LRC
    const result = toLRC(lines);

    // THEN: Seule la ligne synchronisée doit être présente
    expect(result).toContain("Synced line");
    expect(result).not.toContain("Unsynced line");
  });

  /**
   * TEST: Accords supprimés du texte exporté
   * 
   * WHAT: Vérifier que les accords ne sont pas exportés dans le LRC
   * HOW: Ligne avec originalText contenant [C] mais strippedText sans
   * WHY: Le format LRC est pour les paroles uniquement, pas les accords
   * EXPECTED: Utiliser strippedText (sans accords) dans l'export (pas d'espace après])
   */
  it("devrait utiliser strippedText (sans accords) pour l'export", () => {
    // GIVEN: Une ligne avec accords dans originalText
    const lines: UnifiedLine[] = [
      {
        id: 1,
        originalText: "[C]Hello [G]world",
        strippedText: "Hello world", // Texte nettoyé
        chords: [
          { symbol: "C", index: 0 },
          { symbol: "G", index: 6 },
        ],
        timestamp: 10.0,
        isSynced: true,
      },
    ];

    // WHEN: On sérialise au format LRC
    const result = toLRC(lines);

    // THEN: Les accords ne doivent pas apparaître (pas d'espace après])
    expect(result).toContain("[00:10.00]Hello world");
    expect(result).not.toContain("[C]");
    expect(result).not.toContain("[G]");
  });

  /**
   * TEST: Conversion précise des timestamps
   * 
   * WHAT: Vérifier la conversion secondes → MM:SS.CC
   * HOW: Tester différentes valeurs (minutes, secondes, centisecondes)
   * WHY: Précision critique pour la synchronisation audio
   * EXPECTED: Format [MM:SS.CC]texte exact avec padding correct (pas d'espace)
   */
  it("devrait convertir correctement les timestamps en format LRC", () => {
    // GIVEN: Lignes avec timestamps variés
    const lines: UnifiedLine[] = [
      { id: 1, originalText: "A", strippedText: "A", chords: [], timestamp: 0, isSynced: true },
      { id: 2, originalText: "B", strippedText: "B", chords: [], timestamp: 5.5, isSynced: true },
      { id: 3, originalText: "C", strippedText: "C", chords: [], timestamp: 65.123, isSynced: true },
      { id: 4, originalText: "D", strippedText: "D", chords: [], timestamp: 125.99, isSynced: true },
    ];

    // WHEN: On sérialise au format LRC
    const result = toLRC(lines);

    // THEN: Timestamps doivent être précis (pas d'espace après])
    expect(result).toContain("[00:00.00]A"); // 0s
    expect(result).toContain("[00:05.50]B"); // 5.5s
    expect(result).toContain("[01:05.12]C"); // 65.123s (arrondi)
    expect(result).toContain("[02:05.99]D"); // 125.99s
  });

  /**
   * TEST: Sections ignorées (métadonnées internes)
   * 
   * WHAT: Vérifier que les marqueurs de section ne sont pas exportés
   * HOW: Ligne avec section="Chorus" ne doit pas affecter l'export
   * WHY: Les sections sont pour l'édition interne, pas pour LRC
   * EXPECTED: Pas de mention de section dans l'export, juste le texte (pas d'espace après])
   */
  it("devrait ignorer les sections (métadonnées internes)", () => {
    // GIVEN: Ligne avec section définie
    const lines: UnifiedLine[] = [
      {
        id: 1,
        originalText: "Chorus line",
        strippedText: "Chorus line",
        chords: [],
        section: "Chorus",
        timestamp: 10.0,
        isSynced: true,
      },
    ];

    // WHEN: On sérialise au format LRC
    const result = toLRC(lines);

    // THEN: La section ne doit pas apparaître (pas d'espace après])
    // Note: Le mot "Chorus" apparaît dans "Chorus line" qui est le texte normal de la ligne
    expect(result).toContain("[00:10.00]Chorus line");
    expect(result).not.toContain("{Chorus}");
    expect(result).not.toContain("[Chorus]");
  });

  /**
   * TEST: Lignes vides synchronisées (pauses)
   * 
   * WHAT: Vérifier la gestion des lignes vides avec timestamp
   * HOW: Ligne avec strippedText vide mais timestamp valide
   * WHY: Les pauses instrumentales peuvent avoir des timestamps
   * EXPECTED: Ligne vide exportée avec timestamp (pause marquée)
   */
  it("devrait gérer les lignes vides synchronisées (pauses)", () => {
    // GIVEN: Une ligne vide synchronisée (pause instrumentale)
    const lines: UnifiedLine[] = [
      {
        id: 1,
        originalText: "",
        strippedText: "",
        chords: [],
        timestamp: 30.0,
        isSynced: true,
      },
    ];

    // WHEN: On sérialise au format LRC
    const result = toLRC(lines);

    // THEN: Le timestamp doit être présent avec ligne vide
    expect(result).toContain("[00:30.00]");
  });

  /**
   * TEST: Tri automatique si désordonné
   * 
   * WHAT: Vérifier que les lignes sont triées par timestamp
   * HOW: Fournir des lignes dans le désordre
   * WHY: Le format LRC exige un ordre chronologique strict
   * EXPECTED: Export trié même si input désordonné
   */
  it("devrait trier les lignes par timestamp croissant", () => {
    // GIVEN: Lignes dans le désordre
    const lines: UnifiedLine[] = [
      { id: 3, originalText: "Third", strippedText: "Third", chords: [], timestamp: 30.0, isSynced: true },
      { id: 1, originalText: "First", strippedText: "First", chords: [], timestamp: 10.0, isSynced: true },
      { id: 2, originalText: "Second", strippedText: "Second", chords: [], timestamp: 20.0, isSynced: true },
    ];

    // WHEN: On sérialise au format LRC
    const result = toLRC(lines);

    // THEN: L'ordre doit être corrigé
    const firstIndex = result.indexOf("First");
    const secondIndex = result.indexOf("Second");
    const thirdIndex = result.indexOf("Third");
    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });
});
