const state = {
  inning: 1,
  top: true,
  outs: 0,
  balls: 0,
  strikes: 0,
  scores: { home: 0, away: 0 },
  bases: [false, false, false],
  pitcherEnergy: 100,
  defenseShift: "normal",
  teams: {
    away: { name: "Visitors", lineupSpot: 1 },
    home: { name: "Home", lineupSpot: 1 },
  },
};

const el = {
  awayScore: document.getElementById("awayScore"),
  homeScore: document.getElementById("homeScore"),
  inning: document.getElementById("inning"),
  outs: document.getElementById("outs"),
  balls: document.getElementById("balls"),
  strikes: document.getElementById("strikes"),
  pitcherEnergy: document.getElementById("pitcherEnergy"),
  log: document.getElementById("log"),
  base1: document.getElementById("base1"),
  base2: document.getElementById("base2"),
  base3: document.getElementById("base3"),
  canvas: document.getElementById("gameCanvas"),
};

const ctx = el.canvas.getContext("2d");
let lastPitch = "fastball";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function chance(prob) {
  return Math.random() < prob;
}

function currentBattingSide() {
  return state.top ? "away" : "home";
}

function currentFieldingSide() {
  return state.top ? "home" : "away";
}

function logPlay(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  el.log.prepend(li);
  while (el.log.children.length > 80) {
    el.log.removeChild(el.log.lastChild);
  }
}

function updateHUD() {
  el.awayScore.textContent = state.scores.away;
  el.homeScore.textContent = state.scores.home;
  el.inning.textContent = `${state.inning} ${state.top ? "▲" : "▼"}`;
  el.outs.textContent = state.outs;
  el.balls.textContent = state.balls;
  el.strikes.textContent = state.strikes;
  el.pitcherEnergy.textContent = `${Math.max(0, Math.round(state.pitcherEnergy))}%`;
  [el.base1, el.base2, el.base3].forEach((b, i) => {
    b.classList.toggle("occupied", state.bases[i]);
  });
}

function resetCount() {
  state.balls = 0;
  state.strikes = 0;
}

function scoreRuns(n) {
  const side = currentBattingSide();
  state.scores[side] += n;
  if (n > 0) logPlay(`${n} run${n > 1 ? "s" : ""} score${n > 1 ? "" : "s"}!`);
}

function advanceRunners(basesEarned, forceOnly = false) {
  let runs = 0;
  for (let i = 2; i >= 0; i--) {
    if (!state.bases[i]) continue;
    const target = i + basesEarned;
    const shouldMove = !forceOnly || i <= 1 || !state.bases[i + 1];
    if (!shouldMove) continue;
    state.bases[i] = false;
    if (target >= 3) runs++;
    else state.bases[target] = true;
  }
  if (basesEarned > 0) {
    if (basesEarned >= 4) runs++;
    else state.bases[basesEarned - 1] = true;
  }
  scoreRuns(runs);
}

function walkBatter(intentional = false) {
  logPlay(intentional ? "Intentional walk issued." : "Ball four, take your base.");
  if (state.bases[0] && state.bases[1] && state.bases[2]) {
    scoreRuns(1);
  }
  if (state.bases[1] && state.bases[0]) state.bases[2] = true;
  if (state.bases[0]) state.bases[1] = true;
  state.bases[0] = true;
  resetCount();
}

function registerOut(message) {
  state.outs++;
  logPlay(message);
  resetCount();
  if (state.outs >= 3) {
    sideChange();
  }
}

function sideChange() {
  state.outs = 0;
  state.balls = 0;
  state.strikes = 0;
  state.bases = [false, false, false];
  if (!state.top) state.inning++;
  state.top = !state.top;
  logPlay(`Side retired. ${state.top ? "Top" : "Bottom"} ${state.inning}.`);
}

function strike(callLooking = false) {
  state.strikes++;
  if (state.strikes >= 3) {
    registerOut(callLooking ? "Strike three looking!" : "Swing and a miss, strike three!");
  } else {
    logPlay(callLooking ? "Called strike." : "Strike.");
  }
}

function ball() {
  state.balls++;
  if (state.balls >= 4) {
    walkBatter();
  } else {
    logPlay("Ball.");
  }
}

