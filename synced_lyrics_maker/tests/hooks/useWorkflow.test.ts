/**
 * Tests pour useWorkflow
 * 
 * OBJECTIF: Vérifier que le hook useWorkflow gère correctement la navigation
 * entre les 3 étapes de l'application avec validation des conditions.
 * 
 * WORKFLOW:
 * Step 1 (Upload) → Step 2 (Sync) → Step 3 (Export)
 * 
 * CONDITIONS:
 * - Step 1→2: Audio ET Lyrics chargés
 * - Step 2→3: Au moins une ligne synchronisée
 * 
 * POURQUOI: Le workflow est la colonne vertébrale de l'UX. Une navigation
 * incorrecte ou des conditions mal vérifiées cassent l'expérience utilisateur.
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWorkflow } from "@/hooks/useWorkflow";

describe("useWorkflow", () => {
  /**
   * TEST: État initial du workflow
   * 
   * WHAT: Vérifier l'état par défaut au démarrage
   * HOW: Render le hook sans paramètre
   * WHY: L'application doit démarrer sur Step 1 avec conditions vides
   * EXPECTED: currentStep=1, toutes conditions false, progress=0%
   */
  it("devrait initialiser sur Step 1 avec conditions par défaut", () => {
    // WHEN: On initialise le workflow
    const { result } = renderHook(() => useWorkflow());

    // THEN: L'état initial doit être Step 1
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
    expect(result.current.progress).toBe(0);

    // Les conditions doivent empêcher la navigation
    expect(result.current.workflowState.canGoToStep2).toBe(false);
    expect(result.current.workflowState.canGoToStep3).toBe(false);
  });

  /**
   * TEST: Initialisation avec étape personnalisée
   * 
   * WHAT: Vérifier qu'on peut démarrer sur une étape spécifique
   * HOW: Passer initialStep=2 au hook
   * WHY: Utile pour les tests ou deep-linking
   * EXPECTED: currentStep=initialStep
   */
  it("devrait permettre d'initialiser sur une étape spécifique", () => {
    // WHEN: On initialise sur Step 2
    const { result } = renderHook(() => useWorkflow(2));

    // THEN: L'étape courante doit être Step 2
    expect(result.current.currentStep).toBe(2);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);
    expect(result.current.progress).toBe(50);
  });

  /**
   * TEST: Step 1 toujours accessible
   * 
   * WHAT: Vérifier que Step 1 est accessible sans conditions
   * HOW: Vérifier canGoToStep(1) dans tous les états
   * WHY: L'utilisateur doit toujours pouvoir revenir charger un nouveau fichier
   * EXPECTED: canGoToStep(1) = true, peu importe les conditions
   */
  it("devrait toujours permettre d'accéder à Step 1", () => {
    // GIVEN: Workflow sans conditions
    const { result } = renderHook(() => useWorkflow());

    // THEN: Step 1 doit être accessible
    expect(result.current.canGoToStep(1)).toBe(true);

    // Même après avoir chargé des données
    act(() => {
      result.current.updateConditions({
        isAudioLoaded: true,
        isLyricsLoaded: true,
        hasSyncedLines: true,
      });
    });

    expect(result.current.canGoToStep(1)).toBe(true);
  });

  /**
   * TEST: Step 2 nécessite audio ET lyrics
   * 
   * WHAT: Vérifier que Step 2 requiert les deux conditions
   * HOW: Tester avec audio seul, lyrics seul, puis les deux
   * WHY: Impossib de synchroniser sans audio ou sans lyrics
   * EXPECTED: Accessible seulement si isAudioLoaded AND isLyricsLoaded
   */
  it("devrait bloquer Step 2 si audio ou lyrics manquant", () => {
    // GIVEN: Workflow vide
    const { result } = renderHook(() => useWorkflow());

    // THEN: Step 2 doit être bloqué initialement
    expect(result.current.canGoToStep(2)).toBe(false);

    // WHEN: On charge seulement l'audio
    act(() => {
      result.current.updateConditions({ isAudioLoaded: true });
    });

    // THEN: Step 2 toujours bloqué (lyrics manquant)
    expect(result.current.canGoToStep(2)).toBe(false);
    expect(result.current.workflowState.canGoToStep2).toBe(false);

    // WHEN: On charge seulement les lyrics (sans audio)
    act(() => {
      result.current.updateConditions({
        isAudioLoaded: false,
        isLyricsLoaded: true,
      });
    });

    // THEN: Step 2 toujours bloqué (audio manquant)
    expect(result.current.canGoToStep(2)).toBe(false);

    // WHEN: On charge les deux
    act(() => {
      result.current.updateConditions({
        isAudioLoaded: true,
        isLyricsLoaded: true,
      });
    });

    // THEN: Step 2 doit être accessible
    expect(result.current.canGoToStep(2)).toBe(true);
    expect(result.current.workflowState.canGoToStep2).toBe(true);
  });

  /**
   * TEST: Step 3 nécessite au moins une ligne synced
   * 
   * WHAT: Vérifier que Step 3 requiert audio + lyrics + sync
   * HOW: Tester conditions progressivement (audio, lyrics, puis sync)
   * WHY: Impossible d'exporter sans aucune synchronisation
   * EXPECTED: Accessible seulement si toutes les conditions sont vraies
   */
  it("devrait bloquer Step 3 si aucune ligne synchronisée", () => {
    // GIVEN: Workflow avec audio + lyrics mais pas de sync
    const { result } = renderHook(() => useWorkflow());

    act(() => {
      result.current.updateConditions({
        isAudioLoaded: true,
        isLyricsLoaded: true,
        hasSyncedLines: false,
      });
    });

    // THEN: Step 3 doit être bloqué
    expect(result.current.canGoToStep(3)).toBe(false);
    expect(result.current.workflowState.canGoToStep3).toBe(false);

    // WHEN: On synchronise au moins une ligne
    act(() => {
      result.current.updateConditions({ hasSyncedLines: true });
    });

    // THEN: Step 3 doit être accessible
    expect(result.current.canGoToStep(3)).toBe(true);
    expect(result.current.workflowState.canGoToStep3).toBe(true);
  });

  /**
   * TEST: Navigation avec goToStep (validation)
   * 
   * WHAT: Vérifier que goToStep respecte les conditions
   * HOW: Tenter de naviguer vers Step 2/3 sans conditions
   * WHY: Prévenir les bugs où l'utilisateur accède à une étape invalide
   * EXPECTED: Navigation bloquée si conditions non remplies
   */
  it("devrait bloquer la navigation si conditions non remplies", () => {
    // GIVEN: Workflow sans conditions
    const { result } = renderHook(() => useWorkflow());

    // WHEN: On tente d'aller à Step 2 sans conditions
    act(() => {
      result.current.goToStep(2);
    });

    // THEN: La navigation doit être bloquée
    expect(result.current.currentStep).toBe(1);

    // WHEN: On remplit les conditions et navigue
    act(() => {
      result.current.updateConditions({
        isAudioLoaded: true,
        isLyricsLoaded: true,
      });
      result.current.goToStep(2);
    });

    // THEN: La navigation doit réussir
    expect(result.current.currentStep).toBe(2);
  });

  /**
   * TEST: Navigation avec goToNextStep
   * 
   * WHAT: Vérifier que goToNextStep incrémente l'étape avec validation
   * HOW: Appeler goToNextStep successivement avec conditions
   * WHY: Bouton "Continuer" dans l'UI utilise cette fonction
   * EXPECTED: Avance d'une étape si conditions OK, sinon reste
   */
  it("devrait avancer à l'étape suivante avec goToNextStep", () => {
    // GIVEN: Workflow sur Step 1 avec conditions remplies
    const { result } = renderHook(() => useWorkflow());

    act(() => {
      result.current.updateConditions({
        isAudioLoaded: true,
        isLyricsLoaded: true,
      });
    });

    // WHEN: On avance à l'étape suivante
    act(() => {
      result.current.goToNextStep();
    });

    // THEN: On doit être sur Step 2
    expect(result.current.currentStep).toBe(2);
    expect(result.current.progress).toBe(50);

    // WHEN: On tente d'avancer sans sync
    act(() => {
      result.current.goToNextStep();
    });

    // THEN: On doit rester sur Step 2
    expect(result.current.currentStep).toBe(2);

    // WHEN: On ajoute une ligne synchronisée et avance
    act(() => {
      result.current.updateConditions({ hasSyncedLines: true });
      result.current.goToNextStep();
    });

    // THEN: On doit être sur Step 3
    expect(result.current.currentStep).toBe(3);
    expect(result.current.progress).toBe(100);
    expect(result.current.isLastStep).toBe(true);
  });

  /**
   * TEST: Navigation avec goToPreviousStep
   * 
   * WHAT: Vérifier que goToPreviousStep décrémente l'étape sans validation
   * HOW: Naviguer en arrière depuis Step 2 et 3
   * WHY: Bouton "Retour" dans l'UI, doit toujours fonctionner
   * EXPECTED: Recule d'une étape sans vérifier les conditions
   */
  it("devrait reculer à l'étape précédente avec goToPreviousStep", () => {
    // GIVEN: Workflow sur Step 3
    const { result } = renderHook(() => useWorkflow(3));

    // WHEN: On recule
    act(() => {
      result.current.goToPreviousStep();
    });

    // THEN: On doit être sur Step 2
    expect(result.current.currentStep).toBe(2);

    // WHEN: On recule encore
    act(() => {
      result.current.goToPreviousStep();
    });

    // THEN: On doit être sur Step 1
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isFirstStep).toBe(true);

    // WHEN: On tente de reculer depuis Step 1
    act(() => {
      result.current.goToPreviousStep();
    });

    // THEN: On doit rester sur Step 1
    expect(result.current.currentStep).toBe(1);
  });

  /**
   * TEST: Calcul du progress (0%, 50%, 100%)
   * 
   * WHAT: Vérifier que progress reflète l'étape courante
   * HOW: Naviguer entre les étapes et vérifier progress
   * WHY: Barre de progression dans l'UI utilise cette valeur
   * EXPECTED: Step 1=0%, Step 2=50%, Step 3=100%
   */
  it("devrait calculer le progress correctement", () => {
    // GIVEN: Workflow sur Step 1
    const { result } = renderHook(() => useWorkflow());

    // Step 1 = 0%
    expect(result.current.progress).toBe(0);

    // Step 2 = 50%
    act(() => {
      result.current.updateConditions({
        isAudioLoaded: true,
        isLyricsLoaded: true,
      });
      result.current.goToStep(2);
    });
    expect(result.current.progress).toBe(50);

    // Step 3 = 100%
    act(() => {
      result.current.updateConditions({ hasSyncedLines: true });
      result.current.goToStep(3);
    });
    expect(result.current.progress).toBe(100);
  });

  /**
   * TEST: Flags isFirstStep et isLastStep
   * 
   * WHAT: Vérifier que les flags reflètent la position dans le workflow
   * HOW: Vérifier les flags sur chaque étape
   * WHY: Utilisés pour afficher/masquer les boutons précédent/suivant
   * EXPECTED: isFirstStep sur Step 1, isLastStep sur Step 3
   */
  it("devrait définir correctement isFirstStep et isLastStep", () => {
    // GIVEN: Workflow avec toutes conditions
    const { result } = renderHook(() => useWorkflow());

    act(() => {
      result.current.updateConditions({
        isAudioLoaded: true,
        isLyricsLoaded: true,
        hasSyncedLines: true,
      });
    });

    // Step 1: First mais pas Last
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);

    // Step 2: Ni First ni Last
    act(() => {
      result.current.goToStep(2);
    });
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);

    // Step 3: Last mais pas First
    act(() => {
      result.current.goToStep(3);
    });
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(true);
  });

  /**
   * TEST: Mise à jour partielle des conditions
   * 
   * WHAT: Vérifier que updateConditions merge les nouvelles valeurs
   * HOW: Mettre à jour une condition sans affecter les autres
   * WHY: Éviter de devoir réinitialiser toutes les conditions à chaque update
   * EXPECTED: Merge partiel, pas de reset des autres conditions
   */
  it("devrait mettre à jour les conditions partiellement", () => {
    // GIVEN: Workflow avec audio chargé
    const { result } = renderHook(() => useWorkflow());

    act(() => {
      result.current.updateConditions({ isAudioLoaded: true });
    });

    expect(result.current.workflowState.canGoToStep2).toBe(false);

    // WHEN: On charge les lyrics sans re-spécifier audio
    act(() => {
      result.current.updateConditions({ isLyricsLoaded: true });
    });

    // THEN: Les deux conditions doivent être vraies
    expect(result.current.workflowState.canGoToStep2).toBe(true);
  });

  /**
   * TEST: WorkflowState synchronisé
   * 
   * WHAT: Vérifier que workflowState reflète toujours l'état actuel
   * HOW: Changer conditions et étape, vérifier workflowState
   * WHY: Objet exposé à l'UI pour afficher l'état global
   * EXPECTED: workflowState mis à jour à chaque changement
   */
  it("devrait maintenir workflowState synchronisé", () => {
    // GIVEN: Workflow initial
    const { result } = renderHook(() => useWorkflow());

    // État initial
    expect(result.current.workflowState).toEqual({
      currentStep: 1,
      canGoToStep2: false,
      canGoToStep3: false,
    });

    // Après chargement audio + lyrics
    act(() => {
      result.current.updateConditions({
        isAudioLoaded: true,
        isLyricsLoaded: true,
      });
    });

    expect(result.current.workflowState).toEqual({
      currentStep: 1,
      canGoToStep2: true,
      canGoToStep3: false,
    });

    // Après ajout d'une ligne synchronisée
    act(() => {
      result.current.updateConditions({ hasSyncedLines: true });
    });

    expect(result.current.workflowState).toEqual({
      currentStep: 1,
      canGoToStep2: true,
      canGoToStep3: true,
    });
  });
});
