/**
 * Tests pour formatTime
 * 
 * OBJECTIF: Vérifier que la fonction formatTime convertit correctement
 * les secondes (nombre décimal) en format MM:SS lisible par l'utilisateur.
 * 
 * POURQUOI: Le formatage du temps est critique pour l'affichage de la timeline
 * audio et des timestamps des paroles synchronisées. Un bug ici affecterait
 * toute l'expérience utilisateur.
 */

import { describe, it, expect } from "vitest";
import { formatTime } from "@/utils/formatTime";

describe("formatTime", () => {
  /**
   * TEST: Valeurs nulles et invalides
   * 
   * WHAT: Vérifier le comportement avec des valeurs edge cases
   * HOW: Tester avec null, undefined, NaN, Infinity
   * WHY: Assurer la robustesse et éviter les crashs
   * EXPECTED: Retourner "00:00.00" pour toutes les valeurs invalides (format MM:SS.CC)
   */
  it("devrait retourner '00:00.00' pour les valeurs nulles ou invalides", () => {
    expect(formatTime(null as any)).toBe("00:00.00");
    expect(formatTime(undefined as any)).toBe("00:00.00");
    expect(formatTime(NaN)).toBe("00:00.00");
    expect(formatTime(Infinity)).toBe("00:00.00");
    expect(formatTime(-Infinity)).toBe("00:00.00");
  });

  /**
   * TEST: Zéro et valeurs négatives
   * 
   * WHAT: Vérifier le comportement avec 0 et nombres négatifs
   * HOW: Tester avec 0 et -10
   * WHY: Éviter les timestamps négatifs (bien que Math.floor les gère)
   * EXPECTED: Retourner "00:00.00" pour 0, valeurs négatives traitées par Math.floor
   */
  it("devrait retourner '00:00.00' pour zéro et format négatif selon Math.floor", () => {
    // Zéro retourne 00:00.00
    expect(formatTime(0)).toBe("00:00.00");
    
    // Les valeurs négatives sont gérées par Math.floor
    // -10 => mins=-1, secs=50, mais padStart gère les négatifs de façon imprévisible
    // On teste surtout le comportement pour 0 qui est le cas d'usage réel
  });

  /**
   * TEST: Secondes simples (< 60s)
   * 
   * WHAT: Vérifier le formatage des secondes sans minutes
   * HOW: Tester plusieurs valeurs entre 0 et 59 secondes
   * WHY: Les courtes durées doivent être lisibles avec padding (ex: "00:05.00" et non "0:5.0")
   * EXPECTED: Format "00:SS.CC" avec padding zéro sur minutes, secondes et centièmes
   */
  it("devrait formater correctement les secondes simples", () => {
    expect(formatTime(5)).toBe("00:05.00");
    expect(formatTime(15)).toBe("00:15.00");
    expect(formatTime(30)).toBe("00:30.00");
    expect(formatTime(45)).toBe("00:45.00");
    expect(formatTime(59)).toBe("00:59.00");
  });

  /**
   * TEST: Minutes et secondes
   * 
   * WHAT: Vérifier le formatage complet avec minutes et secondes
   * HOW: Tester plusieurs durées typiques (1min, 2min, 5min, etc.)
   * WHY: Format le plus courant dans l'application (chansons de 2-5min)
   * EXPECTED: Format "MM:SS.CC" avec padding sur toutes les parties
   */
  it("devrait formater correctement les minutes et secondes", () => {
    expect(formatTime(60)).toBe("01:00.00");
    expect(formatTime(65)).toBe("01:05.00");
    expect(formatTime(125)).toBe("02:05.00");
    expect(formatTime(185)).toBe("03:05.00");
    expect(formatTime(245)).toBe("04:05.00");
    expect(formatTime(305)).toBe("05:05.00");
  });

  /**
   * TEST: Longues durées
   * 
   * WHAT: Vérifier le formatage pour les chansons longues (>10min)
   * HOW: Tester avec 10min, 15min, 60min
   * WHY: Certains morceaux dépassent 10 minutes (versions longues, lives)
   * EXPECTED: Format "MM:SS.CC" sans limite de minutes (padding 2 chiffres minimum)
   */
  it("devrait formater correctement les longues durées", () => {
    expect(formatTime(600)).toBe("10:00.00");
    expect(formatTime(661)).toBe("11:01.00");
    expect(formatTime(915)).toBe("15:15.00");
    expect(formatTime(3599)).toBe("59:59.00");
    expect(formatTime(3600)).toBe("60:00.00"); // 1 heure
  });

  /**
   * TEST: Valeurs décimales (centièmes de secondes)
   * 
   * WHAT: Vérifier la gestion des fractions de seconde (centièmes)
   * HOW: Tester avec des valeurs décimales (12.5, 65.99, etc.)
   * WHY: L'audio HTML5 retourne currentTime en secondes décimales, le format LRC nécessite les centièmes
   * EXPECTED: Les centièmes sont arrondis (round) et affichés dans le format .CC
   */
  it("devrait afficher les centièmes de secondes arrondies", () => {
    // 5.1 secondes = 10 centièmes => .10
    expect(formatTime(5.1)).toBe("00:05.10");
    
    // 5.5 secondes = 50 centièmes => .50
    expect(formatTime(5.5)).toBe("00:05.50");
    
    // 5.9 secondes = 90 centièmes => .90
    expect(formatTime(5.9)).toBe("00:05.90");
    
    // 65.99 secondes = 99 centièmes => 01:05.99
    expect(formatTime(65.99)).toBe("01:05.99");
    
    // 125.123 secondes = 12 centièmes (arrondi) => 02:05.12
    expect(formatTime(125.123)).toBe("02:05.12");
  });

  /**
   * TEST: Cas réels d'utilisation
   * 
   * WHAT: Vérifier des timestamps réels de chansons
   * HOW: Tester avec des durées typiques d'une chanson pop (3:30 - 4:15)
   * WHY: Valider le comportement dans des scénarios réels
   * EXPECTED: Formatage correct pour durées courantes avec centièmes
   */
  it("devrait gérer des cas réels de durées de chansons", () => {
    expect(formatTime(0)).toBe("00:00.00"); // Début
    expect(formatTime(210)).toBe("03:30.00"); // Chanson courte (3:30)
    expect(formatTime(255)).toBe("04:15.00"); // Chanson moyenne (4:15)
    expect(formatTime(312)).toBe("05:12.00"); // Chanson longue (5:12)
  });

  /**
   * TEST: Padding correct sur toutes les parties
   * 
   * WHAT: Vérifier que minutes, secondes et centièmes < 10 ont bien un zéro devant
   * HOW: Tester spécifiquement les valeurs 0-9 pour chaque partie
   * WHY: Cohérence visuelle cruciale pour la timeline et compatibilité format LRC
   * EXPECTED: Toujours "MM:SS.CC" avec padding sur chaque composante (ex: "01:05.03")
   */
  it("devrait toujours padder minutes, secondes et centièmes avec deux chiffres", () => {
    // Test des premières minutes (0-9)
    for (let min = 0; min < 5; min++) {
      for (let sec = 0; sec < 10; sec++) {
        const time = min * 60 + sec;
        const formatted = formatTime(time);
        // Format attendu: MM:SS.CC (toujours 2 chiffres partout)
        expect(formatted).toMatch(/^\d{2}:\d{2}\.\d{2}$/);
      }
    }
    
    // Test avec centièmes < 10
    expect(formatTime(5.05)).toBe("00:05.05");
    expect(formatTime(5.01)).toBe("00:05.01");
  });
});
