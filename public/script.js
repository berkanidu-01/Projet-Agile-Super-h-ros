randomHero1 = Math.floor(Math.random() * 9);
randomHero2 = Math.floor(Math.random() * 9);

// Script pour animer les barres de progression
document.addEventListener('DOMContentLoaded', function() {
  const statElements = document.querySelectorAll('.heroStats p');
  const healthElements = document.querySelectorAll('.heroName');
  
  statElements.forEach(el => {
    const statValue = parseInt(el.textContent.split(':')[1].trim());
    const maxValue = 100;
    const width = (statValue / maxValue) * 100;

    // Ajouter la barre de progression pour les statistiques
    el.style.position = 'relative';
    el.style.paddingBottom = '10px';
    el.insertAdjacentHTML('beforeend', 
      `<div style="position: absolute; bottom: 0; left: 0; width: ${width}%; height: 4px; background: linear-gradient(90deg, #4cc9f0, #f72585); border-radius: 4px;"></div>`
    );
  });

  animateHPBars(healthElements);
});

let combatData = null;
let turnCounter = 1;

// Initialiser le combat
async function initCombat() {
  const response = await fetch('/api/combat/init', { method: 'POST' });
  combatData = await response.json();
  updateHeroUI('heroLeft', combatData.hero1);
  updateHeroUI('heroRight', combatData.hero2);
  updateTurnIndicator();
  updateButtonsForPhase();
}

// Met à jour l'interface utilisateur pour un héros
function updateHeroUI(heroId, heroData) {
  const heroElement = document.getElementById(heroId);
  heroElement.querySelector('.heroName').textContent = `${heroData.name} - HP: ${heroData.hp}`;
  heroElement.querySelector('.heroImg').src = heroData.image || 'default-image.jpg';
  const stats = heroElement.querySelectorAll('.heroStats p');
  stats[0].textContent = `Intelligence: ${heroData.powerstats.intelligence}`;
  stats[1].textContent = `Force: ${heroData.powerstats.strength}`;
  stats[2].textContent = `Vitesse: ${heroData.powerstats.speed}`;
  stats[3].textContent = `Durabilité: ${heroData.powerstats.durability}`;
  stats[4].textContent = `Puissance: ${heroData.powerstats.power}`;
  stats[5].textContent = `Combat: ${heroData.powerstats.combat}`;

  // Animer les barres de progression
  animateStatBars(stats, heroData.powerstats);
  animateHPBars([heroElement.querySelector('.heroName')]);
}

// Fonction pour animer les barres de statistiques
function animateStatBars(statElements, stats) {
  statElements.forEach((el, index) => {
    let statValue = 0;

    switch (index) {
      case 0: statValue = stats.intelligence || 0; break;
      case 1: statValue = stats.strength || 0; break;
      case 2: statValue = stats.speed || 0; break;
      case 3: statValue = stats.durability || 0; break;
      case 4: statValue = stats.power || 0; break;
      case 5: statValue = stats.combat || 0; break;
    }

    const maxValue = 100;
    const width = (statValue / maxValue) * 100;

    // Supprimer l'ancienne barre si elle existe
    const oldBar = el.querySelector('div');
    if (oldBar) oldBar.remove();

    // Ajouter la nouvelle barre
    el.style.position = 'relative';
    el.style.paddingBottom = '10px';
    el.insertAdjacentHTML(
      'beforeend',
      `<div style="position: absolute; bottom: 0; left: 0; width: ${width}%; height: 4px; background: linear-gradient(90deg, #4cc9f0, #f72585); border-radius: 4px;"></div>`
    );
  });
}

