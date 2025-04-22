# SuperHeroes Retro Battle

SuperHeroes Retro Battle est un projet de jeu de combat rétro en ligne basé sur Node.js, Express et SQLite. Ce jeu permet aux joueurs de choisir des super-héros, de les équiper avec des attaques et des défenses, et de s'affronter dans une arène virtuelle.

## Fonctionnalités

- **Choix des personnages** : Parcourez une liste de super-héros avec leurs statistiques et images.
- **Système de combat** : Engagez des combats tour par tour avec des attaques et des défenses aléatoires.
- **Barres de vie dynamiques** : Suivez les points de vie des héros en temps réel.
- **Effets visuels rétro** : Profitez d'une interface inspirée des jeux rétro avec des effets CRT.
- **Musique d'ambiance** : Activez ou désactivez la musique d'ambiance grâce à un lecteur YouTube intégré.
- **Historique des combats** : Consultez les actions de chaque tour dans un panneau d'historique.

## Prérequis

- **Node.js** (version 14 ou supérieure)
- **npm** (inclus avec Node.js)
- **SQLite** (pour la base de données)

## Installation

1. Clonez le projet:
   ```sh
   git clone https://github.com/ton-utilisateur/rpg-api.git
   cd rpg-api

2. Installez les dépendances: 
npm install

3. Lancez le serveur:
node server.js

4. Ouvrez votre navigateur et accédez à http://localhost:3000

## Utilisation
### Lancer le jeu

Accédez à http://localhost:3000.
Cliquez sur "Jouer" pour commencer un combat.
Choisissez vos attaques et défenses à chaque tour.
Consultez l'historique des actions dans le panneau latéral.

### Explorer les personnages

Cliquez sur "Personnages" dans le menu principal.
Parcourez la liste des super-héros avec leurs statistiques et images.

## API
### Routes disponibles
- GET /api/superheros : Récupère tous les super-héros avec leurs statistiques.
- GET /api/superheroes/:id : Récupère un super-héros spécifique par ID.
- GET /api/superheroes/:id/powerstats : Récupère les statistiques d'un super-héros par ID.
- GET /api/attacks : Récupère toutes les attaques disponibles.
- GET /api/defenses : Récupère toutes les défenses disponibles.
- GET /api/superheroes/random-pair : Récupère deux super-héros aléatoires pour un combat.
- POST /api/combat/init : Initialise un combat avec deux super-héros aléatoires.
- POST /api/combat/turn : Gère un tour de combat (attaque et défense).
