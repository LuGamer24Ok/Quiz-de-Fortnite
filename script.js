console.log("script.js cargado");
let answering = false;
let streak = 0;
let maxStreak = 0;

// ===== CONFIG =====
const QUIZ_LENGTH = 10;
let questions = [];
let current = 0;
let score = 0;
let mode = "normal";

 const sounds = {
  correct: new Audio("sounds/correct.mp3"),
  wrong: new Audio("sounds/wrong.mp3"),
  end: new Audio("sounds/end.mp3")
};


// ===== BANCO =====
const fortnite = {
  normal: [
    { text:"¿Qué objeto te permite relanzarte al caer?", options:["Pad","Granada","Escudo","Sniper"], correct:0, points:1 },
    { text:"¿Qué arma tiene daño constante?", options:["Shotgun","AR","Sniper","Explosivos"], correct:1, points:1 },
    { text:"¿Qué consumible cura solo escudo?", options:["Botiquín","Mini","Vendaje","Splash"], correct:1, points:1 },
    { text:"¿Qué acción hace más ruido?", options:["Caminar","Correr","Agacharse","Editar"], correct:1, points:1 },
    { text:"¿Qué pasa si llegas a 0 de vida?", options:["Pierdes escudo","Noqueado","Mueres","Reapareces"], correct:2, points:1 },
    { text:"¿Qué arma rompe builds?", options:["Pistola","SMG","Shotgun","Sniper"], correct:1, points:1 },
    { text:"¿Para qué sirve agacharse?", options:["Correr","Reducir ruido","Curarse","Saltar"], correct:1, points:1 },
    { text:"¿Qué indica sonido de pasos?", options:["Loot","Enemigo","Zona","Tormenta"], correct:1, points:1 },
    { text:"¿Cuántos jugadores entran?", options:["50","75","100","150"], correct:2, points:1 },
    { text:"¿Color arma legendaria?", options:["Azul","Morado","Dorado","Verde"], correct:2, points:1 }
  ],
  hardcore: [
    { text:"¿Qué edit expone menos?", options:["Puerta","Ventana","Triple","Pared"], correct:1, points:4 },
    { text:"¿Qué es piece control?", options:["Editar","Controlar builds","Build alto","Spam"], correct:1, points:4 },
    { text:"¿Qué castiga más un peek?", options:["AR","SMG","Pump","Pistola"], correct:2, points:4 },
    { text:"¿Qué es taking walls?", options:["Romper","Sin mats","Reemplazar","Editar"], correct:2, points:4 },
    { text:"¿Factor clave boxfight?", options:["FPS","Ping","Skin","Zona"], correct:1, points:4 },
    { text:"¿Por qué resetear edits?", options:["Curar","Evitar trade","Rotar","Mats"], correct:1, points:4 },
    { text:"¿Qué es tarp?", options:["Campear","Rotar protegido","Sin mats","Curarse"], correct:1, points:4 },
    { text:"¿Right-hand peek?", options:["Daño","Menor hitbox","Velocidad","Recoil"], correct:1, points:4 },
    { text:"¿Pump HS legendaria?", options:["120","160","190","250"], correct:2, points:4 },
    { text:"¿Ventaja pre-edit?", options:["Daño","Control","Menos mats","Velocidad"], correct:1, points:4 }
  ]
};

// ===== HELPERS =====
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function initQuestions(selectedMode) {
  mode = selectedMode;
  questions = shuffle(fortnite[mode]).slice(0, QUIZ_LENGTH);
  current = 0;
  score = 0;
  streak = 0;
maxStreak = 0;

}

function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play().catch(() => {});
  }
}

let audioUnlocked = false;

document.addEventListener("click", () => {
  if (audioUnlocked) return;

  Object.values(sounds).forEach(sound => {
    sound.volume = 0.6;
    sound.play().then(() => sound.pause()).catch(() => {});
  });

  audioUnlocked = true;
}, { once: true });

function playSound(type) {
  if (!audioUnlocked) return;

  const sound = sounds[type];
  if (!sound) return;

  sound.pause();
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

// ===== GAME =====
function startGame(selectedMode) {
  const user = document.getElementById("username").value.trim();
  if (user.length < 3) {
    alert("Username mínimo 3 caracteres");
    return;
  }

  initQuestions(selectedMode);

  document.getElementById("start").style.display = "none";
  document.getElementById("quiz").style.display = "block";

  document.getElementById("title").textContent =
    mode === "hardcore"
      ? "Fortnite — Hardcore ☠️"
      : "Fortnite — Normal";

  updateQuestion();
}

function updateQuestion() {
  if (!questions.length || current >= questions.length) {
    return endGame("Terminado 🎉");
  }

  const q = questions[current];

  document.getElementById("question").textContent = q.text;
  document.getElementById("progress").textContent =
    `Pregunta ${current + 1} de ${questions.length}`;

  document.getElementById("progress-fill").style.width =
    ((current + 1) / questions.length) * 100 + "%";

  const container = document.getElementById("answers");
  container.innerHTML = "";

  answering = false; // 🔑 permite responder

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i);
    container.appendChild(btn);
  });
}


function selectAnswer(index) {
  if (answering) return;
  answering = true;

  const q = questions[current];
  const buttons = document.querySelectorAll(".answer-btn");

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add("correct");
    if (i === index && i !== q.correct) btn.classList.add("wrong");
  });

  if (index === q.correct) {
    playSound("correct");
    streak++;
    maxStreak = Math.max(maxStreak, streak);
    score += q.points;
  } else {
    playSound("wrong");
    streak = 0;

    if (mode === "hardcore") {
      return endGame("Fallaste una 💀");
    }
  }

  setTimeout(() => {
    current++;
    updateQuestion(); // 🔑 no lógica duplicada
  }, 700);
}


  setTimeout(() => {
    current++;
    current < questions.length
      ? updateQuestion()
      : endGame("Terminado 🎉");
  }, 800);


function endGame(msg) {
  playSound("end");

  document.getElementById("quiz").style.display = "none";
  document.getElementById("result").style.display = "block";

  document.getElementById("result").innerHTML = `
    <h2>${msg}</h2>
    <p>Puntaje: <b>${score}</b></p>
    <p>🔥 Mejor racha: <b>${maxStreak}</b></p>
    <button onclick="location.reload()">Reintentar</button>
  `;
}


// ===== EVENTS =====
document.getElementById("btn-normal").onclick = () => startGame("normal");
document.getElementById("btn-hardcore").onclick = () => startGame("hardcore");

function saveScore(username, score) {
  const ranking = JSON.parse(localStorage.getItem("quizRanking")) || [];

  ranking.push({
    user: username,
    score,
    date: new Date().toLocaleDateString()
  });

  ranking.sort((a, b) => b.score - a.score);

  localStorage.setItem("quizRanking", JSON.stringify(ranking.slice(0, 10)));
}

function getRanking() {
  return JSON.parse(localStorage.getItem("quizRanking")) || [];
}

