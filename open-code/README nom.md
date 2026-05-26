# 🤖 NomadVerse — OpenBot Playground Adapté

> **Base open source :** [OpenBot Playground (Intel ISL)](https://github.com/isl-org/OpenBot)  
> **Fork utilisé :** [Nawresbensaid/OpenBot](https://github.com/Nawresbensaid/OpenBot)  
> **Projet :** NomadVerse : Oman Stories — PFE 2025/2026

---

## 📖 Présentation

NomadVerse utilise le code open source **OpenBot Playground** comme base de son interface Playground. OpenBot Playground est une plateforme **drag-and-drop** permettant de programmer un robot OpenBot via des blocs visuels [Blockly](https://developers.google.com/blockly), sans écrire de code textuel.

Dans le cadre de NomadVerse, ce code a été **adapté et enrichi** pour :

- 🔄 Remplacer le backend Android d'OpenBot par le simulateur **Webots R2025**
- 🧩 Ajouter le module `parser.js` — traducteur Blockly → commandes JSON → Webots
- 📹 Intégrer un **stream vidéo temps réel** depuis la caméra embarquée virtuelle d'OpenBot (port `8766`)
- 🧠 Ajouter des **blocs conditionnels IA** (détection d'obstacles via capteur de distance Webots)
- 🎨 Adapter le thème visuel au design **NomadVerse / Sultanat d'Oman**

---

## 🏗️ Architecture NomadVerse (Sprint 1)

```
OpenBot Playground (React — open source adapté)
        │
        │  Blockly workspace
        ▼
    parser.js
  (traduction blocs → JSON)
        │
        ├──── WebSocket port 8765 ────► Webots Controller (Python)
        │         (commandes)                   │
        │                                       ├── setVelocity() → OpenBot virtuel
        │                                       ├── capteur distance (lu en continu)
        │                                       └── camera.getImage() → frame JPEG
        │
        └──── WebSocket port 8766 ◄─── Webots Controller (Python)
                  (stream vidéo)          (broadcast frames base64)
```

---

## 📁 Structure du projet — `open-code/src`

```
open-code/
├── public/
│   ├── robots.txt
│   └── video.mp4
│
└── src/
    ├── apis/                               # Appels API externes
    │
    ├── assets/                             # Ressources statiques
    │   ├── font/
    │   ├── images/
    │   └── videos/
    │
    ├── components/                         # Composants React réutilisables
    │   │
    │   ├── blockly/                        # ⭐ Intégration Blockly complète
    │   │   ├── blocks/                     # Définition des blocs Blockly
    │   │   │   ├── customblocks.js         # Blocs NomadVerse (ai_if_obstacle, avoid…)
    │   │   │   ├── field_toggle.js         # Champ toggle personnalisé
    │   │   │   └── generalBlocks.js        # Blocs génériques OpenBot
    │   │   ├── fields/                     # Champs Blockly personnalisés
    │   │   ├── generator/                  # Générateurs de code (JS/Python)
    │   │   ├── toolbox/                    # Configuration de la boîte à outils
    │   │   ├── BlocklyComponent.css
    │   │   ├── BlocklyComponent.jsx        # Composant principal de l'éditeur
    │   │   ├── index.js
    │   │   └── README.md (+ i18n)          # READMEs multilingues (DE, ES, FR, ZH)
    │   │
    │   ├── bottomBar/                      # Barre inférieure du Playground
    │   │   ├── bottomBar.js
    │   │   ├── modelUploadingComponent.js
    │   │   └── style.module.css
    │   │
    │   ├── buttonComponent/                # Boutons réutilisables
    │   │   ├── blueButtonComponent.js
    │   │   └── buttonComponent.module.css
    │   │
    │   ├── drawer/                         # Panneau latéral (drawer)
    │   │   └── drawer.js
    │   │
    │   ├── editor/                         # Éditeur de code textuel
    │   │   └── codeEditor.js
    │   │
    │   ├── fonts/                          # Polices personnalisées
    │   │
    │   ├── homeComponents/                 # Composants de la page d'accueil
    │   │   ├── carousel/
    │   │   │   ├── carousel.js
    │   │   │   └── carousel.module.css
    │   │   ├── cookies/
    │   │   │   ├── cookies.js
    │   │   │   └── cookies.module.css
    │   │   ├── header/
    │   │   │   ├── editProfileModal.js
    │   │   │   ├── headerComponents.js
    │   │   │   ├── helpCenterModal.js
    │   │   │   ├── logOutAndDeleteModal.js
    │   │   │   ├── profileOptionModal.js
    │   │   │   └── profileOptionModal.js
    │   │   └── myProjects/
    │   │       ├── card.js
    │   │       ├── newProject.js
    │   │       ├── newProject.module.css
    │   │       └── newProjectButton.js
    │   │
    │   ├── inputComponent/                 # Champs de saisie
    │   │   ├── inputComponent.module.css
    │   │   └── simpleInputComponent.js
    │   │
    │   ├── levels/                         # ⭐ Module niveaux NomadVerse
    │   │   ├── HomeScreen.jsx
    │   │   ├── IntroCinematic.jsx          # Cinématique d'intro
    │   │   ├── LevelCard.jsx
    │   │   ├── LevelsPage.jsx
    │   │   ├── LevelsScreen.jsx
    │   │   └── MissionCinematic.jsx        # Cinématique de mission
    │   │
    │   ├── loader/
    │   │   └── loaderComponent.js
    │   │
    │   ├── navBar/                         # Barre de navigation
    │   │   ├── header.js
    │   │   ├── navbar.module.css
    │   │   └── ScoreLevelHUD.jsx           # ⭐ HUD score/niveau NomadVerse
    │   │
    │   └── qrcode/                         # Génération QR Code
    │       ├── qrcode.js
    │       ├── qrCode.module.css
    │       └── styles.js
    │
    ├── router/
    │   └── router.js                       # Routing React
    │
    ├── subscription/                       # Gestion abonnements/modèles
    │   ├── subscriptionModel.js
    │   └── subscriptionModel.module.css
    │
    ├── context/
    │   └── context.js                      # Context global React
    │
    ├── data/
    │   └── levels.js                       # ⭐ Données des niveaux NomadVerse
    │
    ├── pages/                              # Pages de l'application
    │   ├── components/
    │   │   └── welcomeTransition.jsx       # Animation de transition
    │   ├── home/
    │   │   └── index.js                    # Page d'accueil
    │   ├── intro/
    │   │   └── index.js                    # Page d'introduction
    │   ├── playground/
    │   │   ├── index.js     (M)            # ⭐ Page Playground principale
    │   │   └── Tutorial.js  (M)            # Tutoriel interactif
    │   ├── signin/
    │   │   └── index.js
    │   └── signup/
    │       └── index.js
    │
    ├── services/                           # Services et intégrations externes
    │   ├── firebase.js                     # Authentification Firebase
    │   ├── googleDrive.js                  # Sync Google Drive
    │   ├── workspace.js                    # Gestion workspace Blockly
    │   └── README.md (+ i18n)
    │
    ├── utils/                              # Utilitaires
    │   ├── color.js
    │   ├── constants.js
    │   ├── images.js
    │   ├── parser.js          (M)          # ⭐ Traducteur Blockly → JSON → Webots
    │   └── useGameScore.js                 # ⭐ Hook score de jeu NomadVerse
    │
    ├── App.css
    ├── App.js                              # Point d'entrée React
    ├── config.json
    └── index.js
```

> **(M)** = fichier modifié / ajouté par NomadVerse  
> **⭐** = élément clé du projet

### 🔑 Fichiers clés

| Fichier | Rôle |
|---|---|
| `utils/parser.js` | Cœur du système : traduit les blocs Blockly en JSON puis en commandes Webots via WebSocket |
| `components/blockly/blocks/customblocks.js` | Blocs IA personnalisés (`ai_if_obstacle`, `avoid`, etc.) |
| `pages/playground/index.js` | Page Playground principale — éditeur + contrôles + stream vidéo |
| `data/levels.js` | Définition des niveaux, missions et objectifs NomadVerse |
| `components/levels/` | Écrans et cinématiques de progression NomadVerse |
| `components/navBar/ScoreLevelHUD.jsx` | HUD temps réel affichant score et niveau en jeu |
| `utils/useGameScore.js` | Logique de calcul et persistance du score |

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 18
- Python 3.11
- Webots R2025

### Installation

```bash
git clone https://github.com/Nawresbensaid/OpenBot.git
cd OpenBot/open-code
npm install
npm start
```

---
### Inisalisation de programme 
''' frontend :bash
cd OpenBot
cd open-code
npm start
''' backend :bash
cd OpenBot
cd backend
node server.js

## ✅ Fonctionnalités

### Ce qui vient d'OpenBot Playground (open source)

| Fonctionnalité | Description |
|---|---|
| Éditeur Blockly | Drag & drop de blocs de programmation visuelle |
| Workspace | Espace de travail avec blocs `Start` / `Forever` |
| Génération de code | Conversion des blocs en JavaScript ou Python |
| Stockage local | Sauvegarde automatique en `localStorage` |
| Google Drive | Sync des projets sur le cloud (optionnel) |
| QR Code | Génération d'un QR pour exécuter sur robot physique |

### Ce qui a été ajouté pour NomadVerse

| Fonctionnalité | Description |
|---|---|
| Intégration Webots | Robot virtuel dans Webots R2025 |
| `parser.js` | Traducteur Blockly → JSON → Webots |
| WebSocket `8765` | Canal commandes |
| WebSocket `8766` | Canal stream vidéo |
| Blocs IA | `ai_if_obstacle` → `avoid` → capteur Webots |
| Capteur distance | Infrarouge virtuel, seuil 15 cm |
| Système de niveaux | Missions, cinématiques, progression |
| HUD Score | Affichage temps réel score et niveau |

---

## 📊 Résultats Sprint 1

| Métrique | Valeur | Seuil |
|---|---|---|
| Latence commande | 22 ms | < 100 ms ✅ |
| Perte de commandes | 0 % | 0 % ✅ |
| Détection obstacle | 34 ms | < 100 ms ✅ |
| Stream vidéo | 28 fps | ≥ 20 fps ✅ |

---

## 📄 Licence

Ce projet est basé sur [OpenBot Playground](https://github.com/isl-org/OpenBot) (Apache License 2.0).  
Les modifications et ajouts NomadVerse sont la propriété de leurs auteurs — PFE 2025/2026.

---

*NomadVerse : Oman Stories — PFE 2025/2026*