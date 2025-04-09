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

    // Ajouter un événement de clic sur les images des héros
    heroLeftImgEl.addEventListener('click', () => activateUltraInstinct('heroLeft', combatData.hero1));
    heroRightImgEl.addEventListener('click', () => activateUltraInstinct('heroRight', combatData.hero2));
  } catch (error) {
    console.error("Failed to initialize combat:", error);
    turnIndicatorEl.textContent = "Erreur de chargement...";
  }
}

// Affiche le GIF d'intro au chargement
const introContainer = document.getElementById('introGifContainer');
if (introContainer) {

    // Lancer l'audio
    const introAudio = new Audio('fight_sfx.mp3');
    introAudio.volume = 1;
    introAudio.play().catch(err => {
      console.warn("Lecture audio bloquée par le navigateur. Interaction utilisateur requise.", err);
    });
  
    setTimeout(() => {
    introContainer.style.opacity = '0';
    setTimeout(() => {
      introContainer.remove(); // Supprime le conteneur du DOM après la transition
    }, 500); // Temps de la transition CSS
  }, 950); // Durée d'affichage du GIF (ici 0.9 secondes)
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
  combatData = data.combatData;

  updateHeroUI('heroLeft', combatData.hero1);
  updateHeroUI('heroRight', combatData.hero2);
  updateTurnIndicator();
  updateButtonsForPhase();

  if (data.result) {
    const { attacker, attackUsed, defenderHp, defenseUsed, damage } = data.result;
    const attackerName = combatData[combatData.currentTurn].name;
    const defenderName = combatData[combatData.currentTurn === 'hero1' ? 'hero2' : 'hero1'].name;

    addToHistory(turnCounter, attackerName, attackUsed, defenderName, defenseUsed, damage, defenderHp);
    turnCounter++;
  }

  if (data.winner) {
    updateActionDisplay(`${data.winner} a gagné le combat !`);
    addToHistory(turnCounter, data.winner, "Victoire", "", "", 0, 0);
  
    // Affiche le GIF de victoire
    const victoryContainer = document.getElementById('victoryGifContainer');
    if (victoryContainer) {
      victoryContainer.style.display = 'flex';
      victoryContainer.style.opacity = '1';
  
      // Lancer le son KO
      const koAudio = new Audio('KO.mp3');
      koAudio.volume = 1.0;
      koAudio.play().catch(err => {
        console.warn("Lecture audio KO bloquée par le navigateur.", err);
      });

      setTimeout(() => {
        victoryContainer.style.opacity = '0';
        setTimeout(() => {
          victoryContainer.remove();
        }, 500);
      }, 3000); // Affiché pendant 3 secondes
    }
  
    // Message final
    setTimeout(() => {
      alert(`${data.winner} a gagné le combat !`);
    }, 500); // Décalé légèrement pour laisser le GIF s'afficher d'abord
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

// Active Ultra Instinct pour Goku
function activateUltraInstinct(heroId, heroData) {
  if (heroData.name.toLowerCase() === 'goku') {
    // Vérifier si Goku est déjà en Ultra Instinct
    if (heroData.isUltraInstinct) return;

    // Marquer que Goku est en Ultra Instinct
    heroData.isUltraInstinct = true;

    // Jouer le thème musical
    const audio = new Audio('ultra_instinct.mp3'); // Assurez-vous que ce fichier est dans le dossier public
    audio.play();

    // Afficher un message immédiatement
    updateActionDisplay(`${heroData.name} est passé en Ultra Instinct !`);

    // Attendre 2 secondes avant de changer l'image et les statistiques
    setTimeout(() => {
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
      const heroImg = heroElement.querySelector('.fighter-sprite');
      heroImg.style.transition = 'opacity 2s ease';
      heroImg.style.opacity = 0;

      heroImg.src = 'https://i.pinimg.com/736x/f1/50/68/f1506824eb8b77d75d3ae98c2557f617.jpg'; // Image de Goku Ultra Instinct
      heroImg.style.opacity = 1;

      // Mettre à jour les barres de statistiques avec une animation
      const stats = heroElement.querySelectorAll('.stat-row');
      animateStatIncrease(stats, heroData.powerstats);

      // Mettre à jour l'interface utilisateur pour refléter les nouvelles stats
      updateHeroUI(heroId, heroData);
    }, 1000); // Attendre 2 secondes avant de changer l'image et les stats
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

// --- Initialisation ---
document.addEventListener('DOMContentLoaded', initCombat);

// Remove the old DOMContentLoaded listener that added bars directly to p tags
// The new updateHeroUI handles stats rendering correctly.