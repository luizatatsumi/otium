"use strict";

document.documentElement.dataset.otiumJs = "loaded";

const wordBanks = [
  {
    category: "character",
    words: [
      "stranger", "astronaut", "grandmother", "thief", "poet",
      "child", "neighbor", "scientist", "gardener", "detective",
      "musician", "baker", "teacher", "ghost", "sailor", "inventor",
      "rival", "twin", "tourist", "doctor", "magician", "journalist",
      "pilot", "librarian", "painter", "judge", "chef", "dancer",
      "mechanic", "messenger", "architect", "actor", "farmer",
      "prisoner", "photographer", "emperor", "student", "beekeeper",
      "climber", "dreamer"
    ]
  },
  {
    category: "action",
    words: [
      "vanish", "whisper", "steal", "forgive", "follow", "hide",
      "discover", "escape", "wait", "return", "lie", "rescue",
      "trade", "confess", "remember", "climb", "break", "choose",
      "dance", "promise", "bury", "reveal", "protect", "abandon",
      "chase", "interrupt", "invent", "refuse", "translate", "collect",
      "surrender", "rebuild", "search", "knock", "hesitate", "float",
      "awaken", "disappear", "listen", "write"
    ]
  },
  {
    category: "object",
    words: [
      "key", "mirror", "letter", "suitcase", "photograph", "umbrella",
      "compass", "candle", "ticket", "watch", "map", "notebook",
      "ring", "radio", "bottle", "mask", "coin", "ladder", "camera",
      "envelope", "clock", "rope", "glove", "passport", "spoon",
      "telescope", "bicycle", "violin", "teacup", "matchbox",
      "painting", "magnet", "feather", "receipt", "lantern", "scissors",
      "helmet", "postcard", "bell", "box"
    ]
  },
  {
    category: "place",
    words: [
      "station", "rooftop", "forest", "kitchen", "museum", "beach",
      "elevator", "border", "library", "airport", "island", "tunnel",
      "hotel", "attic", "bridge", "market", "garden", "theater",
      "lighthouse", "desert", "harbor", "subway", "hospital",
      "classroom", "village", "balcony", "mountain", "basement",
      "carnival", "courtroom", "river", "observatory", "bakery",
      "cemetery", "highway", "farm", "castle", "warehouse",
      "laboratory", "bookstore"
    ]
  },
  {
    category: "twist",
    words: [
      "secret", "midnight", "jealousy", "silence", "thunder", "mistake",
      "reunion", "betrayal", "laughter", "storm", "blackout", "rumor",
      "courage", "regret", "hunger", "eclipse", "debt", "accident",
      "warning", "celebration", "goodbye", "deadline", "coincidence",
      "apology", "revenge", "memory", "dream", "panic", "rebellion",
      "wedding", "disappearance", "victory", "fever", "confession",
      "inheritance", "delay", "prophecy", "truth", "promise", "surprise"
    ]
  }
];

const storageKey = "otium-writing-session-v1";

const roulette = document.querySelector("#roulette");
const rollButton = document.querySelector("#roll-button");
const rollAgainButton = document.querySelector("#roll-again-button");
const clearButton = document.querySelector("#clear-button");
const rollMain = document.querySelector("[data-roll-main]");
const wheelWords = [...document.querySelectorAll("[data-wheel-word]")];
const challenge = document.querySelector("#writing-challenge");
const wordCards = [...document.querySelectorAll("[data-word-card]")];
const story = document.querySelector("#story");
const progress = document.querySelector("#word-progress");
const rouletteStatus = document.querySelector("#roulette-status");

let currentWords = [];
let shuffleInterval;

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function chooseFiveWords() {
  const selected = new Set();

  return wordBanks.map((bank) => {
    const availableWords = bank.words.filter((word) => !selected.has(word));
    const word = randomItem(availableWords);

    selected.add(word);

    return {
      category: bank.category,
      word
    };
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasWord(text, word) {
  const expression = new RegExp(
    `(^|[^a-z])${escapeRegExp(word.toLowerCase())}(?=$|[^a-z])`,
    "i"
  );

  return expression.test(text.toLowerCase());
}

function renderWords(words) {
  words.forEach((item, index) => {
    wheelWords[index].textContent = item.word;
    wordCards[index].querySelector("[data-category]").textContent = item.category;
    wordCards[index].querySelector("[data-word]").textContent = item.word;
    wordCards[index].classList.remove("is-used");
  });

  rouletteStatus.textContent = `Your words are ${words
    .map((item) => item.word)
    .join(", ")}.`;
}

function saveSession() {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        words: currentWords,
        story: story.value
      })
    );
  } catch (error) {
    // The exercise still works if browser storage is unavailable.
  }
}

function updateProgress() {
  const usedWords = currentWords.filter((item) => hasWord(story.value, item.word));

  currentWords.forEach((item, index) => {
    wordCards[index].classList.toggle(
      "is-used",
      usedWords.some((used) => used.word === item.word)
    );
  });

  progress.textContent = usedWords.length === 5
    ? "all five words used — keep going."
    : `${usedWords.length} of 5 words used`;

  progress.classList.toggle("is-complete", usedWords.length === 5);
  saveSession();
}

function showChallenge() {
  challenge.hidden = false;
  challenge.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start"
  });
}

function finishRoll() {
  window.clearInterval(shuffleInterval);

  currentWords = chooseFiveWords();
  renderWords(currentWords);

  story.value = "";
  updateProgress();

  roulette.classList.remove("is-spinning");
  rollButton.disabled = false;
  rollMain.textContent = "roll";

  showChallenge();

  window.setTimeout(() => story.focus(), 450);
}

function rollWords() {
  if (story.value.trim()) {
    const shouldContinue = window.confirm(
      "Roll again and clear your current story?"
    );

    if (!shouldContinue) {
      return;
    }
  }

  roulette.classList.remove("is-spinning");
  void roulette.offsetWidth;
  roulette.classList.add("is-spinning");

  rollButton.disabled = true;
  rollMain.textContent = "rolling";

  shuffleInterval = window.setInterval(() => {
    wordBanks.forEach((bank, index) => {
      wheelWords[index].textContent = randomItem(bank.words);
    });
  }, 70);

  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 80
    : 900;

  window.setTimeout(finishRoll, delay);
}

function clearStory() {
  if (!story.value.trim()) {
    story.focus();
    return;
  }

  const shouldClear = window.confirm("Clear your current story?");

  if (!shouldClear) {
    return;
  }

  story.value = "";
  updateProgress();
  story.focus();
}

function restoreSession() {
  try {
    const savedSession = JSON.parse(localStorage.getItem(storageKey));

    if (
      !savedSession ||
      !Array.isArray(savedSession.words) ||
      savedSession.words.length !== 5
    ) {
      return;
    }

    currentWords = savedSession.words;
    renderWords(currentWords);
    story.value = typeof savedSession.story === "string"
      ? savedSession.story
      : "";
    challenge.hidden = false;
    updateProgress();
  } catch (error) {
    // Ignore invalid or unavailable browser storage.
  }
}

rollButton.dataset.bound = "true";
rollButton.addEventListener("click", rollWords);
rollAgainButton.addEventListener("click", rollWords);
clearButton.addEventListener("click", clearStory);
story.addEventListener("input", updateProgress);

restoreSession();
