/**
 * Tests pour useAudio
 * 
 * OBJECTIF: Vérifier que le hook useAudio gère correctement le cycle de vie
 * d'un élément audio HTML5 (chargement, lecture, pause, seek, events).
 * 
 * POURQUOI: useAudio est le cœur de l'application - toute la synchronisation
 * dépend de la précision des timestamps audio. Un bug ici casse toute l'app.
 * 
 * LIMITATIONS: HTMLMediaElement est mocké car Vitest/jsdom ne supporte pas
 * le vrai lecteur audio. On teste la logique de gestion d'état uniquement.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAudio } from "@/hooks/useAudio";

describe("useAudio", () => {
  // Mock File pour les tests
  const createMockFile = (name: string = "test-audio.mp3"): File => {
    return new File(["audio content"], name, { type: "audio/mp3" });
  };

  /**
   * TEST: État initial du hook
   * 
   * WHAT: Vérifier l'état par défaut avant chargement audio
   * HOW: Render le hook et examiner les valeurs initiales
   * WHY: L'état initial doit être cohérent et sûr (pas de lecture avant chargement)
   * EXPECTED: isPlaying=false, isLoaded=false, currentTime=0, duration=0
   */
  it("devrait initialiser avec l'état par défaut", () => {
    // WHEN: On initialise le hook
    const { result } = renderHook(() => useAudio());

    // THEN: L'état initial doit être "non chargé"
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.audioRef.current).toBeInstanceOf(HTMLAudioElement);
  });

  /**
   * TEST: Chargement d'un fichier audio
   * 
   * WHAT: Vérifier que loadAudio crée un blob URL et le définit sur l'audio
   * HOW: Appeler loadAudio avec un mock File, vérifier URL.createObjectURL
   * WHY: Le chargement doit créer une URL blob pour permettre la lecture
   * EXPECTED: audioRef.src défini, URL.createObjectURL appelé, basename extrait
   */
  it("devrait charger un fichier audio et créer une URL blob", () => {
    // GIVEN: Un hook audio et un fichier mock
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile("my-song.mp3");

    // WHEN: On charge le fichier
    act(() => {
      result.current.loadAudio(mockFile);
    });

    // THEN: L'URL blob doit être créée et assignée
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    expect(result.current.audioRef.current?.src).toBe("blob:mock-audio");
    expect(result.current.audioBaseName).toBe("my-song");
  });

  /**
   * TEST: Extraction du nom de fichier sans extension
   * 
   * WHAT: Vérifier que le basename est correctement extrait
   * HOW: Tester différents noms de fichiers (avec espaces, points, etc.)
   * WHY: Le basename sert pour nommer les fichiers d'export
   * EXPECTED: Extension retirée, espaces conservés, cas spéciaux gérés
   */
  it("devrait extraire le basename du fichier sans extension", () => {
    const { result } = renderHook(() => useAudio());

    // Test 1: Fichier simple
    act(() => {
      result.current.loadAudio(createMockFile("song.mp3"));
    });
    expect(result.current.audioBaseName).toBe("song");

    // Test 2: Fichier avec espaces
    act(() => {
      result.current.loadAudio(createMockFile("My Amazing Song.wav"));
    });
    expect(result.current.audioBaseName).toBe("My Amazing Song");

    // Test 3: Fichier avec plusieurs points
    act(() => {
      result.current.loadAudio(createMockFile("track.v2.final.mp3"));
    });
    expect(result.current.audioBaseName).toBe("track.v2.final");
  });

  /**
   * TEST: Play/Pause toggle
   * 
   * WHAT: Vérifier que togglePlay bascule correctement l'état de lecture
   * HOW: Simuler loadedmetadata, définir paused, appeler togglePlay, vérifier état
   * WHY: Fonction principale de contrôle de la lecture audio
   * EXPECTED: État isPlaying basculé, méthodes audio appelées
   */
  it("devrait basculer entre play et pause", async () => {
    // GIVEN: Un audio chargé
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile();

    act(() => {
      result.current.loadAudio(mockFile);
    });

    // Simuler le chargement des métadonnées
    act(() => {
      const audioElement = result.current.audioRef.current!;
      Object.defineProperty(audioElement, "duration", { value: 120, configurable: true });
      Object.defineProperty(audioElement, "paused", { value: true, configurable: true, writable: true });
      audioElement.dispatchEvent(new Event("loadedmetadata"));
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    // WHEN: On appuie sur play (paused est true)
    act(() => {
      // L'audio est en pause, donc togglePlay va appeler play()
      Object.defineProperty(result.current.audioRef.current!, "paused", { 
        value: true, 
        configurable: true, 
        writable: true 
      });
      result.current.togglePlay();
    });

    // THEN: L'audio doit jouer
    expect(result.current.audioRef.current?.play).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(true);

    // WHEN: On appuie sur pause (paused est false maintenant)
    act(() => {
      // L'audio est en lecture, donc togglePlay va appeler pause()
      Object.defineProperty(result.current.audioRef.current!, "paused", { 
        value: false, 
        configurable: true, 
        writable: true 
      });
      result.current.togglePlay();
    });

    // THEN: L'audio doit se mettre en pause
    expect(result.current.audioRef.current?.pause).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  /**
   * TEST: Fonction play directe
   * 
   * WHAT: Vérifier que play() démarre la lecture
   * HOW: Charger audio, appeler play(), vérifier état
   * WHY: Méthode exposée pour contrôle externe (clavier, etc.)
   * EXPECTED: isPlaying=true, audio.play() appelé
   */
  it("devrait démarrer la lecture avec play()", async () => {
    // GIVEN: Un audio chargé
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile();

    act(() => {
      result.current.loadAudio(mockFile);
    });

    act(() => {
      const audioElement = result.current.audioRef.current!;
      Object.defineProperty(audioElement, "duration", { value: 120, configurable: true });
      audioElement.dispatchEvent(new Event("loadedmetadata"));
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    // WHEN: On appelle play()
    act(() => {
      result.current.play();
    });

    // THEN: La lecture doit démarrer
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.audioRef.current?.play).toHaveBeenCalled();
  });

  /**
   * TEST: Fonction pause directe
   * 
   * WHAT: Vérifier que pause() arrête la lecture
   * HOW: Démarrer lecture, appeler pause(), vérifier état
   * WHY: Méthode exposée pour contrôle externe
   * EXPECTED: isPlaying=false, audio.pause() appelé
   */
  it("devrait mettre en pause avec pause()", async () => {
    // GIVEN: Un audio en cours de lecture
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile();

    act(() => {
      result.current.loadAudio(mockFile);
    });

    act(() => {
      const audioElement = result.current.audioRef.current!;
      Object.defineProperty(audioElement, "duration", { value: 120, configurable: true });
      audioElement.dispatchEvent(new Event("loadedmetadata"));
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.play();
    });

    // WHEN: On appelle pause()
    act(() => {
      result.current.pause();
    });

    // THEN: La lecture doit s'arrêter
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.audioRef.current?.pause).toHaveBeenCalled();
  });

  /**
   * TEST: Seek (déplacement dans la timeline)
   * 
   * WHAT: Vérifier que seek() modifie currentTime de l'audio
   * HOW: Appeler seek(30), vérifier audioElement.currentTime
   * WHY: Fonction critique pour la navigation dans l'audio
   * EXPECTED: audioElement.currentTime modifié
   */
  it("devrait permettre de se déplacer dans l'audio avec seek()", () => {
    // GIVEN: Un audio chargé
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile();

    act(() => {
      result.current.loadAudio(mockFile);
    });

    // WHEN: On se déplace à 30 secondes
    act(() => {
      result.current.seek(30);
    });

    // THEN: Le currentTime de l'élément audio doit être mis à jour
    expect(result.current.audioRef.current?.currentTime).toBe(30);
  });

  /**
   * TEST: getCurrentTimestamp (précision sync)
   * 
   * WHAT: Vérifier que getCurrentTimestamp retourne le temps exact
   * HOW: Définir manuellement currentTime, lire via getCurrentTimestamp
   * WHY: Utilisé pour la synchronisation - doit être exact au centième
   * EXPECTED: Retourne currentTime exact de l'élément audio
   */
  it("devrait retourner le timestamp actuel précis", () => {
    // GIVEN: Un audio chargé avec currentTime défini
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile();

    act(() => {
      result.current.loadAudio(mockFile);
    });

    act(() => {
      const audioElement = result.current.audioRef.current!;
      Object.defineProperty(audioElement, "currentTime", { 
        value: 45.678, 
        configurable: true,
        writable: true
      });
    });

    // WHEN: On lit le timestamp actuel
    const timestamp = result.current.getCurrentTimestamp();

    // THEN: Il doit correspondre exactement
    expect(timestamp).toBe(45.678);
  });

  /**
   * TEST: Event loadedmetadata (durée audio)
   * 
   * WHAT: Vérifier que l'event loadedmetadata met à jour duration et isLoaded
   * HOW: Dispatcher l'event sur l'audioRef, vérifier state
   * WHY: Event HTML5 critique qui signale que l'audio est prêt
   * EXPECTED: isLoaded=true, duration mise à jour
   */
  it("devrait mettre à jour l'état quand les métadonnées sont chargées", async () => {
    // GIVEN: Un audio en cours de chargement
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile();

    act(() => {
      result.current.loadAudio(mockFile);
    });

    // WHEN: Les métadonnées sont chargées (event HTML5)
    act(() => {
      const audioElement = result.current.audioRef.current!;
      Object.defineProperty(audioElement, "duration", { 
        value: 180.5, 
        configurable: true 
      });
      audioElement.dispatchEvent(new Event("loadedmetadata"));
    });

    // THEN: L'état doit refléter le chargement
    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.duration).toBe(180.5);
    });
  });

  /**
   * TEST: Event timeupdate (progression lecture)
   * 
   * WHAT: Vérifier que timeupdate met à jour currentTime dans le state
   * HOW: Dispatcher timeupdate avec currentTime modifié, vérifier state
   * WHY: Event HTML5 qui trigger les updates de la timeline pendant lecture
   * EXPECTED: currentTime du state synchronisé avec l'élément audio
   */
  it("devrait mettre à jour currentTime pendant la lecture", async () => {
    // GIVEN: Un audio en cours de lecture
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile();

    act(() => {
      result.current.loadAudio(mockFile);
    });

    // WHEN: Le temps progresse (event timeupdate)
    act(() => {
      const audioElement = result.current.audioRef.current!;
      Object.defineProperty(audioElement, "currentTime", { 
        value: 25.123, 
        configurable: true,
        writable: true
      });
      audioElement.dispatchEvent(new Event("timeupdate"));
    });

    // THEN: Le state doit refléter la progression
    await waitFor(() => {
      expect(result.current.currentTime).toBe(25.123);
    });
  });

  /**
   * TEST: Event ended (fin de lecture)
   * 
   * WHAT: Vérifier que l'event ended reset isPlaying et currentTime
   * HOW: Dispatcher ended, vérifier que lecture s'arrête
   * WHY: Comportement attendu en fin de piste
   * EXPECTED: isPlaying=false, currentTime=0
   */
  it("devrait arrêter la lecture quand l'audio se termine", async () => {
    // GIVEN: Un audio en cours de lecture
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile();

    act(() => {
      result.current.loadAudio(mockFile);
    });

    act(() => {
      const audioElement = result.current.audioRef.current!;
      Object.defineProperty(audioElement, "duration", { value: 120, configurable: true });
      audioElement.dispatchEvent(new Event("loadedmetadata"));
    });

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    act(() => {
      result.current.play();
    });

    // WHEN: L'audio arrive à la fin
    act(() => {
      const audioElement = result.current.audioRef.current!;
      audioElement.dispatchEvent(new Event("ended"));
    });

    // THEN: La lecture doit s'arrêter et revenir au début
    await waitFor(() => {
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
    });
  });

  /**
   * TEST: Event error (fichier corrompu)
   * 
   * WHAT: Vérifier que l'event error met à jour le state avec message
   * HOW: Dispatcher error, vérifier error state
   * WHY: Gestion d'erreur critique pour UX (fichier invalide, format non supporté)
   * EXPECTED: error != null, isLoaded=false, isPlaying=false
   */
  it("devrait gérer les erreurs de chargement audio", async () => {
    // GIVEN: Un audio en cours de chargement
    const { result } = renderHook(() => useAudio());
    const mockFile = createMockFile();

    act(() => {
      result.current.loadAudio(mockFile);
    });

    // WHEN: Une erreur se produit (format non supporté, fichier corrompu)
    act(() => {
      const audioElement = result.current.audioRef.current!;
      audioElement.dispatchEvent(new Event("error"));
    });

    // THEN: L'état doit refléter l'erreur
    await waitFor(() => {
      expect(result.current.error).toBe("Impossible de lire le fichier audio");
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  /**
   * TEST: Rechargement d'un nouveau fichier
   * 
   * WHAT: Vérifier qu'on peut charger un nouveau fichier après le premier
   * HOW: loadAudio deux fois avec fichiers différents
   * WHY: L'utilisateur doit pouvoir changer de fichier audio
   * EXPECTED: Nouveau blob URL créé, ancien remplacé, error réinitialisée
   */
  it("devrait permettre de charger un nouveau fichier", () => {
    // GIVEN: Un premier audio chargé
    const { result } = renderHook(() => useAudio());
    const mockFile1 = createMockFile("song1.mp3");

    act(() => {
      result.current.loadAudio(mockFile1);
    });

    expect(result.current.audioBaseName).toBe("song1");

    // WHEN: On charge un nouveau fichier
    const mockFile2 = createMockFile("song2.mp3");

    act(() => {
      result.current.loadAudio(mockFile2);
    });

    // THEN: Le nouveau fichier doit remplacer l'ancien
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile2);
    expect(result.current.audioBaseName).toBe("song2");
    expect(result.current.error).toBeNull(); // Erreur précédente effacée
  });
});
