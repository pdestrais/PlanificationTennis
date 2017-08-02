var numWeeks = 26;
var players = [];
var weeks =[];
var i=0;
var j=0;
var sim3 = 0;
var playerCounter=[];
var table=[];
var temperature;
var maxPlayers=[];
var holidays = [];

function plan() {
	var objective=1000;
	var newObjective=1000;
	temperature=100;
	initializeTable();
	var iteration=-1;
	console.debug("ITERATION"+iteration+"[plan - after initialization]table is :"+JSON.stringify(table));
	// checkContraints();
	// console.debug("ITERATION"+iteration+"[plan - after check constraints]table is :"+JSON.stringify(table));
	objective=computeObjective(table);
	console.log("ITERATION"+iteration+"[plan]objective is : "+objective);
	console.log("ITERATION"+iteration+"[plan]playerCounter is : "+JSON.stringify(playerCounter));
	var playerToReplace = playerCounter.indexOf(getMaxOfArray(playerCounter));
	do {
		iteration++;
		console.log("ITERATION"+iteration+"[plan - before alter]table is :"+JSON.stringify(table));
		objective=computeObjective(table);
		console.log("ITERATION"+iteration+"[plan - before alter]playerCounter is : "+JSON.stringify(playerCounter));
		console.log("ITERATION"+iteration+"[plan - before alter]objective is : "+objective);
		newTable = alterTable(playerToReplace);
		console.log("ITERATION"+iteration+"[plan - after alter]new table is :"+JSON.stringify(newTable));
		checkContraints(newTable);
		console.log("ITERATION"+iteration+"[plan - after check constraints]table is :"+JSON.stringify(newTable));
		newObjective=computeObjective(newTable);
		console.log("ITERATION"+iteration+"[plan]new objective is : "+newObjective);
		console.log("ITERATION"+iteration+"[plan]playerCounter is : "+JSON.stringify(playerCounter));
		if (newObjective<=objective) {
			objective=newObjective;
			table=newTable;
			console.info("ITERATION"+iteration+"[plan]new table replaces previous one");
			console.info("ITERATION"+iteration+"[plan]objective becomes "+objective);
			// dumpTable();
		}
		playerToReplace = playerCounter.indexOf(getMaxOfArray(playerCounter));
		temperature=temperature*0.985;
	} while (objective>1 && iteration<300);
	console.info("RESULTAT\n");
	dumpTable();
	// Calculate Similarity score of proposed solution
	console.info("Similarity score : "+computeSimilarity());
	console.info("sim3+ occurences : "+sim3);
}

function initializePlayers () {
	players=[
		{nom:"Thomas Destrais",numero:0,lettre:'A',holidays:[12,13,14,15,16]},
		{nom:"Gérald Desutter",numero:1,lettre:'B',holidays:[11,12,13,21]},
		{nom:"Philippe Destrais",numero:2,lettre:'C',holidays:[7,8,9,23]},
		{nom:"Laurent Dauge",numero:3,lettre:'D',holidays:[0,1,3,7,9,11,12,16,18,20,22,24]},
		{nom:"OLivier Demanet",numero:4,lettre:'E',holidays:[]},
		{nom:"David Villani",numero:5,lettre:'F',holidays:[]},
		{nom:"Pierre Marlaire",numero:6,lettre:'G',holidays:[11,12,13,21]},
		{nom:"Thierry Dekoninck",numero:7,lettre:'H',holidays:[]},
		{nom:"Pierre Destrais",numero:8,lettre:'I',holidays:[]},
		{nom:"Pierre Halbrecq",numero:9,lettre:'J',holidays:[]},
		{nom:"Bernard Vael",numero:10,lettre:'K',holidays:[]},
		{nom:"Laurent Lefevre",numero:11,lettre:'L',holidays:[]},
		{nom:"Maxime Dekoninck",numero:12,lettre:'M',holidays:[12,13,14,15,16]}
	];
}

function mapNumberToLetter(pNum) {
		return players[pNum].lettre;
}

function dumpTable() {
	console.log("WEEK\tJOUEUR1\tJOUEUR2\tJOUEUR3\tJOUEUR4\n");
	for (i=0;i<weeks.length;i++) {
		console.info("WEEK"+i+"\t"+mapNumberToLetter(table[i][0])+"\t"+mapNumberToLetter(table[i][1])+"\t"+mapNumberToLetter(table[i][2])+"\t"+mapNumberToLetter(table[i][3])+"\n");
	}
}

function computeSimilarity() {
	var stotal = 0;
	sim3 = 0;
	for (var i=2;i<weeks.length;i++) {
//	for (var i=2;i<5;i++) {
		stotal = stotal + similarity(i);
	}	
	return stotal;
}

function similarity(i) {
	var sim = 0;
	for (var j=i-1;j>=0;j--) {
		sim = sim + simBetweenIteration(i,j);
	}
	return sim;
}

