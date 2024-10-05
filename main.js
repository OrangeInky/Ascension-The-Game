let stats = {
    power: 0,
    knowledge: 0,
    endurance: 0
};

const ASCENSION_THRESHOLD = 100;
let ascensionCount = {
    power: 0,
    knowledge: 0,
    endurance: 0
};

let statThresholds = {
    power: ASCENSION_THRESHOLD,
    knowledge: ASCENSION_THRESHOLD,
    endurance: ASCENSION_THRESHOLD
};

let player = {
    health: 100,
    maxHealth: 100
};

let currentBossLevel = 1;
let maxBossLevel = 1;

let boss = {
    health: 200,
    maxHealth: 200,
    level: 1
};
//Make an object to store types of multipliers, e.g. "On stat gain" or "On damage"... Easier to refractor
let permanentMultiplier = 1;
let bossDefeats = {};

let trainingTimers = {
    power: null,
    knowledge: null,
    endurance: null
};

let attackTimer = null;
let particleEffectsEnabled = true;


// Rebirth Stuff
const rebirth = {
	promptBool: false,
	canRebirth() {
		if (boss.level >= 10) {
			return true;
		} else {return false;}
	},
	peakAscensionCount: {
		power: 0,
		knowledge: 0,
		endurance: 0
	},
	multipliers: {
		power: 1,
		knowledge: 1,
		endurance: 1	
	},
	rebirthReset() {
		stats['power'] = 0;
		stats['knowledge'] = 0;
		stats['endurance'] = 0;
		ascensionCount['power'] = 0;
		ascensionCount['knowledge'] = 0;
		ascensionCount['endurance'] = 0;
		permanentMultiplier = 1;
		bossDefeats = {};
		boss['health'] = 200;
		boss['maxHealth'] = 200;
		boss['level'] = 1;
		updateBossHealth();
		updateBossButtons();
		updateBossTitle();
		updatePlayerMaxHealth();
	},
	gainPeak(stat) {
		if (ascensionCount[stat] > rebirth['peakAscensionCount'][stat]) {
			rebirth['peakAscensionCount'][stat] = ascensionCount[stat];
		}
	},
	gainMult() {
		rebirth['multipliers']['power'] = 1+rebirth['peakAscensionCount']['power']*0.1;
		rebirth['multipliers']['knowledge'] = 1+rebirth['peakAscensionCount']['knowledge']*0.1;
		rebirth['multipliers']['endurance'] = 1+rebirth['peakAscensionCount']['endurance']*0.1;
	},
	doRebirth() {
		let cont = true;
		if (rebirth['canRebirth']()) {
			if (rebirth['promptBool']) {
				cont = confirm("Are you sure you want to rebirth?")
			}
			if (cont) {
				rebirth['gainPeak']('power');
				rebirth['gainPeak']('knowledge');
				rebirth['gainPeak']('endurance');
				rebirth['gainMult']();
				rebirth['rebirthReset']();	
			}
		} else {alert("You cannot rebirth right now!")}
	},
	reveal() {
		if (maxBossLevel>=10) {
			document.getElementById('rebirth-button').style.display = 'block';
		}
	},
	openRebirthOverlay() {
		document.getElementById('rebirth-overlay').style.display = 'block';
	},
	closeRebirthOverlay() {
		document.getElementById('rebirth-overlay').style.display = 'none';
	}
}


function startTraining(stat) {
    if (trainingTimers[stat]) return; // Training already in progress
    
    const btn = document.getElementById(`${stat}-btn`);
    btn.disabled = true;
    
    let progress = 0;
    const taskbar = document.getElementById(`${stat}-taskbar`);
    
    trainingTimers[stat] = setInterval(() => {
        progress += 2;
        taskbar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(trainingTimers[stat]);
            trainingTimers[stat] = null;
            taskbar.style.width = '0%';
            btn.disabled = false;
            progress = 0;
            completeTraining(stat);
        }
    }, 100); // Update every 100ms for smooth animation
}

function completeTraining(stat) {
    const baseIncrease = Math.floor(Math.random() * 6) + 5;
    const knowledgeBonus = 1 + (ascensionCount.knowledge * 0.1);
    const increase = Math.floor(baseIncrease * knowledgeBonus * permanentMultiplier * rebirth['multipliers'][stat]);
    
    stats[stat] += increase;
    document.getElementById(stat).textContent = stats[stat];
    
    const progressPercent = (stats[stat] / statThresholds[stat]) * 100;
    document.getElementById(`${stat}-progress`).style.width = `${progressPercent}%`;
    
    if (stats[stat] >= statThresholds[stat]) {
        levelUp(stat);
    }
}

