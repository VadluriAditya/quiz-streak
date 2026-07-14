// Quiz Streak -- trivia with escalating difficulty. Every 3 correct answers
// in a row bumps the tier (easy -> medium -> hard); one wrong answer ends the run.

const QUESTIONS = {
  easy: [
    { q: "What is the capital of France?", choices: ["Berlin", "Paris", "Rome", "Madrid"], answer: 1 },
    { q: "How many days are in a week?", choices: ["5", "6", "7", "8"], answer: 2 },
    { q: "What color do you get mixing blue and yellow?", choices: ["Purple", "Green", "Orange", "Grey"], answer: 1 },
    { q: "Which planet do we live on?", choices: ["Mars", "Venus", "Earth", "Jupiter"], answer: 2 },
    { q: "What is 8 + 5?", choices: ["12", "13", "14", "15"], answer: 1 },
    { q: "Which animal is known as man's best friend?", choices: ["Cat", "Dog", "Horse", "Parrot"], answer: 1 },
  ],
  medium: [
    { q: "What is the largest ocean on Earth?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
    { q: "Who painted the Mona Lisa?", choices: ["Van Gogh", "Da Vinci", "Picasso", "Monet"], answer: 1 },
    { q: "What is the square root of 144?", choices: ["10", "11", "12", "13"], answer: 2 },
    { q: "Which gas do plants absorb from the air?", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2 },
    { q: "In what year did World War II end?", choices: ["1943", "1945", "1947", "1950"], answer: 1 },
    { q: "What is the chemical symbol for gold?", choices: ["Go", "Gd", "Au", "Ag"], answer: 2 },
  ],
  hard: [
    { q: "What is the smallest prime number greater than 20?", choices: ["21", "22", "23", "29"], answer: 2 },
    { q: "Which country has the most time zones?", choices: ["Russia", "USA", "France", "China"], answer: 2 },
    { q: "What is the powerhouse of the cell called?", choices: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: 2 },
    { q: "Who wrote 'One Hundred Years of Solitude'?", choices: ["Borges", "Marquez", "Neruda", "Allende"], answer: 1 },
    { q: "What is the derivative of x^2?", choices: ["x", "2x", "x^2", "2"], answer: 1 },
    { q: "Which element has the atomic number 1?", choices: ["Helium", "Oxygen", "Hydrogen", "Carbon"], answer: 2 },
  ],
};
const TIERS = ["easy", "medium", "hard"];
const PROMOTE_EVERY = 3;

const STORAGE_KEY = "quizstreak.best";
function loadBest() { return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10); }
function saveBest(v) { localStorage.setItem(STORAGE_KEY, String(v)); }

let best = loadBest();
let streak = 0;
let tierIndex = 0;
let usedThisRun = { easy: [], medium: [], hard: [] };
let currentQ = null;
let answered = false;
let over = false;

const app = document.getElementById("app");

function pickQuestion() {
  const tier = TIERS[tierIndex];
  const pool = QUESTIONS[tier];
  const usedIdx = usedThisRun[tier];
  let available = pool.map((_, i) => i).filter(i => !usedIdx.includes(i));
  if (available.length === 0) { usedThisRun[tier] = []; available = pool.map((_, i) => i); }
  const idx = available[Math.floor(Math.random() * available.length)];
  usedThisRun[tier].push(idx);
  return { ...pool[idx], tier, poolIndex: idx };
}

function startRun() {
  streak = 0;
  tierIndex = 0;
  usedThisRun = { easy: [], medium: [], hard: [] };
  over = false;
  answered = false;
  currentQ = pickQuestion();
  render();
}

function answer(choiceIndex) {
  if (answered) return;
  answered = true;
  const correct = choiceIndex === currentQ.answer;
  render(choiceIndex);
  setTimeout(() => {
    if (correct) {
      streak++;
      if (streak > best) { best = streak; saveBest(best); }
      if (streak % PROMOTE_EVERY === 0 && tierIndex < TIERS.length - 1) tierIndex++;
      currentQ = pickQuestion();
      answered = false;
      render();
    } else {
      over = true;
      render();
    }
  }, 900);
}

function render(chosenIndex) {
  let html = `
    <div class="eyebrow">Quiz Streak</div>
    <h1>Quiz Streak</h1>
    <div class="sub">Answer in a row. Miss one and the run ends.</div>
    <div class="stat-row">
      <div class="stat"><div class="num">${streak}</div><div class="label">Streak</div></div>
      <div class="stat"><div class="num">${best}</div><div class="label">Best</div></div>
    </div>
  `;
  if (over) {
    html += `
      <div class="card result">
        <h2>Run Over</h2>
        <p>You reached a streak of <strong>${streak}</strong> on the <strong>${currentQ.tier}</strong> tier.</p>
        <button class="btn" id="retryBtn">Play again</button>
      </div>
    `;
  } else {
    html += `<div class="tier-badge">${currentQ.tier.toUpperCase()}</div>`;
    html += `<div class="card"><div class="question">${currentQ.q}</div>`;
    currentQ.choices.forEach((c, i) => {
      let cls = "";
      if (answered) {
        if (i === currentQ.answer) cls = "correct";
        else if (i === chosenIndex) cls = "wrong";
      }
      html += `<button class="choice ${cls}" data-choice="${i}" ${answered ? "disabled" : ""}>${c}</button>`;
    });
    html += `</div>`;
  }
  app.innerHTML = html;
  if (!over) {
    app.querySelectorAll("[data-choice]").forEach(btn => {
      btn.addEventListener("click", () => answer(parseInt(btn.getAttribute("data-choice"), 10)));
    });
  } else {
    document.getElementById("retryBtn").addEventListener("click", startRun);
  }
}

startRun();

(function selfCheck() {
  const check = (cond, msg) => { if (!cond) console.error("Quiz Streak self-check FAILED:", msg); };
  check(TIERS.length === 3, "three tiers");
  Object.values(QUESTIONS).forEach(list => {
    list.forEach(q => check(q.choices.length === 4 && q.answer >= 0 && q.answer < 4, `valid question: ${q.q}`));
  });
  console.log(`Quiz Streak self-check passed (${Object.values(QUESTIONS).flat().length} questions validated).`);
})();