function simulatePitch(pitchType, swingType) {
  if (!swingType) {
    logPlay("Choose a batting action after selecting a pitch.");
    return;
  }
  lastPitch = pitchType;
  const isStrikeZone = chance(0.56 + (pitchType === "fastball" ? 0.08 : 0));
  const controlPenalty = (100 - state.pitcherEnergy) / 300;
  const effectiveStrike = chance(Math.max(0.2, isStrikeZone ? 0.82 - controlPenalty : 0.18 - controlPenalty));

  if (swingType === "take") {
    effectiveStrike ? strike(true) : ball();
    drainPitcher(0.8);
    updateHUD();
    renderField();
    return;
  }

  const contactChanceBase = {
    power: 0.5,
    contact: 0.72,
    bunt: 0.87,
  }[swingType];

  const pitchDifficulty = {
    fastball: 0.1,
    curveball: 0.16,
    slider: 0.14,
    changeup: 0.12,
  }[pitchType];

  const contactChance = contactChanceBase - pitchDifficulty + state.pitcherEnergy / 500;

  if (!effectiveStrike && swingType !== "bunt") {
    if (chance(0.55)) {
      logPlay("Chased out of the zone.");
      strike(false);
    } else {
      ball();
    }
    drainPitcher(1.0);
    updateHUD();
    renderField();
    return;
  }

  if (!chance(contactChance)) {
    strike(false);
    drainPitcher(1.2);
    updateHUD();
    renderField();
    return;
  }

  const fairChance = swingType === "bunt" ? 0.88 : 0.72;
  if (!chance(fairChance)) {
    if (state.strikes < 2 || swingType !== "bunt") strike(false);
    else logPlay("Bunt foul with two strikes — batter is out!") || registerOut("Foul bunt strikeout.");
    drainPitcher(1.1);
    updateHUD();
    renderField();
    return;
  }

  resolveBallInPlay(swingType);
  drainPitcher(1.7);
  updateHUD();
  renderField();
}

function resolveBallInPlay(swingType) {
  const errorChance = 0.025 + (state.defenseShift === "in" ? 0.02 : 0);
  const hitRoll = Math.random();

  if (chance(errorChance)) {
    logPlay("Fielding error! Batter reaches safely.");
    advanceRunners(1, true);
    resetCount();
    return;
  }

  if (swingType === "bunt") {
    if (chance(0.62)) {
      registerOut("Sacrifice successful. Runner advances.");
      if (state.bases[0] || state.bases[1] || state.bases[2]) advanceRunners(1, true);
    } else {
      registerOut("Bunt popped up for an easy out.");
    }
    return;
  }

  const powerBoost = swingType === "power" ? 0.15 : 0;

  if (hitRoll < 0.08 + powerBoost) {
    logPlay("CRACK! Home run!");
    advanceRunners(4);
    resetCount();
    return;
  }
  if (hitRoll < 0.17 + powerBoost) {
    logPlay("Lined into the gap for a triple!");
    advanceRunners(3);
    resetCount();
    return;
  }
  if (hitRoll < 0.38 + powerBoost) {
    logPlay("Extra-base hit: double!");
    advanceRunners(2);
    resetCount();
    return;
  }
  if (hitRoll < 0.67 + powerBoost / 2) {
    logPlay("Clean single up the middle.");
    advanceRunners(1);
    resetCount();
    return;
  }

  const dpChance = state.bases[0] ? 0.25 : 0.04;
  if (chance(dpChance) && state.outs <= 1) {
    state.outs += 2;
    if (state.outs > 3) state.outs = 3;
    state.bases[0] = false;
    logPlay("Ground ball double play!");
    resetCount();
    if (state.outs >= 3) sideChange();
    return;
  }

  registerOut(chance(0.5) ? "Fly ball caught." : "Groundout to the infield.");
}

