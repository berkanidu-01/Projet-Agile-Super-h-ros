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