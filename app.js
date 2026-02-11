const triviaQuestions = [
  {
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Canberra", "Melbourne", "Perth"],
    answer: "Canberra",
  },
  {
    question: "Which planet is called the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: "Mars",
  },
  {
    question: "What year did the first iPhone launch?",
    options: ["2005", "2007", "2010", "2012"],
    answer: "2007",
  },
  {
    question: "Which element has the chemical symbol O?",
    options: ["Gold", "Oxygen", "Osmium", "Zinc"],
    answer: "Oxygen",
  },
  {
    question: "How many players are on a soccer team on the field at once?",
    options: ["9", "10", "11", "12"],
    answer: "11",
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Indian Ocean", "Atlantic Ocean", "Arctic Ocean", "Pacific Ocean"],
    answer: "Pacific Ocean",
  },
];

const words = ["puzzle", "galaxy", "notebook", "quantum", "library", "trivia", "cipher"];

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const totalEl = document.getElementById("total");
const bestScoreEl = document.getElementById("best-score");
const questionProgressEl = document.getElementById("question-progress");
const nextQuestionBtn = document.getElementById("next-question");
const resetTriviaBtn = document.getElementById("reset-trivia");

const scrambledEl = document.getElementById("scrambled");
const guessEl = document.getElementById("guess");
const puzzleFeedbackEl = document.getElementById("puzzle-feedback");
const attemptCountEl = document.getElementById("attempt-count");
const checkGuessBtn = document.getElementById("check-guess");
const showHintBtn = document.getElementById("show-hint");
const newPuzzleBtn = document.getElementById("new-puzzle");

const STORAGE_KEY = "trivia-best-score";

let questionDeck = [];
let currentQuestion = null;
let score = 0;
let askedCount = 0;
let hasAnsweredCurrent = false;

let currentWord = "";
let puzzleAttempts = 0;

function shuffle(list) {
  const copy = [...list];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function pickRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function loadBestScore() {
  const saved = Number(localStorage.getItem(STORAGE_KEY) || 0);
  bestScoreEl.textContent = Number.isFinite(saved) ? saved : 0;
}

function saveBestScoreIfNeeded() {
  const bestScore = Number(bestScoreEl.textContent);

  if (score > bestScore) {
    localStorage.setItem(STORAGE_KEY, String(score));
    bestScoreEl.textContent = String(score);
  }
}

function prepareDeckIfNeeded() {
  if (questionDeck.length === 0) {
    questionDeck = shuffle(triviaQuestions);
    askedCount = 0;
  }
}

function setTriviaFeedback(message = "", status = "") {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${status}`.trim();
}

function updateTriviaMeta() {
  totalEl.textContent = String(askedCount);
  questionProgressEl.textContent = `${Math.min(askedCount + 1, triviaQuestions.length)} / ${triviaQuestions.length}`;
}

function renderQuestion() {
  prepareDeckIfNeeded();

  currentQuestion = questionDeck.pop();
  hasAnsweredCurrent = false;

  questionEl.textContent = currentQuestion.question;
  setTriviaFeedback();
  answersEl.innerHTML = "";

  const shuffledOptions = shuffle(currentQuestion.options);
  shuffledOptions.forEach((option) => {
    const button = document.createElement("button");
    button.className = "btn answer-btn";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => checkAnswer(option, button));
    answersEl.appendChild(button);
  });

  nextQuestionBtn.disabled = true;
  updateTriviaMeta();
}

function lockAnswerButtons(selectedAnswer) {
  const allAnswerButtons = [...answersEl.querySelectorAll("button")];

  allAnswerButtons.forEach((button) => {
    const option = button.textContent;

    button.disabled = true;

    if (option === currentQuestion.answer) {
      button.classList.add("correct");
    } else if (option === selectedAnswer) {
      button.classList.add("wrong");
    }
  });
}

function checkAnswer(selectedAnswer) {
  if (hasAnsweredCurrent) {
    return;
  }

  hasAnsweredCurrent = true;
  askedCount += 1;

  if (selectedAnswer === currentQuestion.answer) {
    score += 1;
    scoreEl.textContent = String(score);
    setTriviaFeedback("Correct! Nice work.", "good");
  } else {
    setTriviaFeedback(`Not quite. Correct answer: ${currentQuestion.answer}`, "bad");
  }

  lockAnswerButtons(selectedAnswer);
  saveBestScoreIfNeeded();
  updateTriviaMeta();
  nextQuestionBtn.disabled = false;
}

function resetTriviaRound() {
  score = 0;
  askedCount = 0;
  scoreEl.textContent = "0";
  totalEl.textContent = "0";
  questionDeck = [];
  renderQuestion();
}

function scramble(word) {
  return shuffle(word.split("")).join("");
}

function renderPuzzle() {
  currentWord = pickRandomItem(words);
  let scrambled = scramble(currentWord);

  while (scrambled === currentWord) {
    scrambled = scramble(currentWord);
  }

  puzzleAttempts = 0;
  attemptCountEl.textContent = `Attempts: ${puzzleAttempts}`;
  scrambledEl.textContent = scrambled;
  guessEl.value = "";
  puzzleFeedbackEl.textContent = "";
  puzzleFeedbackEl.className = "feedback";
}

function checkGuess() {
  const guess = guessEl.value.trim().toLowerCase();

  if (!guess) {
    puzzleFeedbackEl.textContent = "Type a guess first.";
    puzzleFeedbackEl.className = "feedback bad";
    return;
  }

  puzzleAttempts += 1;
  attemptCountEl.textContent = `Attempts: ${puzzleAttempts}`;

  if (guess === currentWord) {
    puzzleFeedbackEl.textContent = "You solved it!";
    puzzleFeedbackEl.className = "feedback good";
  } else {
    puzzleFeedbackEl.textContent = "Nope, try again.";
    puzzleFeedbackEl.className = "feedback bad";
  }
}

function showHint() {
  const hint = `Hint: starts with '${currentWord[0].toUpperCase()}' and has ${currentWord.length} letters.`;
  puzzleFeedbackEl.textContent = hint;
  puzzleFeedbackEl.className = "feedback";
}

nextQuestionBtn.addEventListener("click", renderQuestion);
resetTriviaBtn.addEventListener("click", resetTriviaRound);
checkGuessBtn.addEventListener("click", checkGuess);
showHintBtn.addEventListener("click", showHint);
newPuzzleBtn.addEventListener("click", renderPuzzle);

guessEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkGuess();
  }
});

loadBestScore();
resetTriviaRound();
renderPuzzle();
