const words = [
  "CODES", "LOGIN", "GREED", "BOOST", "OMEN", "CHEAT", "SCENE", "VIRUS", 
  "ALERT", "GHOST", "NUKE", "COMMIE", "PRESERVATION", "ANOMALY", "CYBER", 
  "ERROR", "FORCE", "HACK", "PARSER", "ZERO", "INPUT", "EXPERT", "CIPHER", 
  "REACT", "SYSTEM", "VIRAL", "LOGIN", "RATELIMIT", "ACCESS", "BLOCK", 
  "DECRYPT", "FAILURE", "DATABASE", "BITRATE", "NODE", "INTERFACE", 
  "ENCRYPT", "CRACK", "PROTOCOL", "BACKDOOR", "PORT", "ALGORITHM", 
  "FLOOD", "QUEUE", "BUFFER", "DUMP", "SIGNAL", "HEX", "TRACE", "FLASH", 
  "MONITOR", "SCAN", "LOG", "PATTERN", "DEBUG", "PATH", "COMMAND", 
  "CLIENT", "SERVER", "PROXY", "BUFFER", "FORWARD", "STREAM", "DELAY", 
  'Holotape', 'Vault', 'Fission', 'Fusion', 'Terminal', 'Data', 'Encryption',
  'Wasteland', 'Nuclear', 'Radiation', 'Pip-Boy', 'Intercom', 'Overseer', 'Access',
  'Lockdown', 'Encryption', 'Security', 'Sublevel', 'Prototype', 'Blueprint'
];

const maxAttempts = 5;
let attempts = maxAttempts;
let correctWord = words[Math.floor(Math.random() * words.length)];
let cursorRow = 0;
let cursorCol = 0;
let cursorChar = 0;

function generateLine() {
  const column1 = [];
  const column2 = [];

  for (let i = 0; i < 8; i++) {
    column1.push(Math.random() > 0.5 ? generateRandomJunk(6) : `<span class="word">${getRandomWord()}</span>`);
    column2.push(Math.random() > 0.5 ? generateRandomJunk(6) : `<span class="word">${getRandomWord()}</span>`);
  }

  return `
    <div class="terminal-line">
      <div class="column">${column1.join(' ')}</div>
      <div class="column">${column2.join(' ')}</div>
    </div>
  `;
}

function generateWordWithSpans(word) {
  return word.split('').map(char => `<span class="char">${char}</span>`).join('');
}

function padTo12(word) {
  if (word.length < 12) {
    return word + ' '.repeat(12 - word.length);
  }
  if (word.length > 12) {
    return word.substring(0, 12);
  }
  return word;
}

function populateLines() {
  const lineContainer = document.getElementById("lineContainer");
  lineContainer.innerHTML = ""; 
  for (let i = 0; i < 10; i++) {
    const line = document.createElement("div");
    line.className = "line";
    line.innerHTML = generateLine();
    lineContainer.appendChild(line);
  }
}

function updateCursor() {
  const lines = document.querySelectorAll(".line");
  lines.forEach((line, index) => {
    const columns = line.querySelectorAll(".column");
    const column1Words = columns[0].querySelectorAll(".word");
    const column2Words = columns[1].querySelectorAll(".word");
    column1Words.forEach(word => word.classList.remove("highlight"));
    column2Words.forEach(word => word.classList.remove("highlight"));
    if (index === cursorRow) {
      const columnWords = cursorCol === 0 ? column1Words : column2Words;
      const targetWord = columnWords[cursorChar];
      if (targetWord) {
        targetWord.classList.add("highlight");
      }
    }
  });
}

function handleKeydown(event) {
  const lines = document.querySelectorAll(".line");
  const selectedLine = lines[cursorRow];
  const columns = selectedLine.querySelectorAll(".column");
  const columnWords = cursorCol === 0 ? columns[0].querySelectorAll(".word") : columns[1].querySelectorAll(".word");

 
  if (event.key === "ArrowRight") {
    if (cursorChar < columnWords[cursorCol].childElementCount - 1) {
      cursorChar++;
    }
  } else if (event.key === "ArrowLeft") {
    if (cursorChar > 0) {
      cursorChar--;
    }
  } else if (event.key === "Enter") {
    selectWord();
  }

  updateCursor();
}

function selectWord() {
  const lines = document.querySelectorAll(".line");
  const selectedLine = lines[cursorRow];
  const columns = selectedLine.querySelectorAll(".column");
  const wordsInColumn = cursorCol === 0 ? columns[0].querySelectorAll(".word") : columns[1].querySelectorAll(".word");

  const targetWord = Array.from(wordsInColumn).find(word => word.textContent === correctWord);
  if (targetWord) {
    resetGame();
  } else {
    attempts--;
    if (attempts <= 0) {
      resetGame();
    } else {
      document.getElementById("attempts").textContent = `Attempts Remaining: ${"█ ".repeat(attempts)}`;
    }
  }
}

function resetGame() {
  attempts = maxAttempts;
  correctWord = words[Math.floor(Math.random() * words.length)];
  document.getElementById("attempts").textContent = `Attempts Remaining: ${"█ ".repeat(attempts)}`;
  populateLines();
}

document.addEventListener("keydown", handleKeydown);
populateLines();

document.querySelectorAll('input[type="text"], input[type="password"]').forEach(input => {
  input.setAttribute('autocomplete', 'off');
});
