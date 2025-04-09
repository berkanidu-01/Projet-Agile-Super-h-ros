randomHero1 = Math.floor(Math.random() * 9);
randomHero2 = Math.floor(Math.random() * 9);

// Script pour animer les barres de progression
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM chargé, initialisation de l'application...");
  
  // Fonction pour récupérer un héros par son ID
  async function fetchHeroById(id) {
    console.log(`Tentative de récupération du héros ID: ${id}...`);
    try {
      const response = await fetch(`http://localhost:3000/api/superheroes/${id}`);
      console.log(`Réponse de l'API pour le héros ${id}:`, response);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du héros (${response.status})`);
      }
      
      const hero = await response.json();
      console.log(`Héros récupéré:`, hero);
      return hero;
    } catch (error) {
      console.error(`Erreur fetchHeroById:`, error);
      return null;
    }
  }

  // Fonction pour récupérer les statistiques d'un héros par son ID
  async function fetchHeroStats(heroId) {
    console.log(`Tentative de récupération des stats pour le héros ID: ${heroId}...`);
    try {
      const response = await fetch(`http://localhost:3000/api/superheroes/${heroId}/powerstats`);
      console.log(`Réponse de l'API powerstats pour le héros ${heroId}:`, response);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des statistiques (${response.status})`);
      }
      
      const stats = await response.json();
      console.log(`Stats récupérées pour le héros ${heroId}:`, stats);
      return stats;
    } catch (error) {
      console.error(`Erreur fetchHeroStats pour ${heroId}:`, error);
      return null;
    }
  }

  // Fonction pour mettre à jour l'affichage d'un héros
  async function updateHeroDisplay(hero, stats, containerId) {
    console.log(`Mise à jour de l'affichage pour le héros:`, hero, `dans ${containerId}`);
    const container = document.getElementById(containerId);
    if (!hero || !container) {
      console.error("Héros ou conteneur non trouvé", { hero, containerId });
      return;
    }

    // Mettre à jour l'affichage
    const username = container.querySelector('.username');
    const heroName = container.querySelector('.heroName');
    
    if (username) username.textContent = `Joueur ${containerId === 'heroLeft' ? '1' : '2'}`;
    if (heroName) heroName.textContent = `${hero.name} - HP: 1000`;

    // Mettre à jour les stats
    const statElements = container.querySelectorAll('.heroStats p');
    
    if (statElements.length >= 6) {
      statElements[0].innerHTML = `<strong>Intelligence:</strong> ${stats.intelligence}`;
      statElements[1].innerHTML = `<strong>Force:</strong> ${stats.strength}`;
      statElements[2].innerHTML = `<strong>Vitesse:</strong> ${stats.speed}`;
      statElements[3].innerHTML = `<strong>Durabilité:</strong> ${stats.durability}`;
      statElements[4].innerHTML = `<strong>Puissance:</strong> ${stats.power}`;
      statElements[5].innerHTML = `<strong>Combat:</strong> ${stats.combat}`;
      
      // Ajouter les barres de progression pour chaque stat
      statElements.forEach((el, index) => {
        let statValue = 0;
        
        switch(index) {
          case 0: statValue = stats.intelligence || 0; break;
          case 1: statValue = stats.strength || 0; break;
          case 2: statValue = stats.speed || 0; break;
          case 3: statValue = stats.durability || 0; break;
          case 4: statValue = stats.power || 0; break;
          case 5: statValue = stats.combat || 0; break;
        }
        
        // Configurer la barre de progression
        const maxValue = 100;
        const width = (statValue / maxValue) * 100;
        
        // Supprimer l'ancienne barre si elle existe
        const oldBar = el.querySelector('div');
        if (oldBar) oldBar.remove();
        
        // Ajouter la nouvelle barre
        el.style.position = 'relative';
        el.style.paddingBottom = '10px';
        el.insertAdjacentHTML('beforeend', 
          `<div style="position: absolute; bottom: 0; left: 0; width: ${width}%; height: 4px; background: linear-gradient(90deg, #4cc9f0, #f72585); border-radius: 4px;"></div>`
        );
      });
    }

    // Ajouter barre de progression pour les HP
    if (heroName) {
      // Supprimer l'ancienne barre si elle existe
      const oldBar = heroName.querySelector('div');
      if (oldBar) oldBar.remove();
      
      heroName.style.position = 'relative';
      heroName.style.paddingBottom = '10px';
      
      // Ajouter la nouvelle barre
      heroName.insertAdjacentHTML('beforeend', 
        `<div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #4cc9f0, #f8961e); border-radius: 4px;"></div>`
      );
    }
  }

  // Fonction principale pour initialiser l'interface avec le héros ID=1
  async function initWithHeroId1() {
    console.log("Initialisation avec le héros ID=1...");
    try {
      // Récupérer le héros avec ID=1
      const hero = await fetchHeroById(1);
      if (!hero) {
        throw new Error("Impossible de récupérer le héros ID=1");
      }
      
      // Récupérer les stats du héros
      const stats = await fetchHeroStats(1);
      if (!stats) {
        throw new Error("Impossible de récupérer les stats pour le héros ID=1");
      }

      // Mettre à jour les deux cartes avec le même héros pour le test
      await updateHeroDisplay(hero, stats, 'heroLeft');
      await updateHeroDisplay(hero, stats, 'heroRight');
      
      console.log("Initialisation réussie pour le héros ID=1");
      
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
    }
  }

  // Ajouter un bouton pour recharger le héros
  /*const header = document.querySelector('.site-header');
  if (header) {
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Charger Héros ID=1';
    refreshButton.className = 'refresh-button';
    refreshButton.style.cssText = `
      background-color: #f72585;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
      font-weight: bold;
      transition: background-color 0.3s;
    `;
    refreshButton.addEventListener('click', initWithHeroId1);
    header.appendChild(refreshButton);
    console.log("Bouton 'Charger Héros ID=1' ajouté");
  }*/

  // Animation des barres de progression pour les stats existantes
  const statElements = document.querySelectorAll('.heroStats p');
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

  // Animation pour les barres de HP existantes
  const healthElements = document.querySelectorAll('.heroName');
  healthElements.forEach(healthEl => {
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

  // Initialiser avec le héros ID=1 au chargement de la page
  console.log("Démarrage de l'initialisation...");
  initWithHeroId1();
});