function attemptSteal() {
  if (!state.bases[0] && !state.bases[1]) {
    logPlay("No runner in position to steal.");
    return;
  }
  let moved = false;
  if (state.bases[1] && !state.bases[2]) {
    if (chance(0.55)) {
      state.bases[1] = false;
      state.bases[2] = true;
      logPlay("Runner steals third!");
    } else {
      state.bases[1] = false;
      registerOut("Caught stealing at third!");
    }
    moved = true;
  } else if (state.bases[0] && !state.bases[1]) {
    if (chance(0.68)) {
      state.bases[0] = false;
      state.bases[1] = true;
      logPlay("Runner steals second!");
    } else {
      state.bases[0] = false;
      registerOut("Caught stealing at second!");
    }
    moved = true;
  }
  if (!moved) logPlay("Steal lane blocked.");
  updateHUD();
}

function drainPitcher(amount) {
  state.pitcherEnergy = Math.max(0, state.pitcherEnergy - amount);
}

function changePitcher() {
  state.pitcherEnergy = 100;
  logPlay(`${currentFieldingSide()} changes pitchers. Fresh arm on the mound!`);
  updateHUD();
}

function renderField() {
  ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);

  ctx.fillStyle = "#3b7d2e";
  ctx.fillRect(0, 0, 640, 360);

  ctx.fillStyle = "#4fa84f";
  for (let y = 0; y < 360; y += 12) {
    if ((y / 12) % 2 === 0) ctx.fillRect(0, y, 640, 6);
  }

  ctx.save();
  ctx.translate(320, 215);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#b98b5e";
  ctx.fillRect(-120, -120, 240, 240);
  ctx.fillStyle = "#3b7d2e";
  ctx.fillRect(-92, -92, 184, 184);
  ctx.restore();

  drawBase(320 + 88, 214, state.bases[0]);
  drawBase(320, 126, state.bases[1]);
  drawBase(232, 214, state.bases[2]);
  drawBase(320, 302, false);

  drawPixelPlayer(320, 214, "#e53935");
  drawPixelPlayer(260, 180, "#1e88e5");
  drawPixelPlayer(380, 180, "#1e88e5");
  drawPixelPlayer(320, 150, "#1e88e5");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 640, 4);
  ctx.fillRect(0, 356, 640, 4);

  ctx.fillStyle = "#0d1117";
  ctx.fillRect(8, 8, 180, 30);
  ctx.fillStyle = "#f6c453";
  ctx.font = "16px monospace";
  ctx.fillText(`Pitch: ${lastPitch}`, 16, 28);
}

function drawBase(x, y, occupied) {
  ctx.fillStyle = occupied ? "#f5d34a" : "#ffffff";
  ctx.fillRect(x - 7, y - 7, 14, 14);
  ctx.fillStyle = "#111";
  ctx.fillRect(x - 7, y - 7, 14, 2);
}

function drawPixelPlayer(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 5, y - 10, 10, 12);
  ctx.fillStyle = "#ffe0b2";
  ctx.fillRect(x - 4, y - 16, 8, 6);
  ctx.fillStyle = "#111";
  ctx.fillRect(x - 1, y - 6, 2, 8);
}

let selectedPitch = "fastball";
let selectedSwing = "contact";

document.querySelectorAll("button[data-pitch]").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedPitch = btn.dataset.pitch;
    logPlay(`Pitch selected: ${selectedPitch}.`);
    simulatePitch(selectedPitch, selectedSwing);
  });
});

document.querySelectorAll("button[data-swing]").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedSwing = btn.dataset.swing;
    logPlay(`Swing style set to ${selectedSwing}.`);
  });
});

document.getElementById("takePitch").addEventListener("click", () => {
  simulatePitch(selectedPitch, "take");
});

document.getElementById("stealBtn").addEventListener("click", attemptSteal);
document.getElementById("intentionalWalk").addEventListener("click", () => {
  walkBatter(true);
  updateHUD();
});

document.getElementById("sacrifice").addEventListener("click", () => {
  resolveBallInPlay("bunt");
  updateHUD();
  renderField();
});

document.getElementById("infieldIn").addEventListener("click", () => {
  state.defenseShift = "in";
  logPlay("Defense playing in.");
});

document.getElementById("normalDepth").addEventListener("click", () => {
  state.defenseShift = "normal";
  logPlay("Defense back at normal depth.");
});

document.getElementById("changePitcher").addEventListener("click", changePitcher);

logPlay("Welcome to SNES Slugfest '96. Set your swing, then call pitches.");
updateHUD();
renderField();