function levelUp(stat) {
    const overflow = stats[stat] - Math.floor(statThresholds[stat]);
    stats[stat] = overflow;
    ascensionCount[stat]++;
    statThresholds[stat] *= 1.01005017;
    document.getElementById(`${stat}-level`).textContent = ascensionCount[stat];
    document.getElementById(stat).textContent = stats[stat];
    const progressPercent = (stats[stat] / statThresholds[stat]) * 100;
    document.getElementById(`${stat}-progress`).style.width = `${progressPercent}%`;
    ascend(stat);
    console.log(overflow)
    if (stats[stat] >= statThresholds[stat]) {
		setTimeout(() => {
			levelUp(stat);
		},33)
    }
}

function ascend(stat) {
    document.getElementById(stat).textContent = stats[stat];
    
    const ascensionMessage = document.getElementById('ascension-message');
    ascensionMessage.textContent = `Ascension: Your ${stat} transcends to a higher plane! (Level ${ascensionCount[stat]})`;
    ascensionMessage.style.opacity = 1;
	
	setTimeout(() => {
		ascensionMessage.style.opacity = 0;
	},3000)

    createAscensionParticle(stat);

    const ascensionParticle = document.createElement('div');
    ascensionParticle.className = 'ascension-particle';
    ascensionParticle.textContent = `${stat.charAt(0).toUpperCase() + stat.slice(1)} Ascended!`;
    document.body.appendChild(ascensionParticle);

    setTimeout(() => {
        ascensionParticle.style.opacity = 0;
        document.body.removeChild(ascensionParticle);
    }, 2000);

    gsap.to(`.stat`, {
        scale: 1.1,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
    });
    
    if (stat === 'endurance') {
        updatePlayerMaxHealth();
    }
}

function createAscensionParticle(stat) {
    if (!particleEffectsEnabled) return;
    
    const particle = document.createElement('div');
    particle.className = 'ascension-particle';
    particle.textContent = `${stat.charAt(0).toUpperCase() + stat.slice(1)} Ascended!`;
    
    const x = Math.random() * (window.innerWidth+1) - window.innerWidth/2;
    const y = Math.random() * (window.innerHeight+1) - window.innerHeight/2;
    
    gsap.set(particle, { x, y, opacity: 0, scale: 0 });
    document.body.appendChild(particle);
    
    gsap.to(particle, {
        duration: 0.5,
        opacity: 1,
        scale: 1,
        ease: "back.out(1.7)",
        onComplete: () => {
            gsap.to(particle, {
                duration: 0.5,
                opacity: 0,
                scale: 0,
                ease: "power2.in",
                onComplete: () => {
                    document.body.removeChild(particle);
                }
            });
        }
    });
}

function updatePlayerMaxHealth() {
    player.maxHealth = 100 + (ascensionCount.endurance * 50); // 50 health per endurance ascension
    player.health = player.maxHealth; // Fully heal on ascension
    updatePlayerHealth();
}

function startAttackBoss() {
    if (attackTimer) return; // Attack already in progress
    
    const btn = document.getElementById('attack-btn');
    btn.disabled = true;
    
    let progress = 0;
    const taskbar = document.getElementById('attack-taskbar');
    
    attackTimer = setInterval(() => {
        progress += 4;
        taskbar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(attackTimer);
            attackTimer = null;
            taskbar.style.width = '0%';
            btn.disabled = false;
            progress = 0;
            attackBoss();
        }
    }, 100); // Update every 50ms for smoother animation
}

function attackBoss() {
    const baseDamage = 10+ascensionCount.power;
    const powerBonus = 1 + (ascensionCount.power * 0.2); // 20% increase per power ascension
    const damage = Math.floor(baseDamage * powerBonus);
    
    boss.health = Math.max(0, boss.health - damage);
    updateBossHealth();
    
    if (boss.health == 0) {
        defeatBoss();
    } else {
        bossAttack();
    }
}

function bossAttack() {
    const bossDamage = Math.floor(boss.maxHealth * 0.05); // 10% of boss max health
    const damageReduction = 1 / (1+ascensionCount.endurance/10);
    const finalDamage = Math.floor(bossDamage * damageReduction);
    
    player.health = Math.max(0, player.health - finalDamage);
    updatePlayerHealth();
    
    if (player.health == 0) {
        playerDeath();
    }
}

