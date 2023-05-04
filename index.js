const fs = require('fs');
const logFilePath = './log.txt';
const fileLogs = fs.readFileSync(logFilePath, 'utf-8').split('\n');

let tibiaLogReport = {
  "hitpointsHealed": 0,
  "damageTaken": {
    "total": 0,
    "byCreatureKind": {},
    "unknownOrigins": 0
  },
  "experienceGained": 0,
  "loot": {},
  "healthPointsBlackKnight": 0
  }

function healingPointsTotal(log) {
  const regex = /You healed yourself for (\d+) hitpoints/;
  const match = regex.exec(log);

  if (match !== null) {
    tibiaLogReport.hitpointsHealed += parseInt(match[1]);
  }
  return 0;
}

let damageTotals = 0;

function damageTotalsCalculation(log) {
  const regex = /You lose (\d+)/;
  const match = regex.exec(log);

  if (match !== null) {
    damageTotals = damageTotals +  parseInt(match[1]);
    tibiaLogReport.damageTaken.total =+ damageTotals;
  }
  return null;
}

let damageByCreature = {};

function damageTypeOfCreature(log) {
  const regex = /by a ([\w\s]+)/i;
  const match = log.match(regex);

  if (match) {
    const creature = match[1].trim().replace(/\.$/, '');
    const regex2 = /lose (\d+) hitpoints/i;
    const match2 = log.match(regex2);

    if (match2) {
      const damage = parseInt(match2[1], 10);
      if (damageByCreature[creature]) {
        damageByCreature[creature] += damage;
      } else {
        damageByCreature[creature] = damage;
      }
    }
  }
  tibiaLogReport.damageTaken.byCreatureKind = damageByCreature;
}

function receivedExperience(log) {
  const regex = /You gained (\d+) experience points\./i;
  const match = log.match(regex);

  if (match) {
    tibiaLogReport.experienceGained += parseInt(match[1], 10)
  }
}

function lootCalculation(log) {
  const regex = /Loot of an? (\w+): (.+)/;
  const match = regex.exec(log);

  if (match) {
    const creature = match[1];
    const items = match[2].split(", ");

    tibiaLogReport.loot[creature] = tibiaLogReport.loot[creature] || { total: 0 };

    items.forEach((item) => {
      const parts = item.replace(".", "").split(" ");
      let quantity = 1;
      let name;

      if (/^\d+$/.test(parts[0])) {
        quantity = parseInt(parts[0]);
        name = parts.slice(1).join(" ");
      } else {
        name = parts.join(" ");
      }

      if (name !== "nothing" && name !== '') {
        name = name.replace(/a strong |a /gi, "");
        tibiaLogReport.loot[creature].total += quantity;
      }
    });
  }
}

function healthPointsBlackKnight(log) {
  const regex = /A Black Knight loses (\d+) hitpoints due to your attack./i;
  const match = log.match(regex);

  if (match) {
    tibiaLogReport.healthPointsBlackKnight += parseInt(match[1])
  }
}

function damageTakenUnknownOrigins(log){
  const regex = (/You lose (\d+) hitpoints\.\s*/i);
  const match = log.match(regex);

  if (match) {
    tibiaLogReport.damageTaken.unknownOrigins += parseInt(match[1])
  }
}

function createObject(log) {
    log.includes("You healed yourself for") && healingPointsTotal(log);
    log.includes("You lose") && damageTotalsCalculation(log);
    log.includes("You lose") && damageTypeOfCreature(log);
    log.includes("You lose") && damageTakenUnknownOrigins(log);
    log.includes("You gained") && receivedExperience(log);
    log.includes("Loot of") && lootCalculation(log);
    log.includes("Black Knight loses") && healthPointsBlackKnight(log);
}

function init() {
  fileLogs.forEach(log => {
    createObject(log);
  });
  console.log(tibiaLogReport)
}
init();