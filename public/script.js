// Keep random hero selection if needed for other parts, otherwise remove
// randomHero1 = Math.floor(Math.random() * 9);
// randomHero2 = Math.floor(Math.random() * 9);

// --- Configuration ---
const MAX_HP = 1000; // Define Max HP for percentage calculation
const MAX_STAT = 100; // Max value for stats

// --- Global State ---
let combatData = null;
let previousHp = { hero1: MAX_HP, hero2: MAX_HP }; // Store previous HP for damage animation
let turnCounter = 1; // Track the number of turns

// Variables globales pour l'audio
let youtubePlayer = null;
let isMusicPlaying = false;
let cookiesAccepted = false;

// Collection de sons pour les effets
let soundEffects = {
  damageSounds: [],
  deniedSounds: [],
  loaded: false
};

// Charger les sons d'impact Roblox death et autres sons
function loadSoundEffects() {
  console.log("Début du chargement des sons...");
  
  // Sons de dégâts
  const robloxDeathSounds = [
    'Roblox_Death_Sound-OOF.mp3',
  ];
  
  // Sons de négation (attaque bloquée ou sans effet)
  const deniedSounds = [
    'Denied.mp3',
  ];
  
  console.log("Fichiers à charger:", robloxDeathSounds, deniedSounds);
  
  // Précharger tous les sons de dégâts
  robloxDeathSounds.forEach(soundFile => {
    try {
      console.log(`Tentative de chargement du son: ${soundFile}`);
      const audio = new Audio(soundFile);
      audio.preload = 'auto';
      audio.volume = 0.5;
      
      // Ajouter des événements pour détecter les problèmes de chargement
      audio.addEventListener('canplaythrough', () => {
        console.log(`Son ${soundFile} chargé avec succès`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Erreur de chargement du son ${soundFile}:`, e);
      });
      
      soundEffects.damageSounds.push(audio);
    } catch (error) {
      console.error(`Erreur lors du chargement du son ${soundFile}:`, error);
    }
  });
  
  // Précharger tous les sons de négation
  deniedSounds.forEach(soundFile => {
    try {
      const audio = new Audio(soundFile);
      audio.preload = 'auto';
      audio.volume = 0.5; // Volume initial à 50%
      soundEffects.deniedSounds.push(audio);
    } catch (error) {
      console.error(`Erreur lors du chargement du son ${soundFile}:`, error);
    }
  });
  
  soundEffects.loaded = soundEffects.damageSounds.length > 0 || soundEffects.deniedSounds.length > 0;
  console.log(`${soundEffects.damageSounds.length} sons de dégâts chargés`);
  console.log(`${soundEffects.deniedSounds.length} sons de négation chargés`);
}

// Jouer un son de dégât aléatoire
function playRandomDamageSound() {
  if (!soundEffects.loaded || soundEffects.damageSounds.length === 0) {
    console.warn('Aucun son de dégât n\'est chargé');
    return;
  }
  
  // Sélectionner un son aléatoire dans la collection
  const randomIndex = Math.floor(Math.random() * soundEffects.damageSounds.length);
  const sound = soundEffects.damageSounds[randomIndex];
  
  // Réinitialiser le son s'il est en cours de lecture
  sound.pause();
  sound.currentTime = 0;
  
  // Jouer le son
  try {
    sound.play().catch(error => {
      console.error('Erreur lors de la lecture du son:', error);
    });
  } catch (error) {
    console.error('Erreur lors de la lecture du son:', error);
  }
}

// Jouer un son de négation (attaque bloquée ou sans effet)
function playDeniedSound() {
  if (!soundEffects.loaded || soundEffects.deniedSounds.length === 0) {
    console.warn('Aucun son de négation n\'est chargé');
    return;
  }
  
  // Sélectionner un son dans la collection (ou toujours le premier si un seul)
  const sound = soundEffects.deniedSounds[0];
  
  // Réinitialiser le son s'il est en cours de lecture
  sound.pause();
  sound.currentTime = 0;
  
  // Jouer le son
  try {
    sound.play().catch(error => {
      console.error('Erreur lors de la lecture du son:', error);
    });
  } catch (error) {
    console.error('Erreur lors de la lecture du son:', error);
  }
}

// --- DOM Elements ---
const hpLeftFill = document.getElementById('hpLeftFill');
const hpRightFill = document.getElementById('hpRightFill');
const hpLeftContainer = document.getElementById('hpLeftContainer');
const hpRightContainer = document.getElementById('hpRightContainer');
const hpLeftText = document.getElementById('hpLeftText'); // Optional HP text
const hpRightText = document.getElementById('hpRightText'); // Optional HP text

const heroLeftNameEl = document.getElementById('heroLeftName');
const heroRightNameEl = document.getElementById('heroRightName');
const heroLeftImgEl = document.getElementById('heroLeftImg');
const heroRightImgEl = document.getElementById('heroRightImg');
const heroLeftStatsEl = document.getElementById('heroLeftStats');
const heroRightStatsEl = document.getElementById('heroRightStats');

const moveButtonsContainer = document.getElementById('moveButtons');
const turnIndicatorEl = document.getElementById('turnIndicator');

// DOM Elements pour la popup
const endGamePopup = document.getElementById('endGamePopup');
const winnerTitle = document.getElementById('winnerTitle');
const winnerMessage = document.getElementById('winnerMessage');
const viewHistoryButton = document.getElementById('viewHistoryButton');
const closePopupButton = document.getElementById('closePopupButton');

// DOM Elements pour les GIFs
const fightGif = document.getElementById('fightGif');
const koGif = document.getElementById('koGif');
const VSGif = document.getElementById('VSGif');

function showVSGif() {
  VSGif.classList.remove('hidden');
  VSGif.style.display = 'block';

}

// Fonction pour afficher le GIF de Fight
function showFightGif() {
    const fightSound = new Audio('fight_sfx.mp3'); // Chargez le son de Fight
    fightSound.volume = 0.7; // Ajustez le volume si nécessaire
    fightSound.play().catch(error => console.error('Erreur lors de la lecture du son Fight:', error));

    fightGif.classList.remove('hidden');
    fightGif.style.display = 'block';

    // Masquer le GIF après 2 secondes
    setTimeout(() => {
        fightGif.classList.add('hidden');
        fightGif.style.display = 'none';
        showVSGif();
    }, 950);
}



// Fonction pour afficher le GIF de KO
function showKoGif(callback) {
    const koSound = new Audio('KO.mp3'); // Chargez le son de KO
    koSound.volume = 0.7; // Ajustez le volume si nécessaire
    koSound.play().catch(error => console.error('Erreur lors de la lecture du son KO:', error));

    VSGif.classList.add('hidden');
    VSGif.style.display = 'none';

    koGif.classList.remove('hidden');
    koGif.style.display = 'block';

    // Masquer le GIF après 2 secondes et exécuter un callback
    setTimeout(() => {
        koGif.classList.add('hidden');
        koGif.style.display = 'none';
        if (callback) callback();
    }, 950);
}

// Fonction pour afficher le GIF de Victory
function showVictoryGif(callback) {
    const victoryGif = document.getElementById('victoryGif');
    victoryGif.classList.remove('hidden');
    victoryGif.style.display = 'block';

    // Masquer le GIF après 2 secondes et exécuter un callback (comme afficher la popup)
    setTimeout(() => {
        victoryGif.classList.add('hidden');
        victoryGif.style.display = 'none';
        if (callback) callback();
    }, 1000);
}

// Fonction pour vérifier si les cookies ont été acceptés
function checkCookieConsent() {
  const cookieConsent = localStorage.getItem('cookieConsent');
  if (cookieConsent === 'accepted') {
    cookiesAccepted = true;
    return true;
  } else if (cookieConsent === 'refused') {
    cookiesAccepted = false;
    return true;
  }
  return false;
}

// Afficher la bannière de cookies si nécessaire
function showCookieBanner() {
  const mainMenu = document.getElementById('mainMenu');
  const cookieBanner = document.getElementById('cookieBanner');

  // Vérifier si les cookies ont déjà été acceptés ou refusés
  if (!checkCookieConsent() && mainMenu && !mainMenu.classList.contains('hidden')) {
    cookieBanner.classList.add('show');
  } else if (cookiesAccepted) {
    // Initialiser l'audio si les cookies sont déjà acceptés
    initAudio();
  }
}

// Fonction pour vérifier si l'API YouTube est prête
function checkYouTubeApiReady() {
  console.log('Vérification de l\'API YouTube...');
  if (typeof YT !== 'undefined' && YT.Player) {
    console.log('API YouTube disponible');
    return true;
  }
  console.log('API YouTube pas encore disponible');
  return false;
}

// Fonction globale appelée par l'API YouTube quand elle est prête
function onYouTubeIframeAPIReady() {
  console.log('API YouTube iframe prête');
  if (cookiesAccepted) {
    initAudio();
  }
}

// Initialiser le lecteur YouTube
function initAudio() {
  if (cookiesAccepted && !youtubePlayer) {
    console.log('Initialisation de l\'audio...');
    const audioController = document.getElementById('audioController');
    audioController.classList.add('show');
    
    // Vérifier si l'API YouTube est chargée
    if (!checkYouTubeApiReady()) {
      console.error('L\'API YouTube n\'est pas chargée correctement');
      // Réessayer après un court délai
      setTimeout(initAudio, 1000);
      return;
    }
    
    // Créer un élément div pour le player YouTube (caché)
    const playerContainer = document.createElement('div');
    playerContainer.id = 'youtubePlayerContainer';
    document.body.appendChild(playerContainer);
    
    const playerDiv = document.createElement('div');
    playerDiv.id = 'youtubePlayer';
    playerDiv.style.position = 'absolute';
    playerDiv.style.top = '-9999px';
    playerDiv.style.left = '-9999px';
    playerContainer.appendChild(playerDiv);
    
    try {
      console.log('Création du player YouTube...');
      // Initialiser le player YouTube
      youtubePlayer = new YT.Player('youtubePlayer', {
        height: '0',
        width: '0',
        videoId: '_gEcossfP38', // ID de la vidéo Ultra Instinct Theme
        playerVars: {
          'autoplay': 0,
          'controls': 0,
          'disablekb': 1,
          'playsinline': 1,
          'rel': 0,
          'showinfo': 0,
          'modestbranding': 1,
          'origin': window.location.origin
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': (e) => console.error('Erreur YouTube:', e)
        }
      });
      console.log('Player YouTube créé');
    } catch (error) {
      console.error('Erreur lors de la création du player YouTube:', error);
    }
  }
}

// Appelé quand le player est prêt
function onPlayerReady(event) {
  console.log('YouTube Player prêt');
  // Préparer le player mais ne pas jouer automatiquement
  event.target.setVolume(50);
  updateAudioIcon();
}

// Gérer les changements d'état du player
function onPlayerStateChange(event) {
  console.log('État du player YouTube changé:', event.data);
  if (event.data === YT.PlayerState.ENDED) {
    // Rejouer la vidéo quand elle se termine
    event.target.playVideo();
  } else if (event.data === YT.PlayerState.PLAYING) {
    isMusicPlaying = true;
    updateAudioIcon();
  } else if (event.data === YT.PlayerState.PAUSED) {
    isMusicPlaying = false;
    updateAudioIcon();
  }
}

// Basculer la lecture audio
function toggleAudio() {
  console.log('Bouton audio cliqué');
  if (!youtubePlayer) {
    console.error('Le player YouTube n\'est pas initialisé');
    return;
  }
  
  console.log('État actuel de la lecture:', isMusicPlaying);
  if (isMusicPlaying) {
    console.log('Pause de la vidéo');
    youtubePlayer.pauseVideo();
    isMusicPlaying = false;
  } else {
    console.log('Lecture de la vidéo');
    youtubePlayer.playVideo();
    isMusicPlaying = true;
  }
  
  updateAudioIcon();
}

// Gérer le changement de volume
function handleVolumeChange(e) {
  const volume = e.target.value;
  
  // Ajuster le volume du lecteur YouTube
  if (youtubePlayer) {
    youtubePlayer.setVolume(volume);
  }
  
  // Ajuster le volume des effets sonores
  const volumeRatio = volume / 100; // Convertir 0-100 en 0-1 pour l'API Audio
  
  // Ajuster le volume des sons de dégâts
  soundEffects.damageSounds.forEach(sound => {
    sound.volume = volumeRatio * 0.6; // 60% du volume principal
  });
  
  // Ajuster le volume des sons de négation
  soundEffects.deniedSounds.forEach(sound => {
    sound.volume = volumeRatio * 0.4; // 40% du volume principal (moins fort)
  });
}

// Mettre à jour l'icône audio
function updateAudioIcon() {
  const audioIcon = document.getElementById('audioIcon');
  if (isMusicPlaying) {
    audioIcon.textContent = '🔊';
  } else {
    audioIcon.textContent = '🔇';
  }
}

// Fonction pour mettre en pause temporairement la musique YouTube
function pauseYouTubeTemporarily(duration = 4000) {
  if (!youtubePlayer) {
    console.log('Player YouTube non initialisé');
    return;
  }
  
  console.log('Pause temporaire de la musique YouTube');
  if (isMusicPlaying) {
    // Sauvegarder l'état actuel
    const wasPlaying = true;
    let currentVolume = 50;
    
    try {
      currentVolume = youtubePlayer.getVolume();
    } catch (error) {
      console.error('Erreur lors de la récupération du volume:', error);
    }
    
    // Mettre en pause la vidéo
    try {
      youtubePlayer.pauseVideo();
      isMusicPlaying = false;
      updateAudioIcon();
      
      // Réactiver après la durée spécifiée
      setTimeout(() => {
        console.log('Reprise de la musique après pause temporaire');
        if (wasPlaying) {
          youtubePlayer.playVideo();
          youtubePlayer.setVolume(currentVolume);
          isMusicPlaying = true;
          updateAudioIcon();
        }
      }, duration);
    } catch (error) {
      console.error('Erreur lors de la pause de la vidéo:', error);
    }
  }
}

// --- Core Functions ---

// Initialise le combat
async function initCombat() {
  try {
    const response = await fetch('/api/combat/init', { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    combatData = await response.json();

    // Initialize previous HP
    previousHp.hero1 = combatData.hero1.hp;
    previousHp.hero2 = combatData.hero2.hp;

    updateHeroUI('heroLeft', combatData.hero1);
    updateHeroUI('heroRight', combatData.hero2);
    updateTurnIndicator();
    updateButtonsForPhase();

    // Supprimer les écouteurs précédents SANS clonage
    heroLeftImgEl.onclick = null;
    heroRightImgEl.onclick = null;
    
    // Mettre à jour le style pour indiquer qu'ils sont cliquables
    heroLeftImgEl.style.cursor = "pointer";
    heroRightImgEl.style.cursor = "pointer";

    // Ajouter des écouteurs d'événements avec une fonction nommée (plus facile à déboguer)
    heroLeftImgEl.onclick = function() {
      console.log("Image du héros gauche cliquée");
      activateUltraInstinct('heroLeft', combatData.hero1);
    };
    
    heroRightImgEl.onclick = function() {
      console.log("Image du héros droite cliquée");
      activateUltraInstinct('heroRight', combatData.hero2);
    };

  } catch (error) {
    console.error("Failed to initialize combat:", error);
    turnIndicatorEl.textContent = "Erreur de chargement...";
  }
}

// Met à jour l'interface utilisateur pour un héros (Left or Right)
function updateHeroUI(heroSide, heroData) {
  const isLeft = heroSide === 'heroLeft';

  const nameEl = isLeft ? heroLeftNameEl : heroRightNameEl;
  const imgEl = isLeft ? heroLeftImgEl : heroRightImgEl;
  const statsEl = isLeft ? heroLeftStatsEl : heroRightStatsEl;
  const hpFillEl = isLeft ? hpLeftFill : hpRightFill;
  const hpContainerEl = isLeft ? hpLeftContainer : hpRightContainer;
  const hpTextEl = isLeft ? hpLeftText : hpRightText; // Optional

  const currentHp = heroData.hp < 0 ? 0 : heroData.hp; // Ensure HP doesn't go below 0
  const previousHeroHp = isLeft ? previousHp.hero1 : previousHp.hero2;

  // Update Name and Image
  nameEl.textContent = heroData.name;

  // Ne pas réinitialiser l'image si Goku est en Ultra Instinct
  if (!heroData.isUltraInstinct) {
    imgEl.src = heroData.image || 'hero.jpg'; // Use default if no image
    imgEl.alt = `${heroData.name} Sprite`;
  }

  // Update HP Bar
  const hpPercentage = (currentHp / MAX_HP) * 100;
  hpFillEl.style.width = `${hpPercentage}%`;
  if (hpTextEl) { // Update optional HP text
    hpTextEl.textContent = `${isLeft ? 'P1' : 'P2'} HP: ${currentHp}`;
  }

  // Trigger Damage Animation if HP decreased
  if (currentHp < previousHeroHp) {
    // Jouer un son de dégât aléatoire
    playRandomDamageSound();
    
    // Animation d'impact (déjà existante)
    hpContainerEl.classList.add('damage');
    setTimeout(() => {
      hpContainerEl.classList.remove('damage');
    }, 450); // Match vibration animation duration
  }

  // Update Stats Section
  statsEl.innerHTML = ''; // Clear previous stats
  const stats = [
    { name: 'INT', value: heroData.powerstats.intelligence },
    { name: 'STR', value: heroData.powerstats.strength },
    { name: 'SPD', value: heroData.powerstats.speed },
    { name: 'DUR', value: heroData.powerstats.durability },
    { name: 'POW', value: heroData.powerstats.power },
    { name: 'COM', value: heroData.powerstats.combat }
  ];

  stats.forEach(stat => {
    const statValue = stat.value || 0; // Default to 0 if null/undefined
    const statPercentage = (statValue / MAX_STAT) * 100;

    const statRow = document.createElement('div');
    statRow.className = 'stat-row';
    statRow.innerHTML = `
      <span>${stat.name}</span>
      <div class="stat-bar">
        <div class="stat-fill" style="width: ${statPercentage}%;"></div>
      </div>
    `;
    statsEl.appendChild(statRow);
  });

  // Store current HP for next update comparison
  if (isLeft) {
    previousHp.hero1 = currentHp;
  } else {
    previousHp.hero2 = currentHp;
  }
}

// Met à jour les boutons en fonction de la phase actuelle
function updateButtonsForPhase() {
  const buttons = moveButtonsContainer.querySelectorAll('button');
  if (!combatData) return; // Guard clause

  const isAttackPhase = combatData.currentPhase === 'attack';
  const currentHero = combatData.currentTurn === 'hero1' ? combatData.hero1 : combatData.hero2;
  const moves = isAttackPhase ? currentHero.attacks : currentHero.defenses;

  buttons.forEach((button, index) => {
    const move = moves ? moves[index] : null; // Check if moves array exists
    button.textContent = move ? move.name : (isAttackPhase ? 'Attaque?' : 'Défense?');
    button.disabled = !move; // Disable if no move available

    // Add base class and phase-specific style (optional)
    button.className = 'fight-btn'; // Ensure base style is applied
    // Example: Different colors for attack/defense buttons
    if (isAttackPhase) {
      button.style.borderColor = '#ff6b00'; // Orange for attack
      button.style.boxShadow = '2px 2px 0px #803600';
    } else {
      button.style.borderColor = '#4cc9f0'; // Blue for defense
      button.style.boxShadow = '2px 2px 0px #005f80';
    }
    button.style.backgroundColor = '#4a2f10'; // Reset background

    // Update button click handler (remove old before adding new)
    // Clone the button to remove all previous event listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    if (move) { // Only add listener if the move is valid
      newButton.addEventListener('click', () => handleButtonClick(index));
    }
  });
}

// Met à jour l'indicateur de tour
function updateTurnIndicator() {
  if (!combatData) return; // Guard clause
  const currentPlayer = combatData.currentTurn === 'hero1' ? 'Joueur 1' : 'Joueur 2';
  const currentPhase = combatData.currentPhase === 'attack' ? 'Attaque' : 'Défense';
  turnIndicatorEl.textContent = `Tour de ${currentPlayer} - Phase: ${currentPhase}`;
  turnIndicatorEl.style.color = combatData.currentTurn === 'hero1' ? '#ffd700' : '#f72585'; // Different color per player turn
}

// Gère un tour de combat
async function playTurn(attackIndex, defenseIndex = null) {
  const response = await fetch('/api/combat/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ combatData, attackIndex, defenseIndex }),
  });

  const data = await response.json();
  
  // Sauvegardez l'état précédent pour comparaison
  const previousHero1Hp = combatData.hero1.hp;
  const previousHero2Hp = combatData.hero2.hp;
  const previousPhase = combatData.currentPhase;
  const previousTurn = combatData.currentTurn;
  
  // Mettre à jour les données de combat
  combatData = data.combatData;
  
  // Déterminer si une attaque vient d'être effectuée sans causer de dégâts
  if (previousPhase === 'attack' && combatData.currentPhase === 'defense') {
    // Une attaque vient d'être sélectionnée
    attackJustHappened = true;
  } else if (previousPhase === 'defense' && combatData.currentPhase === 'attack') {
    // L'attaque est terminée, vérifier si des dégâts ont été infligés
    const defenderHero = previousTurn === 'hero1' ? 'hero2' : 'hero1';
    const previousHp = defenderHero === 'hero1' ? previousHero1Hp : previousHero2Hp;
    const currentHp = defenderHero === 'hero1' ? combatData.hero1.hp : combatData.hero2.hp;
    
    if (previousHp === currentHp && data.result && data.result.damage === 0) {
      // L'attaque n'a pas causé de dégâts, jouer le son denied
      playDeniedSound();
      
      // Ajouter l'animation de blocage sur la barre de vie du défenseur
      const defenderHpContainer = defenderHero === 'hero1' ? hpLeftContainer : hpRightContainer;
      defenderHpContainer.classList.add('blocked');
      setTimeout(() => {
        defenderHpContainer.classList.remove('blocked');
      }, 300);
    }
    
    // Réinitialiser le flag
    attackJustHappened = false;
  }

  // Mettre à jour l'interface
  updateHeroUI('heroLeft', combatData.hero1);
  updateHeroUI('heroRight', combatData.hero2);
  updateTurnIndicator();
  updateButtonsForPhase();

  // Gérer le résultat et l'historique
  if (data.result) {
    const { attackUsed, defenderHp, defenseUsed, damage } = data.result;
    const attackerName = previousTurn === 'hero1' ? combatData.hero1.name : combatData.hero2.name;
    const defenderName = previousTurn === 'hero1' ? combatData.hero2.name : combatData.hero1.name;

    addToHistory(turnCounter, attackerName, attackUsed, defenderName, defenseUsed, damage, defenderHp);
    turnCounter++;
  }

  if (data.winner) {
    updateActionDisplay(`${data.winner} a gagné le combat !`);
    addToHistory(turnCounter, data.winner, "Victoire", "", "", 0, 0);

    // Afficher le GIF de KO suivi du GIF de Victory, puis afficher la popup
    const loser = data.winner === combatData.hero1.name ? combatData.hero2.name : combatData.hero1.name;
    showKoGif(() => {
        showVictoryGif(() => {
            showEndGamePopup(data.winner, loser);
        });
    });
  }
}

// Helper to disable/enable all move buttons
function setButtonsDisabled(disabled) {
  moveButtonsContainer.querySelectorAll('button').forEach(button => {
    button.disabled = disabled;
  });
}

// Unified button click handler
function handleButtonClick(index) {
  if (!combatData) return; // Guard clause

  const currentHeroTurn = combatData.currentTurn; // 'hero1' or 'hero2'
  const currentPhase = combatData.currentPhase; // 'attack' or 'defense'

  // Determine if the action corresponds to the current player and phase
  if (currentPhase === 'attack' && currentHeroTurn === 'hero1') playTurn(index, null);
  else if (currentPhase === 'defense' && currentHeroTurn === 'hero2') playTurn(null, index);
  else if (currentPhase === 'attack' && currentHeroTurn === 'hero2') playTurn(index, null);
  else if (currentPhase === 'defense' && currentHeroTurn === 'hero1') playTurn(null, index);
  // No 'else' needed as buttons for the wrong player/phase should be implicitly handled by updateButtonsForPhase or game logic
}

// Variable pour suivre si une attaque vient d'être effectuée
let attackJustHappened = false;

// Active Ultra Instinct pour Goku
function activateUltraInstinct(heroId, heroData) {
  console.log("Tentative d'activation d'Ultra Instinct pour:", heroData.name);
  
  // Vérification du héros avec plus de tolérance sur le nom
  if (heroData.name && heroData.name.toLowerCase().includes('goku')) {
    console.log("Héros identifié comme Goku, vérification de l'état Ultra Instinct");
    
    // Vérifier si Goku est déjà en Ultra Instinct
    if (heroData.isUltraInstinct) {
      console.log("Ultra Instinct déjà activé");
      return;
    }

    console.log("Activation d'Ultra Instinct...");
    
    // Marquer que Goku est en Ultra Instinct
    heroData.isUltraInstinct = true;

    // Mettre en pause temporairement la musique YouTube
    pauseYouTubeTemporarily(4000);

    // Jouer le thème musical d'ultra instinct
    try {
      const audio = new Audio('ultra_instinct.mp3');
      audio.loop = false;
      audio.volume = 0.7;
      
      audio.addEventListener('canplaythrough', () => {
        console.log("Son Ultra Instinct chargé avec succès");
        audio.play().catch(e => console.error("Erreur de lecture du son Ultra Instinct:", e));
      });
      
      audio.addEventListener('error', (e) => {
        console.error("Erreur de chargement du son Ultra Instinct:", e);
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'audio Ultra Instinct:", error);
    }

    // Afficher un message immédiatement
    updateActionDisplay(`${heroData.name} est passé en Ultra Instinct !`);

    // Changement de statistiques et d'apparence
    setTimeout(() => {
      console.log("Application des transformations Ultra Instinct...");
      
      // Augmenter les statistiques à 300
      heroData.powerstats = {
        intelligence: 300,
        strength: 300,
        speed: 300,
        durability: 300,
        power: 300,
        combat: 300,
      };

      // Changer l'image de Goku en Ultra Instinct avec un effet de fondu
      const heroElement = document.getElementById(heroId);
      if (!heroElement) {
        console.error("Élément héros non trouvé:", heroId);
        return;
      }
      
      const heroImg = heroElement.querySelector('.fighter-sprite');
      if (!heroImg) {
        console.error("Image du combattant non trouvée");
        return;
      }
      
      heroImg.style.transition = 'opacity 2s ease';
      heroImg.style.opacity = 0;
      
      // Utiliser un setTimeout pour s'assurer que l'effet de fondu est visible
      setTimeout(() => {
        heroImg.src = 'https://i.pinimg.com/736x/f1/50/68/f1506824eb8b77d75d3ae98c2557f617.jpg';
        heroImg.style.opacity = 1;
        console.log("Image Ultra Instinct appliquée");
      }, 500);

      // Mettre à jour les barres de statistiques avec une animation
      const stats = heroElement.querySelectorAll('.stat-row');
      if (stats.length > 0) {
        animateStatIncrease(stats, heroData.powerstats);
        console.log("Animation des statistiques démarrée");
      } else {
        console.error("Éléments de statistiques non trouvés");
      }

      // Mettre à jour l'interface utilisateur pour refléter les nouvelles stats
      updateHeroUI(heroId, heroData);
      console.log("Interface utilisateur mise à jour");
    }, 1000);
  } else {
    console.log("Ce héros n'est pas Goku, Ultra Instinct non disponible");
  }
}

// Anime l'augmentation des statistiques
function animateStatIncrease(statElements, stats, duration = 4000) {
  statElements.forEach((el, index) => {
    let statValue = 0;

    // Déterminer la valeur de la statistique correspondante
    switch (index) {
      case 0: statValue = stats.intelligence || 0; break;
      case 1: statValue = stats.strength || 0; break;
      case 2: statValue = stats.speed || 0; break;
      case 3: statValue = stats.durability || 0; break;
      case 4: statValue = stats.power || 0; break;
      case 5: statValue = stats.combat || 0; break;
    }

    const maxValue = 300; // La valeur maximale des statistiques
    const bar = el.querySelector('.stat-fill');
    const startValue = parseFloat(bar.style.width) || 0; // Largeur actuelle de la barre
    const targetWidth = (statValue / maxValue) * 100; // Largeur cible en pourcentage
    const increment = (targetWidth - startValue) / (duration / 50); // Incrément par frame (50ms)

    let currentWidth = startValue;

    const interval = setInterval(() => {
      currentWidth += increment;
      if (currentWidth >= targetWidth) {
        currentWidth = targetWidth; // S'assurer que la largeur ne dépasse pas la cible
        clearInterval(interval);
      }

      // Mettre à jour la largeur de la barre
      bar.style.width = `${currentWidth}%`;
    }, 50); // Mettre à jour toutes les 50ms
  });
}

// Ajoute un tour au journal
function addToHistory(turn, attacker, attackUsed, defender, defenseUsed, damage, defenderHp) {
  const historyList = document.getElementById('historyList');
  const listItem = document.createElement('li');
  listItem.innerHTML = `
    <strong>Tour ${turn}</strong>
    <div class="details">
      <p><strong>${attacker}</strong> utilise <strong>${attackUsed}</strong></p>
      <p><strong>${defender}</strong> utilise <strong>${defenseUsed}</strong></p>
      <p>Dégâts infligés : ${damage}</p>
      <p>HP restants de ${defender} : ${defenderHp}</p>
    </div>
  `;
  historyList.appendChild(listItem);

  // Faire défiler automatiquement vers le bas
  historyList.scrollTop = historyList.scrollHeight;
}

// Met à jour l'affichage des actions
function updateActionDisplay(message) {
  const actionDisplay = document.getElementById('actionDisplay');
  if (!actionDisplay) {
    console.error("L'élément #actionDisplay est introuvable dans le DOM.");
    return;
  }

  actionDisplay.textContent = message;

  // Ajouter une animation pour rendre le message visible temporairement
  actionDisplay.style.opacity = 1;
  setTimeout(() => {
    actionDisplay.style.opacity = 0;
  }, 3000); // Le message disparaît après 3 secondes
}

// Fonction pour afficher la popup de fin de combat
function showEndGamePopup(winner, loser) {
    winnerTitle.textContent = `${winner} a gagné !`;
    winnerMessage.textContent = `${winner} a vaincu ${loser} dans un combat épique !`;
    endGamePopup.classList.remove('hidden');
    endGamePopup.style.display = 'block';
}

// Fonction pour fermer la popup
function closeEndGamePopup() {
    endGamePopup.classList.add('hidden');
    endGamePopup.style.display = 'none';
}

// Gestionnaire pour afficher l'historique
viewHistoryButton.addEventListener('click', () => {
    closeEndGamePopup();
    document.getElementById('combatHistory').style.transform = 'translateX(0)';
});

// Gestionnaire pour fermer la popup
closePopupButton.addEventListener('click', closeEndGamePopup);

// --- Initialisation ---
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM chargé, initialisation du jeu...");
  
  // Chargement des sons d'effet
  loadSoundEffects();
  
  const mainMenu = document.getElementById('mainMenu');
  const charactersMenu = document.getElementById('charactersMenu');
  const playButton = document.getElementById('playButton');
  const charactersButton = document.getElementById('charactersButton');
  const backToMenuButton = document.getElementById('backToMenuButton');
  const charactersList = document.getElementById('charactersList');
  const homeButton = document.getElementById('homeButton');
  const restartButton = document.getElementById('restartButton');

  // Afficher le menu principal
  function showMainMenu() {
    document.body.classList.add('menu-visible');
    mainMenu.classList.remove('hidden');
    charactersMenu.classList.add('hidden');
    document.querySelector('.arena').style.display = 'none';
  }

  // Afficher le menu des personnages
  function showCharactersMenu() {
    document.body.classList.add('menu-visible');
    mainMenu.classList.add('hidden');
    charactersMenu.classList.remove('hidden');
    loadCharacters();
  }

  // Fonction pour lancer le jeu
  function startGame() {
    document.body.classList.remove('menu-visible');
    mainMenu.classList.add('hidden');
    document.querySelector('.arena').style.display = 'block';

    // Générer les personnages avant d'afficher le GIF
    initCombat().then(() => {
        // Afficher le GIF de Fight après la génération des personnages
        showFightGif();

        // Démarrer le combat après un court délai pour laisser le GIF s'afficher
        setTimeout(() => {
            updateTurnIndicator();
            updateButtonsForPhase();
        }, 2000);
    });
  }

  // Fonction pour redémarrer le jeu
  function restartGame() {
    // Réinitialiser les valeurs de combat
    combatData = null;
    previousHp = { hero1: MAX_HP, hero2: MAX_HP };
    turnCounter = 1;
    
    // Réinitialiser l'interface
    const historyList = document.getElementById('historyList');
    if (historyList) historyList.innerHTML = '';
    
    // Relancer le combat
    initCombat();
    
    // Afficher un message
    updateActionDisplay("Nouvelle partie commencée !");
  }

  // Charger les personnages
  async function loadCharacters() {
    charactersList.innerHTML = ''; // Clear previous characters
    try {
      const response = await fetch('/api/superheros');
      const characters = await response.json();
      characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
          <img src="${character.image || 'hero.jpg'}" alt="${character.name}">
          <h3>${character.name}</h3>
          <div class="stats-overlay">
            <p>INT: ${character.powerstats.intelligence}</p>
            <p>STR: ${character.powerstats.strength}</p>
            <p>SPD: ${character.powerstats.speed}</p>
            <p>DUR: ${character.powerstats.durability}</p>
            <p>POW: ${character.powerstats.power}</p>
            <p>COM: ${character.powerstats.combat}</p>
          </div>
        `;
        charactersList.appendChild(card);
      });
    } catch (error) {
      console.error('Erreur lors du chargement des personnages:', error);
      charactersList.innerHTML = '<p>Impossible de charger les personnages.</p>';
    }
  }

  // Ajouter les gestionnaires d'événements
  playButton.addEventListener('click', startGame);
  charactersButton.addEventListener('click', showCharactersMenu);
  backToMenuButton.addEventListener('click', showMainMenu);
  
  // Nouveaux gestionnaires pour les boutons de contrôle du jeu
  homeButton.addEventListener('click', () => {
    // Stopper la musique YouTube si elle est en cours
    if (youtubePlayer && isMusicPlaying) {
      youtubePlayer.pauseVideo();
      isMusicPlaying = false;
      updateAudioIcon();
    }
    showMainMenu();
  });
  
  restartButton.addEventListener('click', restartGame);

  // Afficher le menu principal au démarrage
  showMainMenu();

  // Afficher la bannière de cookies si nécessaire
  showCookieBanner();

  // Gérer le consentement des cookies
  document.getElementById('acceptCookies').addEventListener('click', function () {
    console.log('Cookies acceptés');
    localStorage.setItem('cookieConsent', 'accepted');
    cookiesAccepted = true;
    document.getElementById('cookieBanner').classList.remove('show');

    // Vérifier si l'API YouTube est prête avant d'initialiser l'audio
    if (checkYouTubeApiReady()) {
      initAudio();
    } else {
      console.log('En attente de l\'API YouTube...');
      // onYouTubeIframeAPIReady sera appelé automatiquement quand l'API sera prête
    }
  });

  document.getElementById('refuseCookies').addEventListener('click', function () {
    console.log('Cookies refusés');
    localStorage.setItem('cookieConsent', 'refused');
    cookiesAccepted = false;
    document.getElementById('cookieBanner').classList.remove('show');
  });

  // Audio controller event listeners
  document.getElementById('toggleAudio').addEventListener('click', function () {
    console.log('Clic sur le bouton audio');
    toggleAudio();
  });
  document.getElementById('volumeSlider').addEventListener('input', handleVolumeChange);

  // Vérifier si les cookies ont déjà été acceptés
  if (cookiesAccepted && checkYouTubeApiReady()) {
    console.log('Cookies déjà acceptés, initialisation audio');
    initAudio();
  }

  // Écouteur global pour le débogage
  document.addEventListener('click', function(e) {
    console.log('Élément cliqué:', e.target);
    if (e.target.classList.contains('fighter-sprite')) {
      console.log('Image de héros cliquée!');
    }
  });
});