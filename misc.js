//SAVE&LOAD&RESET V.2
function saveGame () {
	let gameData = {
		save_stats: stats,
		save_ascensionCount: ascensionCount,
		save_player: player,
		save_boss: boss,
		save_currentBossLevel: currentBossLevel,
		save_maxBossLevel: maxBossLevel,
		save_permanentMultiplier: permanentMultiplier,
		save_bossDefeats: bossDefeats,
		save_particleEffectsEnabled: particleEffectsEnabled,
		save_rebirth_promptBool: rebirth['promptBool'],
		save_rebirth_peakAscensionCount: rebirth['peakAscensionCount'],
		save_rebirth_multipliers: rebirth['multipliers'],
	};
	gameData = JSON.stringify(gameData);
	localStorage.setItem('savedGame',gameData)
}

function loadGame () {
	let gameData = localStorage.getItem('savedGame')
	if (!gameData) {
		return;
	}
	gameData = JSON.parse(gameData);
	stats = gameData.save_stats;
	ascensionCount = gameData.save_ascensionCount;
	player = gameData.save_player;
	boss = gameData.save_boss;
	currentBossLevel = gameData.save_currentBossLevel;
	maxBossLevel = gameData.save_maxBossLevel;	
	permanentMultiplier = gameData.save_permanentMultiplier;		
	bossDefeats = gameData.save_bossDefeats;
	particleEffectsEnabled = gameData.save_particleEffectsEnabled;
	rebirth['promptBool'] = gameData.save_rebirth_promptBool;
	rebirth['peakAscensionCount'] = gameData.save_rebirth_peakAscensionCount;
	rebirth['multipliers'] = gameData.save_rebirth_multipliers;

	//backward compatibility
	if (typeof "undefined" === "undefined") {}
	updateBossHealth();
	updateBossButtons();
	updateBossTitle();
	updatePlayerHealth();
}

//GAMELOOP
function saveLoop(){
  saveGame();
  setTimeout(saveLoop,5000)
}
loadGame();
saveLoop();