function simBetweenIteration(it1,it2) {
	var s = 0;
	var sweithed = 0;
	for (var i=0;i<table[it1].length;i++) {
		if (table[it2].includes(table[it1][i])) {
			s++;
			sweithed = sweithed + (1-(it1-it2)/weeks.length);
		}
	}
	if (s>2) {
		console.info("s = "+s+" between it "+it1+ " and "+it2+" | "+mapNumberToLetter(table[it1][0])+"-"+mapNumberToLetter(table[it1][1])+"-"+mapNumberToLetter(table[it1][2])+"-"+mapNumberToLetter(table[it1][3])+" AND "+mapNumberToLetter(table[it2][0])+"-"+mapNumberToLetter(table[it2][1])+"-"+mapNumberToLetter(table[it2][2])+"-"+mapNumberToLetter(table[it2][3]))
		console.info("sweighted = "+sweithed+" between it "+it1+ " and "+it2+" | "+mapNumberToLetter(table[it1][0])+"-"+mapNumberToLetter(table[it1][1])+"-"+mapNumberToLetter(table[it1][2])+"-"+mapNumberToLetter(table[it1][3])+" AND "+mapNumberToLetter(table[it2][0])+"-"+mapNumberToLetter(table[it2][1])+"-"+mapNumberToLetter(table[it2][2])+"-"+mapNumberToLetter(table[it2][3]))
		sim3 = sim3 + 1;
	}
	return sweithed;
}

function similarityCheck(table,i) {
	var sim = 0;
	for (var j=i-1;j>=0;j--) {
		sim = sim + simBetweenArray(table[i],table[j]);
	}
	return sim;
}

function simBetweenArray(arr1,arr2) {
	var s = 0;
	for (var i=0;i<arr1.length;i++) {
		if (arr2.includes(arr1[i]))
			s++;
	}
	return s;
}

function resetPlayerCounter() {
	for (i=0;i<players.length;i++){playerCounter[i]=0;}
}

function initializeTable() {
	// by contruction, contraint 1 (4 joueurs par semaine) is ok
	var infiniteLoopProtection=0;
	initializePlayers();
	for (i=0;i<players.length;i++){playerCounter[i]=0;}
	for (i=0;i<numWeeks;i++){weeks[i]=i;}
	table[-1]=[];
	for (i=0;i<weeks.length;i++) {
		var line=[];
		for (j=0;j<4;j++) {
			infiniteLoopProtection=0;
			do {
				playerNum=selectRandomPlayer();
				//playerNumHolidays = holidays[playerNum];
				playerNumHolidays = players[playerNum].holidays;
				if (playerNumHolidays===undefined) {playerNumHolidays=[];}
				if (line.indexOf(playerNum)==-1 && table[i-1].indexOf(playerNum)==-1 && playerNumHolidays.indexOf(i)==-1) {
					line[j]=playerNum;
					break;
				}
				infiniteLoopProtection++;
			} while (infiniteLoopProtection<1000);
			// si aucune solution n'est trouvée pour une semaine, on relaxe la contrainte interdisant de jouer 2 semaines de suite et on réessaye
			if (infiniteLoopProtection>=1000) {
				infiniteLoopProtection=0;
				do {
					playerNum=selectRandomPlayer();
					//playerNumHolidays = holidays[playerNum];
					playerNumHolidays = players[playerNum].holidays;
					if (playerNumHolidays===undefined) {playerNumHolidays=[];}
					if (line.indexOf(playerNum)==-1 && playerNumHolidays.indexOf(i)==-1) {
						line[j]=playerNum;
						break;
					}
					infiniteLoopProtection++;
				} while (infiniteLoopProtection<1000);
				// si toujours aucune solution n'est trouvée, on ne sait pas faire le tableau étant donné les contraintes données
				if (infiniteLoopProtection>=1000)
					console.log("problem ... in table initialization at week ",i);
			}
		}
		table[i]=line;
	}
}

function checkContraints(table) {
	// Vérifier contrainte 0 : pas deux fois le même joueur par semaine - OK par initialisation et contrôle lors du choix aléatoire

	// check contraint 3 : un joueur ne joue pas 2 semaines de suite
	var infiniteLoopProtection=0;
	for (i=1;i<weeks.length;i++) {
		for (j=0;j<4;j++) {
			infiniteLoopProtection=0;
			// si un des joueurs de cette semaine jouait déjà la semaine précédente, alors remplacer le joueur par un autre tiré au hazard.
			if (table[i-1].indexOf(table[i][j])!=-1) {
				do {
					// selectioner un jouer au hazard
					playerNum=selectRandomPlayer();
					// playerNumHolidays = holidays[playerNum];
					playerNumHolidays = players[playerNum].holidays;
					if (playerNumHolidays===undefined) {playerNumHolidays=[];}
					// retenir le joueur sélectionné par hazard si 1. il ne joue pas déjà la semaine courante, 2. ni la semaine d'avant, 3. et si il n'est pas en vacances 
					if (table[i].indexOf(playerNum)==-1 && table[i-1].indexOf(playerNum)==-1 && playerNumHolidays.indexOf(i)==-1) {
						table[i][j]=playerNum;
						break;
					}
					infiniteLoopProtection++;
				} while (infiniteLoopProtection<1000);
			}
		}
	}
}


