// Keep random hero selection if needed for other parts, otherwise remove
// randomHero1 = Math.floor(Math.random() * 9);
// randomHero2 = Math.floor(Math.random() * 9);

// --- Configuration ---
const MAX_HP = 1000; // Define Max HP for percentage calculation
const MAX_STAT = 100; // Max value for stats

// --- Global State ---
let combatData = null;
let previousHp = { hero1: MAX_HP, hero2: MAX_HP }; // Store previous HP for damage animation

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

    } catch (error) {
        console.error("Failed to initialize combat:", error);
        turnIndicatorEl.textContent = "Erreur de chargement...";
        // Handle error display more gracefully if needed
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
    imgEl.src = heroData.image || 'hero.jpg'; // Use default if no image
    imgEl.alt = `${heroData.name} Sprite`;

    // Update HP Bar
    const hpPercentage = (currentHp / MAX_HP) * 100;
    hpFillEl.style.width = `${hpPercentage}%`;
    if (hpTextEl) { // Update optional HP text
       hpTextEl.textContent = `${isLeft ? 'P1' : 'P2'} HP: ${currentHp}`;
    }


    // Trigger Damage Animation if HP decreased
    if (currentHp < previousHeroHp) {
        hpContainerEl.classList.add('damage');
        // Remove the class after the animation finishes (duration: 0.15s * 3 iterations = 0.45s)
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
    // Prevent double clicks or actions while processing
    setButtonsDisabled(true);

    try {
        const response = await fetch('/api/combat/turn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ combatData, attackIndex, defenseIndex }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        combatData = data.combatData; // Update global combat state

        // Update UI based on new combat state
        // Important: Update UI *after* combatData is updated but *before* checking winner/messages
        updateHeroUI('heroLeft', combatData.hero1);
        updateHeroUI('heroRight', combatData.hero2);
        updateTurnIndicator();
        updateButtonsForPhase(); // This re-enables buttons based on the new phase/turn

        // Display messages or winner alerts (consider using a less intrusive UI element than alert)
        if (data.message) {
            console.log("Combat Message:", data.message);
            // Maybe display message in a dedicated log area instead of alert
             // alert(data.message);
        }
        if (data.winner) {
             turnIndicatorEl.textContent = `${data.winner} a gagné le combat !`;
             turnIndicatorEl.style.color = '#00ff00'; // Green for win
             setButtonsDisabled(true); // Disable buttons on win
             // alert(`${data.winner} a gagné le combat !`);
        }

    } catch (error) {
        console.error("Error during turn:", error);
        alert("Erreur pendant le tour. Vérifiez la console.");
        setButtonsDisabled(false); // Re-enable buttons on error
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


// --- Initialisation ---
document.addEventListener('DOMContentLoaded', initCombat);

// Remove the old DOMContentLoaded listener that added bars directly to p tags
// The new updateHeroUI handles stats rendering correctly.