// Fonction pour animer les barres de HP
function animateHPBars(heroNameElements) {
  heroNameElements.forEach(healthEl => {
    const hpText = healthEl.textContent.match(/HP:\s*(\d+)/);
    if (hpText) {
      const hpValue = parseInt(hpText[1]);
      const maxHP = 1000;
      const hpWidth = (hpValue / maxHP) * 100;

      // Supprimer l'ancienne barre si elle existe
      const oldBar = healthEl.querySelector('div');
      if (oldBar) oldBar.remove();

      // Ajouter la nouvelle barre
      healthEl.style.position = 'relative';
      healthEl.style.paddingBottom = '10px';
      healthEl.insertAdjacentHTML(
        'beforeend',
        `<div style="position: absolute; bottom: 0; left: 0; width: ${hpWidth}%; height: 4px; background: linear-gradient(90deg, #4cc9f0, #f8961e); border-radius: 4px;"></div>`
      );
    }
  });
}

// Met à jour les boutons en fonction de la phase actuelle
function updateButtonsForPhase() {
  const buttons = document.querySelectorAll('#moveButtons button');
  const isAttackPhase = combatData.currentPhase === 'attack';
  const currentHero = combatData.currentTurn === 'hero1' ? combatData.hero1 : combatData.hero2;

  // Mettre à jour le texte des boutons
  buttons.forEach((button, index) => {
    button.textContent = isAttackPhase
      ? currentHero.attacks[index]?.name || 'Attaque indisponible'
      : currentHero.defenses[index]?.name || 'Défense indisponible';
    button.style.backgroundColor = isAttackPhase ? '#f72585' : '#4cc9f0';
    button.style.color = '#fff';
  });

  // Mettre à jour le titre "Attaques" ou "Défenses"
  const movesCardTitle = document.querySelector('#movesCard h1');
  movesCardTitle.textContent = isAttackPhase ? 'Attaques' : 'Défenses';
}

// Met à jour l'indicateur de tour
function updateTurnIndicator() {
  const turnIndicator = document.getElementById('turnIndicator');
  turnIndicator.textContent = `C'est au tour de ${combatData.currentTurn === 'hero1' ? 'Joueur 1' : 'Joueur 2'}`;
}

// Gère un tour de combat
async function playTurn(attackIndex, defenseIndex = null) {
  // Si c'est la phase d'attaque, afficher l'attaque choisie immédiatement
  if (combatData.currentPhase === 'attack' && attackIndex !== null) {
    const attackerName = combatData[combatData.currentTurn].name;
    const attackUsed = combatData[combatData.currentTurn].attacks[attackIndex].name;
    updateActionDisplay(`${attackerName} a choisi ${attackUsed}`);
  }

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

    // Afficher l'action complète après la défense
    updateActionDisplay(
      `${attackerName} a utilisé ${attackUsed} contre ${defenderName} (${defenseUsed}) et a infligé ${damage} dégâts. HP restants de ${defenderName} : ${defenderHp}`
    );

    addToHistory(turnCounter, attackerName, attackUsed, defenderName, defenseUsed, damage, defenderHp);
    turnCounter++;
  }

  if (data.winner) {
    updateActionDisplay(`${data.winner} a gagné le combat !`);
    addToHistory(turnCounter, data.winner, "Victoire", "", "", 0, 0);
    alert(`${data.winner} a gagné le combat !`);
  }
}

// Fonction pour ajouter un message à l'historique
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

// Gère les clics sur les boutons
document.querySelectorAll('#moveButtons button').forEach((button, index) => {
  button.addEventListener('click', () => {
    if (combatData.currentPhase === 'attack' && combatData.currentTurn === 'hero1') playTurn(index);
    else if (combatData.currentPhase === 'defense' && combatData.currentTurn === 'hero2') playTurn(null, index);
    else if (combatData.currentPhase === 'attack' && combatData.currentTurn === 'hero2') playTurn(index);
    else if (combatData.currentPhase === 'defense' && combatData.currentTurn === 'hero1') playTurn(null, index);
    else alert("Ce n'est pas votre tour !");
  });
});

// Initialise le combat au chargement de la page
document.addEventListener('DOMContentLoaded', initCombat);

// Met à jour l'affichage des actions
function updateActionDisplay(message) {
  const actionDisplay = document.getElementById('actionDisplay');
  actionDisplay.textContent = message;
}