function selectRandomPlayer() {
	return Math.floor(Math.random() * (players.length));
}

function selectRandomWeek() {
	return Math.floor(Math.random() * (numWeeks));
}

function computeObjective(table) {
	resetPlayerCounter();
	for (i=0;i<weeks.length;i++) {
		for (j=0;j<4;j++) {
			playerCounter[table[i][j]]=playerCounter[table[i][j]]+1;
		}
	}
	return (getMaxOfArray(playerCounter)-getMinOfArray(playerCounter));
}

function getWeeksMaxPlayers(table) {
	maxPlayers=[];
	var weeksMaxPlayers=[];
	var max = getMaxOfArray(playerCounter);
	for (i=0;i<playerCounter.length;i++) {
		if (playerCounter[i]==max) {
			maxPlayers.push(i);
		}
	}
	for (i=0;i<numWeeks;i++) {
		for (j=0;j<maxPlayers.length;j++) {
			if (table[i].indexOf(maxPlayers[j])!=-1) {
				weeksMaxPlayers.push(i);
			}
		}
	}
	return weeksMaxPlayers;
}

function alterTable(playerToReplace) {
	// en fonction de la température, sélectionner un nombre de semaines à changer (regénérer la semaine complète de manière aléatoire)
	var newTable = (JSON.parse(JSON.stringify(table)));
	// selectionner les semaines qui reprennent les joueurs qui jouent le plus
	var weeksMaxPlayers = getWeeksMaxPlayers(newTable);
	var numWeeksToModif = Math.floor(weeksMaxPlayers.length*temperature/100);
	if (numWeeksToModif==0) {numWeeksToModif=1;}
	console.debug("[alterTable]#weeks to modify = "+numWeeksToModif);
	console.debug("[alterTable]playerToReplace = "+playerToReplace);
	var weeksToModif = [];
	var infiniteLoopProtection=0;
	for (i=1;i<=numWeeksToModif;i++) {
		infiniteLoopProtection=0;
		do {
			numWeek = selectRandomWeek();
			if (weeksMaxPlayers.indexOf(numWeek)!=-1 && weeksToModif.indexOf(numWeek)==-1) {
				weeksToModif.push(numWeek);
				break;
			}
			infiniteLoopProtection++;
		} while (infiniteLoopProtection<1000);
	}
	console.log("[alterTable]weeksToModif = "+JSON.stringify(weeksToModif));
	for (i=0;i<weeksToModif.length;i++) {
		indexPlayerToReplace = newTable[weeksToModif[i]].indexOf(playerToReplace);
		if (indexPlayerToReplace!=-1 && weeksToModif[i]>0) {
			infiniteLoopProtection=0;
			do {
				playerNum=selectRandomPlayer();
				// playerNumHolidays = holidays[playerNum];
				playerNumHolidays = players[playerNum].holidays;
				if (playerNumHolidays===undefined) {playerNumHolidays=[];}
				// retenir le joueur sélectionné par hazard si 
				// 		1. il ne joue pas déjà la semaine courante, 
				//		2. ni la semaine d'avant, 
				//		3. qu'il n'est pas dans la liste de joueurs jouant déjà le plus
				//		4. et il n'est pas en vacances 
				if (newTable[weeksToModif[i]].indexOf(playerNum)==-1 && 
						newTable[(weeksToModif[i]-1)].indexOf(playerNum)==-1 && 
						maxPlayers.indexOf(playerNum)==-1 && 
						playerNumHolidays.indexOf(weeksToModif[i])==-1) {
					console.debug("[alterTable]week : "+weeksToModif[i]+" - player "+newTable[weeksToModif[i]][indexPlayerToReplace]+" replaced by "+playerNum+ " - holiday for new player is :"+JSON.stringify(playerNumHolidays)+ "debug : "+newTable[(weeksToModif[i]-1)]);
					newTable[weeksToModif[i]][indexPlayerToReplace]=playerNum;
					// Si la similarité entre la semaine modifiée et une des semaines précédente est de 3, essayer de trouver un autre joueur
					//if (similarityCheck(newTable,weeksToModif[i]) > 2)
					//	continue;
					break;
				}
				infiniteLoopProtection++;
			} while (infiniteLoopProtection<1000);
		}
	}
	return newTable;
}

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function getMinOfArray(numArray) {
  return Math.min.apply(null, numArray);
}