function playerDeath() {
    const ascensionMessage = document.getElementById('ascension-message');
    ascensionMessage.textContent = `You have been defeated! The boss recovers some health.`;
    ascensionMessage.style.opacity = 1;
    
    setTimeout(() => {
        ascensionMessage.style.opacity = 0;
    }, 3000);
    
    boss.health = Math.min(boss.maxHealth, boss.health + Math.floor(boss.maxHealth * 0.1));
    updateBossHealth();
    
    player.health = player.maxHealth;
    updatePlayerHealth();
}

function defeatBoss() {
    const ascensionMessage = document.getElementById('ascension-message');
    ascensionMessage.textContent = `Boss defeated! You gain a boost to all stats!`;
    ascensionMessage.style.opacity = 1;
    
    setTimeout(() => {
        ascensionMessage.style.opacity = 0;
    }, 3000);

    if (!bossDefeats[boss.level]) {
        bossDefeats[boss.level] = true;
        permanentMultiplier += Math.log(boss.maxHealth)/100;
        
        let trainingCount = 0;
        const trainAllStats = setInterval(() => {
            ['power', 'knowledge', 'endurance'].forEach(stat => completeTraining(stat));
            trainingCount++;
            if (trainingCount >= 10) {
                clearInterval(trainAllStats);
            }
        }, 300);
    } else {
        permanentMultiplier += Math.log(boss.maxHealth)/2000;
    }

    maxBossLevel = Math.max(maxBossLevel, currentBossLevel + 1);
	rebirth['reveal']();
    currentBossLevel++;
    generateBoss(currentBossLevel);
    updateBossHealth();
    updateBossButtons();
	updateBossTitle();
}

function generateBoss(level) {
    boss.level = level;
    boss.maxHealth = Math.floor(200 * Math.pow(1.5, level - 1));
    boss.health = boss.maxHealth;
}

function switchBoss(direction) {
    if (direction > 0 && currentBossLevel >= maxBossLevel) return;
    if (direction < 0 && currentBossLevel === 1) return;

    currentBossLevel += direction;
    generateBoss(currentBossLevel);
    updateBossHealth();
    updateBossButtons();
	updateBossTitle();
}

function updateBossButtons() {
    document.getElementById('prev-boss-btn').disabled = (currentBossLevel === 1);
    document.getElementById('next-boss-btn').disabled = (currentBossLevel >= maxBossLevel);
}

function updateBossHealth() {
    const healthPercent = (boss.health / boss.maxHealth) * 100;
    document.getElementById('boss-health').style.width = `${healthPercent}%`;
    document.getElementById('boss-health-value').textContent = boss.health;
    document.getElementById('boss-max-health').textContent = boss.maxHealth;
}

function updateBossTitle() {
	document.getElementById('boss-title').textContent = `Boss # ${boss.level}`
}

function updatePlayerHealth() {
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById('player-health').style.width = `${healthPercent}%`;
    document.getElementById('player-health-value').textContent = player.health;
    document.getElementById('player-max-health').textContent = player.maxHealth;
}

function toggleParticleEffects() {
    particleEffectsEnabled = !particleEffectsEnabled;
    const toggleButton = document.getElementById('particle-toggle');
    toggleButton.classList.toggle('off', !particleEffectsEnabled);
}

function showDetailedStats() {
    const detailedStats = document.getElementById('detailed-stats');
	const avgRebirthMult = (rebirth['multipliers']['power']+rebirth['multipliers']['endurance']+rebirth['multipliers']['knowledge'])/3
    const knowledgeMultiplier = 1 + (ascensionCount.knowledge * 0.1);
    const totalMultiplier = knowledgeMultiplier * permanentMultiplier * avgRebirthMult;
    
    let statsHtml = `
        <p>Knowledge Multiplier: ${knowledgeMultiplier.toFixed(2)}x</p>
        <p>Boss Defeat Multiplier: ${permanentMultiplier.toFixed(2)}x</p>
		<p>Average Rebirth Multiplier: ${avgRebirthMult.toFixed(2)}x</p>
        <p>Total Training Multiplier: ${totalMultiplier.toFixed(2)}x</p>
        <p>Current Boss Level: ${currentBossLevel}</p>
        <p>Max Boss Level Reached: ${maxBossLevel}</p>`;
    detailedStats.innerHTML = statsHtml;
    document.getElementById('stats-overlay').style.display = 'block';
	}

function closeStatsOverlay() {
    document.getElementById('stats-overlay').style.display = 'none';
}

// Initialize health displays and boss buttons
updateBossHealth();
updatePlayerHealth();
updateBossButtons();
