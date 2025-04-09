// Fonction pour créer une animation d'attaque
function createAttackAnimation(attacker, defender) {
    // Créer l'élément épée
    const sword = document.createElement('div');
    sword.className = 'sword';
    document.body.appendChild(sword);
    
    // Position initiale de l'épée près de l'attaquant
    const attackerRect = attacker.getBoundingClientRect();
    const defenderRect = defender.getBoundingClientRect();
    
    // Positionner l'épée près de l'attaquant
    sword.style.left = (attackerRect.right - 50) + 'px';
    sword.style.top = (attackerRect.top + attackerRect.height/2) + 'px';
    
    // Créer l'élément bouclier pour le défenseur
    const shield = document.createElement('div');
    shield.className = 'shield';
    defender.appendChild(shield);
    
    // Animation de l'épée
    setTimeout(() => {
      // Ajouter la classe d'animation au lancer
      sword.classList.add('sword-throw');
      
      // Calculer la position finale de l'épée
      const endX = defenderRect.left - attackerRect.right + 50;
      const endY = defenderRect.top - attackerRect.top;
      
      // Appliquer l'animation avec les coordonnées calculées
      sword.style.transform = `translate(${endX}px, ${endY}px) rotate(360deg)`;
      
      // Montrer le bouclier du défenseur
      setTimeout(() => {
        shield.classList.add('shield-block');
        
        // Effet d'impact
        setTimeout(() => {
          const impact = document.createElement('div');
          impact.className = 'impact';
          impact.style.left = (defenderRect.left) + 'px';
          impact.style.top = (defenderRect.top + defenderRect.height/2) + 'px';
          document.body.appendChild(impact);
          
          // Faire disparaître l'effet d'impact après l'animation
          setTimeout(() => {
            impact.remove();
            sword.remove();
            shield.classList.remove('shield-block');
          }, 500);
        }, 400);
      }, 300);
    }, 100);
  }
  
  // Fonctions pour initier l'attaque depuis chaque côté
  function leftAttacksRight() {
    const leftHero = document.getElementById('heroLeft');
    const rightHero = document.getElementById('heroRight');
    createAttackAnimation(leftHero, rightHero);
    
    // Réduire les HP du héros de droite
    updateHP(rightHero, -100);
  }
  
  function rightAttacksLeft() {
    const leftHero = document.getElementById('heroLeft');
    const rightHero = document.getElementById('heroRight');
    createAttackAnimation(rightHero, leftHero);
    
    // Réduire les HP du héros de gauche
    updateHP(leftHero, -100);
  }
  
  // Fonction pour mettre à jour les points de vie (HP)
  function updateHP(heroElement, changeAmount) {
    const heroNameElement = heroElement.querySelector('.heroName');
    const hpText = heroNameElement.textContent;
    const hpMatch = hpText.match(/HP:\s*(\d+)/);
    
    if (hpMatch) {
      let currentHP = parseInt(hpMatch[1]);
      currentHP = Math.max(0, currentHP + changeAmount); // Empêcher HP négatif
      
      // Mettre à jour le texte HP
      heroNameElement.textContent = hpText.replace(/HP:\s*\d+/, `HP: ${currentHP}`);
      
      // Mettre à jour la barre de progression HP
      const maxHP = 1000;
      const hpWidth = (currentHP / maxHP) * 100;
      
      // Trouver la barre de progression existante ou en créer une nouvelle
      let progressBar = heroNameElement.querySelector('div');
      if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.style.position = 'absolute';
        progressBar.style.bottom = '0';
        progressBar.style.left = '0';
        progressBar.style.height = '4px';
        progressBar.style.background = 'linear-gradient(90deg, #4cc9f0, #f8961e)';
        progressBar.style.borderRadius = '4px';
        heroNameElement.style.position = 'relative';
        heroNameElement.style.paddingBottom = '10px';
        heroNameElement.appendChild(progressBar);
      }
      
      // Animation de la barre HP
      progressBar.style.transition = 'width 0.5s ease';
      progressBar.style.width = `${hpWidth}%`;
      
      // Effet visuel de dégâts
      heroElement.classList.add('damage');
      setTimeout(() => {
        heroElement.classList.remove('damage');
      }, 500);
    }
  }
  
  // Création des boutons d'attaque
  document.addEventListener('DOMContentLoaded', function() {
    // Création de la zone de contrôles
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'controls';
    controlsDiv.innerHTML = `
      <div class="card" id="moveCard">
        <h2>Actions</h2>
        <div class="buttons">
          <button id="leftAttack" class="attack-btn">← Attaquer</button>
          <button id="rightAttack" class="attack-btn">Attaquer →</button>
        </div>
      </div>
    `;
    
    // Ajouter après le conteneur des héros
    const heroContainer = document.getElementById('heroContainer');
    heroContainer.after(controlsDiv);
    
    // Ajouter les event listeners
    document.getElementById('leftAttack').addEventListener('click', leftAttacksRight);
    document.getElementById('rightAttack').addEventListener('click', rightAttacksLeft);
  });