# GUIDE COMPLET : ÉTAPES POUR TERMINER VOTRE POC
## Synced Lyrics Generator Tool

---

## TABLE DES MATIÈRES

1. [Préparation & Setup Environnement](#préparation--setup-environnement)
2. [Découpage du Projet](#découpage-du-projet)
3. [Phase 1 : Infrastructure & Fondations](#phase-1--infrastructure--fondations)
4. [Phase 2 : Composants Isolés](#phase-2--composants-isolés)
5. [Phase 3 : Gestion d'État & Logique](#phase-3--gestion-détat--logique)
6. [Phase 4 : Intégration & Flux Utilisateur](#phase-4--intégration--flux-utilisateur)
7. [Phase 5 : Export & Formats](#phase-5--export--formats)
8. [Phase 6 : Polish & Détails](#phase-6--polish--détails)
9. [Phase 7 : Testing & Validation](#phase-7--testing--validation)
10. [Phase 8 : Documentation & Livraison](#phase-8--documentation--livraison)

---

## PRÉPARATION & SETUP ENVIRONNEMENT

### Étape 0.1 : Vérifier les prérequis

Avant de commencer, assurez-vous que vous avez :

**Sur votre machine :**
- **Node.js** (v18 ou plus récent) → Vérifier : `node --version`
- **npm/pnpm/yarn** → Vérifier : `npm --version` ou `pnpm --version`
- **Git** → Vérifier : `git --version`
- **Un éditeur de code** (VS Code recommandé)
- **Un navigateur moderne** (Chrome, Firefox, Safari, Edge)

**Niveau de connaissances requis :**
- Connaître React (hooks, state management)
- Connaître la structure Next.js basique
- Comprendre JavaScript ES6+
- Avoir des notions de CSS/Tailwind (optionnel mais recommandé)

### Étape 0.2 : Créer le projet Next.js

Ouvrez votre terminal et exécutez :

```
npx create-next-app@latest synced-lyrics-maker --typescript --tailwind
```

Lors de l'installation, répondez aux questions :
- **TypeScript** : Yes (fortement recommandé pour la maintenabilité)
- **Tailwind CSS** : Yes (pour le styling rapide)
- **App Router** : Yes (Next.js 13+)
- **ESLint** : Yes

Après installation, naviguez dans le dossier :
```
cd synced-lyrics-maker
```

### Étape 0.3 : Initialiser Git

```
git init
git add .
git commit -m "Initial project setup"
```

Créez un dépôt GitHub et poussez votre code :
```
git remote add origin https://github.com/votre-username/synced-lyrics-maker.git
git branch -M main
git push -u origin main
```

### Étape 0.4 : Structure de dossiers initiale

Créez l'architecture suivante dans votre projet :

```
synced-lyrics-maker/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── AudioPlayer.tsx
│   ├── LyricsInput.tsx
│   ├── LyricsList.tsx
│   ├── ExportPanel.tsx
│   └── ShortcutsHint.tsx
├── hooks/
│   ├── useAudio.ts
│   ├── useLyrics.ts
│   └── useExport.ts
├── utils/
│   ├── formatTime.ts
│   ├── parseLyrics.ts
│   ├── lrcSerializer.ts
│   └── jsonSerializer.ts
├── types/
│   └── index.ts
└── public/
    └── (sample audio files pour testing)
```

Créez manuellement chaque dossier et fichier (même vides).

### Étape 0.5 : Installer les dépendances supplémentaires

```
npm install uuid
npm install --save-dev @types/uuid
```

L'UUID est utilisé pour créer des identifiants uniques pour chaque ligne de lyric.

### Étape 0.6 : Vérification du setup

Lancez le serveur de développement :
```
npm run dev
```

Accédez à `http://localhost:3000` et vous devriez voir la page Next.js par défaut.

Si tout fonctionne, vous pouvez passer à l'étape suivante.

---

## DÉCOUPAGE DU PROJET

### Comprendre la architecture globale

Votre POC se divise en **4 domaines fonctionnels** :

#### 1. **Domaine Audio**
- Charger un fichier audio
- Lire/mettre en pause
- Afficher le timestamp courant
- Pouvoir naviguer dans la timeline

#### 2. **Domaine Lyrics**
- Entrer du texte (copier-coller des lyrics)
- Parser ce texte ligne par ligne
- Afficher chaque ligne
- Sélectionner une ligne

#### 3. **Domaine Syncing**
- Capturer le timestamp exact au moment du clic
- Assigner ce timestamp à la ligne sélectionnée
- Afficher visuel : "synced" vs "unsynced"
- Permettre édition/suppression des timestamps

#### 4. **Domaine Export**
- Convertir lyrics + timestamps → JSON
- Convertir lyrics + timestamps → LRC
- Télécharger les fichiers

### Dépendances entre domaines

```
Audio ← Syncing → Lyrics
                     ↓
                   Export
```

**Ordre logique d'implémentation :**
1. Audio (base) + Lyrics (base)
2. Syncing (combine audio + lyrics)
3. Export (utilise lyrics synced)

---

## PHASE 1 : INFRASTRUCTURE & FONDATIONS

### Étape 1.1 : Définir les types TypeScript

**Fichier : `types/index.ts`**

Créez des interfaces pour typer toutes les données :

```
Vous allez créer un type `LyricLine` qui représente une ligne de lyric.
Ce type doit avoir :
- Un identifiant unique (id: string)
- Le texte de la lyric (text: string)
- Un timestamp optionnel (timestamp: number | null)
- Un statut synced/unsynced (isSynced: boolean)
- Un statut édition (isEditing: boolean)

Vous allez aussi créer un type pour les formats d'export :
- SyncedLyricsJSON = array d'objets {time: number, text: string}
- LRCFormat = simple string avec format spécifique
```

### Étape 1.2 : Créer les fonctions utilitaires

**Fichier : `utils/formatTime.ts`**

Cette fonction est **critique** car elle convertit un nombre (secondes) en format lisible.

Créez une fonction qui prend un nombre (ex: 12.45 secondes) et retourne une string formatée (ex: "00:12.45").

Points importants :
- Gérer les heures si la musique dépasse 60 minutes
- Afficher 2 décimales pour les centièmes de seconde
- Padding avec des zéros (ex: "01:05.30" pas "1:5.3")

**Fichier : `utils/parseLyrics.ts`**

Créez une fonction simple qui prend du texte brut (plusieurs lignes) et retourne un array où chaque ligne est un objet LyricLine.

Points importants :
- Splitter par "\n" (nouvelle ligne)
- Trimmer chaque ligne (enlever espaces au début/fin)
- Ignorer les lignes vides
- Générer un UUID unique pour chaque ligne

**Fichier : `utils/lrcSerializer.ts` et `utils/jsonSerializer.ts`**

Créez deux fonctions de conversion :

1. **toLRC** : Prend un array de LyricLine et retourne un string au format LRC
   - Format : `[mm:ss.ms]Texte de la lyric`
   - Exemple : `[00:12.45]First lyric line`
   - Trier par timestamp

2. **toJSON** : Prend un array de LyricLine et retourne un string JSON
   - Structure : `[{time: number, text: string}, ...]`
   - Formater avec indentation (2 espaces)
   - Trier par timestamp

### Étape 1.3 : Configurer le layout global

**Fichier : `app/layout.tsx`**

Modifiez le layout pour :
- Définir le titre de la page (ex: "Synced Lyrics Maker")
- Importer Tailwind (déjà fait par défaut)
- Ajouter des meta tags (description, favicon)
- Définir une structure HTML minimale avec `<body>`

**Fichier : `app/globals.css`**

Personnalisez les styles globaux :
- Couleurs de base (background, text)
- Fonts (police par défaut)
- Variables CSS (couleurs réutilisables)
- Reset CSS (margins, paddings)

### Étape 1.4 : Créer un composant layout principal

**Fichier : `components/Layout.tsx`** (optionnel mais recommandé)

Créez un wrapper visuel global avec :
- Un header avec le titre "🎵 Synced Lyrics Maker"
- Une section principal (main content)
- Un footer avec crédits/liens

Cela centralise le design et rend les pages plus propres.

---

## PHASE 2 : COMPOSANTS ISOLÉS

### Étape 2.1 : Créer le composant AudioPlayer (partie 1 : UI)

**Fichier : `components/AudioPlayer.tsx`**

D'abord, créez la structure HTML/visuelle **sans logique** :

Le composant doit afficher :
1. Un input file pour upload audio (type="file", accept="audio/*")
2. Plusieurs boutons : Play, Pause
3. Une barre de progression (input range)
4. Affichage du temps courant et durée totale (format mm:ss.ms)
5. Un bouton "Sync Current Line" (pour plus tard)

Utilisez Tailwind pour le styling :
- Fond blanc/gris
- Boutons avec couleurs primaires
- Barre de progression avec styling
- Texte aligné et lisible

À ce stade, les boutons ne font rien. C'est juste du visuel.

### Étape 2.2 : Créer le composant LyricsInput (UI)

**Fichier : `components/LyricsInput.tsx`**

Ce composant doit afficher :
1. Un textarea pour coller les lyrics
2. Un label "Paste your lyrics here"
3. Un bouton "Load Lyrics" pour valider
4. Un message d'aide (ex: "One line per lyric")

Le textarea doit être grand et lisible. Utilisez Tailwind pour le styling.

À ce stade, pas de logique. Juste du visuel.

### Étape 2.3 : Créer le composant LyricsList (UI)

**Fichier : `components/LyricsList.tsx`**

Ce composant affiche une liste de lyrics. Pour chaque ligne, montrez :
1. Le numéro (1, 2, 3, ...)
2. Le texte de la lyric
3. Le timestamp (ou "Not synced" si vide)
4. Un bouton "Clear" pour supprimer le timestamp

Utilisez des cartes (cards) avec Tailwind :
- Fond différent si synced (vert) vs unsynced (gris)
- Fond différent si sélectionné (bleu)
- Spacing cohérent

À ce stade, c'est juste du visuel. Pas d'interactivité.

### Étape 2.4 : Créer le composant ExportPanel (UI)

**Fichier : `components/ExportPanel.tsx`**

Ce composant affiche :
1. Un titre "Export Your Lyrics"
2. Deux boutons :
   - "Download as JSON"
   - "Download as .LRC"
3. Un input pour customizer le nom du fichier (optionnel)

Boutons avec styling Tailwind. À ce stade, juste du visuel.

### Étape 2.5 : Créer le composant ShortcutsHint (optionnel)

**Fichier : `components/ShortcutsHint.tsx`**

Un petit composant qui affiche les raccourcis clavier :
- "Press SPACE to sync current line"
- "Click to select a line"

Utilisé comme référence pour l'utilisateur.

---

## PHASE 3 : GESTION D'ÉTAT & LOGIQUE

### Étape 3.1 : Créer le hook useAudio

**Fichier : `hooks/useAudio.ts`**

C'est le hook **le plus critique**. Il gère tout ce qui concerne l'audio.

Voici ce qu'il doit faire :

1. **Initialisation**
   - Créer une référence à un élément `<audio>` HTML
   - Avoir un state pour : isPlaying, currentTime, duration, isLoaded

2. **Charger un fichier audio**
   - Fonction `loadAudio(file: File)`
   - Créer une URL avec `URL.createObjectURL(file)`
   - Assigner à l'élément audio
   - Quand l'audio est chargé (`onloadedmetadata`), mettre à jour la durée

3. **Contrôler la lecture**
   - Fonction `togglePlay()` : alterner play/pause
   - Fonction `pause()` : arrêter
   - Fonction `play()` : démarrer

4. **Naviguer dans la timeline**
   - Fonction `seek(time: number)` : aller à un temps spécifique
   - Utiliser `audioElement.currentTime = time`

5. **Obtenir le timestamp exact**
   - Fonction `getCurrentTimestamp(): number`
   - Retourne `audioElement.currentTime`
   - **IMPORTANT** : C'est utilisé pour le syncing, doit être précis

6. **Tracker le temps courant**
   - Écouter l'événement `timeupdate` de l'audio
   - Mettre à jour le state `currentTime` à chaque update
   - Cela permet la barre de progression et l'affichage du temps

7. **Gérer les événements audio**
   - Écouter `onended` (quand l'audio finit)
   - Écouter `onerror` (si le fichier ne peut pas être lu)

Ce hook retourne un objet avec :
- Tous les states (isPlaying, currentTime, duration, isLoaded)
- Toutes les fonctions (loadAudio, togglePlay, seek, getCurrentTimestamp, handleTimeUpdate)
- La référence `audioRef` pour attacher à l'élément `<audio>`

### Étape 3.2 : Créer le hook useLyrics

**Fichier : `hooks/useLyrics.ts`**

Ce hook gère tout ce qui concerne les lyrics et leur syncing.

Voici ce qu'il doit faire :

1. **État global des lyrics**
   - State : array de LyricLine
   - State : ID de la ligne sélectionnée (selectedLineId)

2. **Parser les lyrics**
   - Fonction `parseLyrics(text: string)`
   - Utilise la fonction `parseLyrics()` de utils
   - Ajoute chaque ligne au state

3. **Sélectionner une ligne**
   - Fonction `selectLine(lineId: string | null)`
   - Met à jour `selectedLineId`
   - Utilisé pour savoir quelle ligne synchroniser

4. **Synchroniser une ligne**
   - Fonction `syncLine(lineId: string, timestamp: number)`
   - Trouve la ligne avec cet ID
   - Met à jour son timestamp et met `isSynced: true`
   - Marque la ligne comme synchronisée

5. **Éditer un timestamp manuellement**
   - Fonction `updateTimestamp(lineId: string, timestamp: number | null)`
   - Permet de changer le timestamp d'une ligne déjà synced
   - Utile si l'utilisateur veut corriger

6. **Supprimer un timestamp**
   - Fonction `clearTimestamp(lineId: string)`
   - Remet le timestamp à `null`
   - Met `isSynced: false`

Ce hook retourne :
- `lyrics` : array de LyricLine
- `selectedLineId` : ID sélectionné
- Toutes les fonctions

### Étape 3.3 : Créer le hook useExport

**Fichier : `hooks/useExport.ts`**

Ce hook gère les conversions et téléchargements.

Voici ce qu'il doit faire :

1. **Convertir en JSON**
   - Fonction `toJSON(lyrics: LyricLine[])`
   - Filtre uniquement les lyrics avec timestamp
   - Utilise la fonction `jsonSerializer` de utils
   - Retourne un string JSON

2. **Convertir en LRC**
   - Fonction `toLRC(lyrics: LyricLine[])`
   - Filtre uniquement les lyrics avec timestamp
   - Utilise la fonction `lrcSerializer` de utils
   - Retourne un string LRC

3. **Télécharger un fichier**
   - Fonction `downloadFile(content: string, filename: string, mimeType: string)`
   - Crée un Blob avec le contenu
   - Génère une URL de download
   - Crée un élément `<a>` invisible
   - Déclenche le téléchargement
   - Nettoie les ressources

4. **Générer un nom de fichier automatique**
   - Fonction `generateFilename(format: 'json' | 'lrc'): string`
   - Format : `synced-lyrics-[date].json` ou `.lrc`
   - Permet à l'utilisateur de pas taper un nom

Ce hook retourne :
- `toJSON`
- `toLRC`
- `downloadFile`
- `generateFilename`

### Étape 3.4 : Tester les hooks isolément

À ce stade, vous devez tester chaque hook **individuellement** :

1. Créez un fichier `app/test.tsx` (temporaire)
2. Importez le hook
3. Appelez ses fonctions manuellement
4. Vérifiez que les states changent correctement

Exemple pour `useAudio` :
- Créez un `<audio>` élément
- Appelez `loadAudio(fakeFile)`
- Vérifiez que `isLoaded` devient `true`
- Appelez `togglePlay()` et vérifiez que `isPlaying` change

Supprimez ce fichier test après.

---

## PHASE 4 : INTÉGRATION & FLUX UTILISATEUR

### Étape 4.1 : Connecter AudioPlayer à useAudio

**Fichier : `components/AudioPlayer.tsx` - Deuxième iteration**

Maintenant, ajoutez la logique :

1. **Importer le hook**
   ```
   Importez useAudio de hooks/useAudio
   ```

2. **Utiliser le hook dans le composant**
   ```
   Appelez const audio = useAudio() au début du composant
   ```

3. **Connecter l'input file**
   ```
   Dans l'onChange de l'input file, appelez audio.loadAudio(file)
   ```

4. **Connecter les boutons**
   ```
   Sur le click du bouton Play/Pause, appelez audio.togglePlay()
   ```

5. **Connecter la barre de progression**
   ```
   Sur le onChange de l'input range, appelez audio.seek(newTime)
   Afficher audio.currentTime comme value de l'input
   ```

6. **Afficher les temps**
   ```
   Afficher audio.currentTime formaté avec formatTime()
   Afficher audio.duration formaté avec formatTime()
   ```

7. **Ajouter l'élément audio invisible**
   ```
   Ajouter un élément <audio> avec ref={audio.audioRef}
   Ajouter onTimeUpdate={audio.handleTimeUpdate}
   Pas besoin de src ici, il sera assigné par loadAudio()
   ```

8. **Affichage conditionnel**
   ```
   Si audio.isLoaded est false, cacher les contrôles
   Afficher un message "Please upload an audio file"
   ```

À ce stade, vous devez pouvoir : uploader un audio, jouer/mettre en pause, naviguer, voir le temps.

### Étape 4.2 : Connecter LyricsInput à useLyrics

**Fichier : `components/LyricsInput.tsx` - Deuxième iteration**

Ajoutez la logique :

1. **Importer le hook**
   ```
   Importez useLyrics de hooks/useLyrics
   ```

2. **State local pour le textarea**
   ```
   Créez un state local : lyricsText : string
   Mettez à jour onchange du textarea
   ```

3. **Connecter le bouton Load**
   ```
   Sur le click, appelez lyrics.parseLyrics(lyricsText)
   Videz le textarea après
   Montrez un message de confirmation
   ```

À ce stade, vous devez pouvoir : coller du texte, cliquer Load, et les lyrics apparaître dans LyricsList.

### Étape 4.3 : Connecter LyricsList à useLyrics

**Fichier : `components/LyricsList.tsx` - Deuxième iteration**

Ajoutez la logique :

1. **Importer le hook**
   ```
   Le composant reçoit les props : lyrics array, onSelectLine, onClearTimestamp
   ```

2. **Renderer les lyrics**
   ```
   Faire une boucle sur lyrics.map()
   Pour chaque ligne, afficher le texte et le timestamp
   ```

3. **Connecter le click sur chaque ligne**
   ```
   Sur le click d'une ligne, appelez onSelectLine(lineId)
   Ajouter un CSS class si cette ligne est sélectionnée (bg-blue)
   Ajouter un CSS class si cette ligne est synced (bg-green)
   ```

4. **Connecter le bouton Clear**
   ```
   Sur le click, appelez onClearTimestamp(lineId)
   Le timestamp doit disparaître
   ```

À ce stade, vous devez pouvoir : cliquer une ligne (elle devient bleue), la sélectionner, la désélectionner.

### Étape 4.4 : Créer la page principale et connecter tout

**Fichier : `app/page.tsx`**

C'est le point d'intégration central :

1. **Importer tous les hooks**
   ```
   const audio = useAudio()
   const lyrics = useLyrics()
   const exporter = useExport()
   ```

2. **Importer tous les composants**
   ```
   AudioPlayer, LyricsInput, LyricsList, ExportPanel
   ```

3. **Créer la fonction de syncing**
   ```
   Function handleSyncLine():
   - Vérifier qu'une ligne est sélectionnée (lyrics.selectedLineId)
   - Si oui, obtenir le timestamp courant (audio.getCurrentTimestamp())
   - Appeler lyrics.syncLine(selectedLineId, timestamp)
   ```

4. **Passer les props à chaque composant**
   ```
   AudioPlayer: onSync={handleSyncLine}
   LyricsInput: onParseLyrics={lyrics.parseLyrics}
   LyricsList: 
     - lyrics={lyrics.lyrics}
     - selectedLineId={lyrics.selectedLineId}
     - onSelectLine={lyrics.selectLine}
     - onClearTimestamp={lyrics.clearTimestamp}
   ExportPanel: lyrics={lyrics.lyrics}
   ```

5. **Layout global**
   ```
   Créer une structure en grid : 2 colonnes
   Colonne gauche : AudioPlayer + LyricsInput
   Colonne droite : LyricsList + ExportPanel
   ```

À ce stade, votre POC doit être quasi-fonctionnel !

---

## PHASE 5 : EXPORT & FORMATS

### Étape 5.1 : Implémenter le composant ExportPanel

**Fichier : `components/ExportPanel.tsx` - Deuxième iteration**

Ajoutez la logique :

1. **Importer le hook useExport**
   ```
   const exporter = useExport()
   ```

2. **Connecter le bouton "Download as JSON"**
   ```
   Sur le click:
   - Appeler exporter.toJSON(lyrics)
   - Obtenir un string JSON
   - Appeler exporter.downloadFile(jsonString, 'lyrics.json', 'application/json')
   - Le fichier se télécharge automatiquement
   ```

3. **Connecter le bouton "Download as .LRC"**
   ```
   Sur le click:
   - Appeler exporter.toLRC(lyrics)
   - Obtenir un string LRC
   - Appeler exporter.downloadFile(lrcString, 'lyrics.lrc', 'text/plain')
   - Le fichier se télécharge
   ```

4. **Input pour customizer le nom**
   ```
   Optionnel : permettre à l'utilisateur de taper un nom custom
   Utiliser ce nom au lieu de 'lyrics.json'
   ```

5. **Messages de feedback**
   ```
   Si aucune lyric n'est synced, afficher un message d'erreur
   "Please sync at least one lyric before exporting"
   Désactiver les boutons de download
   ```

À ce stade, vous devez pouvoir télécharger les fichiers JSON et LRC.

---

## PHASE 6 : POLISH & DÉTAILS

### Étape 6.1 : Raccourcis clavier

**Fichier : `app/page.tsx` - Enhancement**

Ajoutez un écouteur d'événement clavier :

1. **Créer un useEffect**
   ```
   Écouter l'événement 'keydown' sur window
   Si la touche SPACE est pressée:
   - Vérifier qu'une ligne est sélectionnée
   - Appeler handleSyncLine()
   - Empêcher le comportement par défaut (e.preventDefault())
   ```

2. **Cleanup**
   ```
   Nettoyer l'écouteur quand le composant se détruit
   ```

À ce stade, appuyer sur SPACE doit synchroniser la ligne sélectionnée.

### Étape 6.2 : Visual Feedback

Améliorez l'UX avec du feedback visuel :

1. **Dans LyricsList**
   ```
   - Si une ligne est sélectionnée : background bleu, border épais
   - Si une ligne est synced : background vert léger
   - Si une ligne n'est pas synced : background gris léger
   - Hover effect : background légèrement plus foncé
   ```

2. **Dans AudioPlayer**
   ```
   - Bouton Play/Pause change de texte et couleur selon l'état
   - Barre de progression change de couleur pendant le drag
   - Temps affiché en monospace font (font-mono)
   ```

3. **Messages d'aide**
   ```
   - Au-dessus des composants, petits messages explicatifs
   - "Click a lyric line to select it, then press SPACE"
   - "All lyrics synced! You can now export."
   ```

### Étape 6.3 : Auto-scroll (optionnel pour POC)

Si vous avez du temps, ajoutez un auto-scroll :

1. **Logique simple**
   ```
   Pendant la lecture, regarder toutes les lyrics
   Trouver celle dont le timestamp est le plus proche du currentTime
   Scroller jusqu'à cette ligne automatiquement
   ```

2. **Implémentation**
   ```
   Ajouter un useEffect qui regarde audio.currentTime
   Calculer quelle ligne devrait être highlight
   Scroller la liste jusqu'à cette ligne
   ```

### Étape 6.4 : Highlight current line (optionnel)

Ajouter un highlight visuel de la ligne en cours :

1. **Logique**
   ```
   Pendant la lecture (isPlaying === true)
   Pour chaque ligne, vérifier:
   - timestamp <= currentTime < timestamp suivant
   Cette ligne est le "current"
   ```

2. **Styling**
   ```
   Ajouter une classe CSS ou prop isCurrentLine
   Colorer différemment (ex: background jaune)
   Ou ajouter une icône "▶" à côté
   ```

### Étape 6.5 : Undo/Redo (optionnel)

Si vous avez du temps, ajoutez un simple undo :

1. **Garder un historique**
   ```
   Créer un state : history: LyricLine[][]
   À chaque changement, ajouter l'état actuel à l'historique
   Garder max 10 derniers états
   ```

2. **Bouton Undo**
   ```
   Ajouter un bouton "Undo"
   Revenir à l'état précédent
   ```

### Étape 6.6 : Responsive Design (optionnel)

Améliorer le responsive :

1. **Mobile layout**
   ```
   Sur petits écrans (< 768px), changer le grid en colonne
   Mettre LyricsList en full width
   Mettre AudioPlayer en full width
   ```

2. **Tailler les fonts**
   ```
   Plus petites sur mobile
   Gros boutons pour faciliter le tap
   ```

---

## PHASE 7 : TESTING & VALIDATION

### Étape 7.1 : Créer des fichiers de test

Préparez des fichiers pour tester :

1. **Fichier audio test**
   ```
   Téléchargez un short clip MP3 (30 secondes)
   Mettez-le dans public/test-audio.mp3
   ```

2. **Lyrics de test**
   ```
   Écrivez 5-10 lignes courtes de lyrics
   Notez les timestamps approximatifs
   Exemple :
   Line 1 at 0:02
   Line 2 at 0:05
   Line 3 at 0:08
   etc.
   ```

### Étape 7.2 : Tester manuellement chaque feature

**Test 1 : Upload et lecture audio**
```
- Uploader le fichier test-audio.mp3
- Cliquer Play, vérifier que ça joue
- Cliquer Pause, vérifier que ça s'arrête
- Changer la position avec la barre
- Vérifier que le timestamp s'affiche correctement
```

**Test 2 : Input et parsing lyrics**
```
- Copier les 5 lignes de test
- Coller dans le textarea
- Cliquer "Load Lyrics"
- Vérifier que 5 lignes apparaissent dans LyricsList
- Vérifier qu'elles sont numérotées correctement
```

**Test 3 : Syncing manual**
```
- Jouer l'audio
- Quand la ligne 1 doit être synced, cliquer dessus (elle devient bleue)
- Appuyer sur SPACE
- Vérifier que le timestamp s'affiche et la ligne devient verte
- Répéter pour 3-4 lignes
```

**Test 4 : Édition timestamps**
```
- Syncer une ligne
- Cliquer le timestamp pour l'éditer
- Changer le temps manuellement (ex: 00:05.50)
- Vérifier que ça change
```

**Test 5 : Clear timestamp**
```
- Syncer une ligne
- Cliquer le bouton "Clear"
- Vérifier que le timestamp disparaît
- Vérifier que la ligne redevient grise
```

**Test 6 : Export JSON**
```
- Syncer 3 lignes
- Cliquer "Download as JSON"
- Vérifier que le fichier se télécharge
- Ouvrir le fichier dans un éditeur
- Vérifier le format : [{"time": number, "text": string}, ...]
- Vérifier que seules les lignes synced sont présentes
```

**Test 7 : Export LRC**
```
- Cliquer "Download as .LRC"
- Vérifier que le fichier se télécharge
- Ouvrir le fichier dans un éditeur
- Vérifier le format : [mm:ss.ms]Text
- Vérifier les timestamps
```

**Test 8 : Raccourci clavier SPACE**
```
- Cliquer une ligne
- Appuyer sur SPACE
- Vérifier que ça synchronise avec le timestamp courant
- Ne pas cliquer Play, juste SPACE
```

### Étape 7.3 : Vérifier les edge cases

Testez les cas limites :

```
- Qu'arrive-t-il si on upload un fichier audio non valide ?
  → Doit afficher un message d'erreur
- Qu'arrive-t-il si on exporte sans aucune lyric synced ?
  → Doit afficher un message d'erreur ou un fichier vide
- Qu'arrive-t-il si on upload un audio très long (> 1 heure) ?
  → Le format de temps doit rester correct
- Qu'arrive-t-il si on colle des lyrics avec des lignes vides ?
  → Elles doivent être ignorées
- Qu'arrive-t-il si on clique SPACE sans sélectionner de ligne ?
  → Rien ne doit se passer (pas d'erreur)
```

### Étape 7.4 : Test de compatibilité navigateurs

Testez sur plusieurs navigateurs :

- Chrome / Chromium (DE FACTO)
- Firefox (important, Web Audio API différente)
- Safari (important, restrictions sur autoplay)
- Edge

Points à vérifier sur chaque :
- Upload file fonctionne
- Audio play/pause fonctionne
- Timestamps affichés correctement
- Téléchargement fichiers fonctionne

---

## PHASE 8 : DOCUMENTATION & LIVRAISON

### Étape 8.1 : Écrire le README

**Fichier : `README.md`**

Créez un fichier README qui explique :

1. **Vue d'ensemble**
   ```
   - Titre : "🎵 Synced Lyrics Maker POC"
   - Description : Une ligne expliquant ce que c'est
   ```

2. **Features**
   ```
   - Upload audio files (MP3, WAV, etc.)
   - Input lyrics manually
   - Sync lyrics with manual timestamps
   - Export as JSON or .LRC format
   - Keyboard shortcuts (Space to sync)
   - Clean, intuitive UI
   ```

3. **Tech Stack**
   ```
   - React 18
   - Next.js 15
   - TypeScript
   - TailwindCSS
   - Web Audio API
   ```

4. **Installation & Lancement**
   ```
   git clone https://github.com/[user]/synced-lyrics-maker.git
   cd synced-lyrics-maker
   npm install
   npm run dev
   # Ouvrir http://localhost:3000
   ```

5. **How to Use (étapes)**
   ```
   1. Cliquer "Choose File" et uploader une chanson MP3
   2. Coller les lyrics dans la zone de texte
   3. Cliquer "Load Lyrics"
   4. Cliquer une ligne pour la sélectionner
   5. Jouer l'audio
   6. Quand vous arrivez au timing, appuyer SPACE
   7. Répéter pour toutes les lignes
   8. Cliquer "Download as JSON" ou "Download as .LRC"
   ```

6. **Formats d'export**
   ```
   JSON Format:
   [
     {"time": 2.50, "text": "First line"},
     {"time": 5.75, "text": "Second line"}
   ]
   
   LRC Format:
   [00:02.50]First line
   [00:05.75]Second line
   ```

7. **Limitations & Assumptions**
   ```
   - Synchronisation manuelle uniquement (pas d'IA)
   - Navigateur compatible Web Audio API requis
   - Pas de stockage cloud (localStorage optionnel)
   - Timestamp precision ±100ms selon le navigateur
   - Meilleur sur desktop, mobile supporté mais suboptimal
   ```

8. **Known Issues**
   ```
   - Large audio files (>100MB) may lag
   - Safari may require additional permissions
   - Some older browsers may not support Web Audio API
   ```

9. **Future Enhancements (v2+)**
   ```
   - AI-powered auto-sync
   - Import existing LRC files for editing
   - Undo/Redo system
   - Multi-language support
   - Collaborative editing
   - Cloud storage integration
   ```

10. **Project Structure**
    ```
    Expliquer brièvement :
    - components/ : UI components
    - hooks/ : Custom React hooks
    - utils/ : Helper functions
    - types/ : TypeScript types
    - app/ : Next.js pages
    ```

11. **Contributing**
    ```
    This is a POC. Feel free to fork and improve!
    Issues and PRs welcome.
    ```

12. **License**
    ```
    MIT or CC0 (public domain)
    ```

### Étape 8.2 : Ajouter des commentaires dans le code

Parcourez chaque fichier et ajoutez des commentaires :

```
- En haut de chaque fichier : expliquer son rôle
- Sur chaque fonction : expliquer ce qu'elle fait
- Sur les lignes complexes : ajouter une note
- Ne pas commenter le code trivial
```

Exemple :
```typescript
// hooks/useAudio.ts
/**
 * Custom hook for managing audio playback
 * Handles loading, playing, pausing, and seeking audio files
 * Returns current time, duration, and playback state
 */

export function useAudio() {
  // Reference to the HTML audio element
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // ... rest of code
}
```

### Étape 8.3 : Créer un CHANGELOG

**Fichier : `CHANGELOG.md`**

Documentez les versions :

```
# Changelog

## [0.1.0] - 2026-01-20 (POC Release)

### Features
- Upload and play audio files (MP3, WAV)
- Manual lyrics synchronization with timestamps
- Export synced lyrics as JSON or .LRC format
- Keyboard shortcuts (Space to sync current line)
- Visual indicators for synced/unsynced lyrics
- Clean, intuitive UI

### Architecture
- React 18 + Next.js 15 + TypeScript
- Web Audio API for audio handling
- Custom hooks for state management
- TailwindCSS for styling

### Known Limitations
- Manual sync only (no AI)
- Browser-based only (no backend)
- Desktop-first UI
- Timestamp precision ±100ms

### Next Steps (for v2)
- Auto-sync with AI/ML
- Import existing LRC files
- Cloud storage
- Collaborative editing
```

### Étape 8.4 : Préparer le déploiement

Optionnel, mais recommandé pour rendre le POC accessible :

**Option 1 : Vercel (recommandé pour Next.js)**
```
1. Pousser le code sur GitHub
2. Aller sur vercel.com
3. Cliquer "New Project"
4. Importer votre repo GitHub
5. Cliquer "Deploy"
6. Votre POC est live à https://[project-name].vercel.app
```

**Option 2 : Netlify**
```
1. Construire le projet : npm run build
2. Aller sur netlify.com
3. Drag-drop la folder .next sur Netlify
4. Votre POC est live
```

**Option 3 : Docker (si vous préférez)**
```
1. Créer un Dockerfile
2. Construire l'image
3. Pousser sur un registre (Docker Hub, etc.)
4. Déployer sur un serveur VPS
```

Pour un POC, Vercel est le plus simple.

### Étape 8.5 : Nettoyer et finaliser

Avant la livraison finale :

1. **Supprimer les fichiers de test temporaires**
   ```
   - app/test.tsx (si créé)
   - Commentaires de debug
   ```

2. **Vérifier les imports inutilisés**
   ```
   - ESLint devrait vous aider
   ```

3. **Tester le build final**
   ```
   npm run build
   npm run start
   # Vérifier que tout fonctionne en production
   ```

4. **Commit final**
   ```
   git add .
   git commit -m "Final POC release v0.1.0"
   git push
   git tag v0.1.0
   git push --tags
   ```

---

## RÉSUMÉ TIMELINE

Voici une estimation du temps pour chaque phase (basée sur un développeur avec expérience React) :

```
Phase 1 (Setup + Types)         : 2-3 heures
Phase 2 (Composants UI)         : 3-4 heures
Phase 3 (Hooks + Logique)       : 4-5 heures
Phase 4 (Intégration)           : 2-3 heures
Phase 5 (Export)                : 1-2 heures
Phase 6 (Polish)                : 2-3 heures (optionnel)
Phase 7 (Testing)               : 1-2 heures
Phase 8 (Documentation)         : 1-2 heures
                                 ————————————
TOTAL (features essentielles)   : 16-22 heures
TOTAL (avec polish)             : 18-25 heures
```

**En pratique :**
- 1 jour (8h) si vous travaillez efficacement
- 2-3 jours si c'est votre premier projet React/Next.js
- 4-5 jours si vous apprenez React en parallèle

---

## CHECKPOINTS CLÉS

Vous saurez que vous êtes sur la bonne voie si :

### ✓ Après Phase 1
- Project créé et structure en place
- Types TypeScript complets et propres

### ✓ Après Phase 2
- Les composants rendent correctement
- UI est propre et lisible

### ✓ Après Phase 3
- Les hooks fonctionnent isolément
- States mettent à jour correctement

### ✓ Après Phase 4
- Upload audio → ça joue ✓
- Coller lyrics → ça s'affiche ✓
- Cliquer une ligne → elle se sélectionne ✓
- SPACE → ça synchronise ✓

### ✓ Après Phase 5
- Télécharger JSON → fichier valide ✓
- Télécharger LRC → fichier valide ✓

### ✓ Après Phase 6
- Raccourcis clavier fonctionnent ✓
- Feedback visuel clair ✓

### ✓ Après Phase 7
- Tests manuels passent ✓
- Edge cases gérés ✓

### ✓ Après Phase 8
- README complet ✓
- Code commenté ✓
- Prêt pour la livraison ✓

---

## PIÈGES À ÉVITER

### Piège 1 : Trop de features à la fois
❌ Ne pas essayer d'implémenter auto-sync + import + multi-language en une seule pass
✅ Gardez-vous à la liste essentiellement du POC

### Piège 2 : Perfectionnisme sur le CSS
❌ Ne pas passer 5 heures pour rendre les boutons parfaits
✅ Utilisez TailwindCSS, gardez-le simple, c'est un POC

### Piège 3 : Pas de tests du tout
❌ Ne pas pousser sans tester manuellement
✅ Téléchargez les fichiers JSON/LRC générés et vérifiez

### Piège 4 : Mauvaise gestion de l'état
❌ Ne pas passer tout par des states globaux complexes
✅ Gardez useState simple, utilisez des hooks custom

### Piège 5 : Web Audio API trop complexe
❌ Ne pas essayer d'implémenter des features avancées (analysis, effects)
✅ Utilisez juste la play/pause/seek de base

### Piège 6 : Négliger la documentation
❌ Ne pas expédier le POC sans README
✅ Écrivez un README clair, les futures mainteneurs vous remercieront

---

## RESSOURCES UTILES

Garder à proximité pendant le développement :

**Documentation officielle :**
- React Hooks : https://react.dev/reference/react
- Next.js : https://nextjs.org/docs
- Web Audio API : https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- TailwindCSS : https://tailwindcss.com/docs

**Outils :**
- VS Code : https://code.visualstudio.com/
- Chrome DevTools : Inspect, Console, Network
- Postman : Pour tester les exports (optionnel)

**Références :**
- LRC Format : https://en.wikipedia.org/wiki/LRC_(file_format)
- JSON : https://www.json.org/
- UUID : https://en.wikipedia.org/wiki/Universally_unique_identifier

---

## CONCLUSION

Ce guide vous donne une feuille de route claire, étape par étape, pour terminer votre POC.

**Points clés :**
1. Découpez le projet en phases gérables
2. Testez au fur et à mesure (pas juste à la fin)
3. Gardez le scope limité (c'est un POC, pas un produit)
4. Documentez au fur et à mesure
5. Commitez régulièrement sur Git

Bonne chance ! 🎵
