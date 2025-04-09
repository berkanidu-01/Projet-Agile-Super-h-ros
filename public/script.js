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

  healthElements.forEach(healthEl => {
    // Extract the HP value from the heroName text (e.g., "hero - HP: 1000")
    const hpText = healthEl.textContent.match(/HP:\s*(\d+)/);
    if (hpText) {
      const hpValue = parseInt(hpText[1]);
      const maxHP = 1000;
      const hpWidth = (hpValue / maxHP) * 100;

      // Ajouter la barre de progression pour les HP
      healthEl.style.position = 'relative';
      healthEl.style.paddingBottom = '10px';
      healthEl.insertAdjacentHTML('beforeend', 
        `<div style="position: absolute; bottom: 0; left: 0; width: ${hpWidth}%; height: 4px; background: linear-gradient(90deg, #4cc9f0, #f8961e); border-radius: 4px;"></div>`
      );
    }
  });
});

let combatData = null;

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
}

// Met à jour les boutons en fonction de la phase actuelle
function updateButtonsForPhase() {
  const buttons = document.querySelectorAll('#moveButtons button');
  const isAttackPhase = combatData.currentPhase === 'attack';
  const currentHero = combatData.currentTurn === 'hero1' ? combatData.hero1 : combatData.hero2;

  buttons.forEach((button, index) => {
    button.textContent = isAttackPhase
      ? currentHero.attacks[index]?.name || 'Attaque indisponible'
      : currentHero.defenses[index]?.name || 'Défense indisponible';
    button.style.backgroundColor = isAttackPhase ? '#f72585' : '#4cc9f0';
    button.style.color = '#fff';
  });
}

// Met à jour l'indicateur de tour
function updateTurnIndicator() {
  const turnIndicator = document.getElementById('turnIndicator');
  turnIndicator.textContent = `C'est au tour de ${combatData.currentTurn === 'hero1' ? 'Joueur 1' : 'Joueur 2'}`;
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

  if (data.message) alert(data.message);
  if (data.winner) alert(`${data.winner} a gagné le combat !`);
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