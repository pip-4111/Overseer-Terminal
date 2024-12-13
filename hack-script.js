const symbols = ['@', '#', '$', '%', '&', '*', '!', '^', '~', '=', '+', '/', '\\', '|', '<', '>', '?', ':', ';', '(', ')', '[', ']', '{', '}', '"', '\''];

document.querySelectorAll('input[type="text"], input[type="password"]').forEach(input => {
  input.setAttribute('autocomplete', 'off');
});


function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function getRandomHex() {
  const randomValue = Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
  return `0x2A${randomValue}`;
}

const bank1 = ["HOLOTAPE", "STIMPAK", "BYPASS", "OVERRIDE", "TERMINAL", "WASHINGTON", "LINCOLN", "JEFFERSON", "VEGAS", "COMMONWEALTH", "PIPBOY", "RADIOACTIVE", "CONCORD", "GADGET", "WAR", "ATOM"];
const bank2 = ["RADIOACTIVE", "NUCLEAR", "ATOM", "HEAVEN", "GOVERN", "COUNCIL", "FALLOUT", "VAULT", "EXPLORER", "CONCORD", "SCAVENGER", "GEAR", "RADIATION", "MUTANT", "FUSION", "REACTOR"];
const bank3 = ["GRAVITY", "QUANTUM", "HORIZON", "GALAXY", "STEALTH", "CIRCUIT", "PULSE", "ECLIPSE", "NEBULA", "ORBIT", "STARGAZER", "PROTON", "VIRUS", "GENOME", "NANO", "ASTRO"];

const delimiters = ["()", "[]", "{}", "<>", '""'];

function createRowWithWord(word, rowLength = 20) {
  const row = Array(rowLength).fill(null);
  const startPos = Math.floor(Math.random() * (rowLength - word.length));
  for (let i = 0; i < word.length; i++) {
    row[startPos + i] = word[i];
  }
  return row.map(char => char || getRandomSymbol()).join('');
}

function createRowWithJunk(rowLength = 20) {
  return Array.from({ length: rowLength }, getRandomSymbol).join('');
}

function createRowWithHex(rowLength = 20) {
  const row = Array(rowLength).fill(null);
  const startPos = Math.floor(Math.random() * (rowLength - 1));
  row[startPos] = getRandomHex();
  return row.join('');
}

function createGridWithWords(rows, columns, bank) {
  const grid = [];
  let wordIndex = 0;
  for (let i = 0; i < rows; i++) {
    if (Math.random() < 0.3) { 
      grid.push(createRowWithJunk(columns));
    } else {
      const word = bank[wordIndex];
      grid.push(createRowWithWord(word, columns));
      wordIndex = (wordIndex + 1) % bank.length;
    }
  }
  return grid;
}

function createGridWithHexOnly(rows, columns) {
  return Array.from({ length: rows }, () => createRowWithHex(columns));
}

function displayGrid(elementId, gridData) {
  const gridElement = document.getElementById(elementId);
  gridElement.innerHTML = '';
  gridData.forEach((row, rowIndex) => {
    const rowElement = document.createElement('div');
    rowElement.classList.add('grid-row');
    row.split('').forEach((char, charIndex) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.setAttribute('data-row', rowIndex);
      span.setAttribute('data-index', charIndex);
      rowElement.appendChild(span);
    });
    gridElement.appendChild(rowElement);
  });
}

const grid1Data = createGridWithHexOnly(12, 20);
const grid2Data = createGridWithWords(12, 20, bank1);
const grid3Data = createGridWithHexOnly(12, 20);
const grid4Data = createGridWithWords(12, 20, bank2);

displayGrid('grid1', grid1Data);
displayGrid('grid2', grid2Data);
displayGrid('grid3', grid3Data);
displayGrid('grid4', grid4Data);

let cursorPosition = { x: 0, y: 0 };
let highlightedWord = [];
let currentGrid = 'grid2';
let attemptsRemaining = 4;

let words2 = grid2Data.flatMap(row => row.match(/\b[A-Z]+\b/g) || []);
let words4 = grid4Data.flatMap(row => row.match(/\b[A-Z]+\b/g) || []);
let allWords = words2.concat(words4);
let password = allWords[Math.floor(Math.random() * allWords.length)];
console.log('Password:', password); 

document.addEventListener('keydown', function(event) {
  let gridElement, gridData, gridRows;

  if (currentGrid === 'grid2') {
    gridElement = document.getElementById('grid2');
    gridRows = gridElement.querySelectorAll('.grid-row');
    gridData = Array.from(gridRows).map(row => row.textContent);
  } else {
    gridElement = document.getElementById('grid4');
    gridRows = gridElement.querySelectorAll('.grid-row');
    gridData = Array.from(gridRows).map(row => row.textContent);
  }

  // Remove previous highlights
  if (highlightedWord.length > 0) {
    highlightedWord.forEach(span => span.classList.remove('highlight-text'));
  }

  switch (event.key) {
    case 'ArrowUp':
      if (cursorPosition.y > 0) cursorPosition.y--;
      break;
    case 'ArrowDown':
      if (cursorPosition.y < gridData.length - 1) cursorPosition.y++;
      break;
    case 'ArrowLeft':
      if (cursorPosition.x > 0) {
        cursorPosition.x--;
      } else if (currentGrid === 'grid4') {
        currentGrid = 'grid2';
        gridElement = document.getElementById('grid2');
        cursorPosition.x = gridElement.querySelector('.grid-row').textContent.length - 1;
        gridRows = gridElement.querySelectorAll('.grid-row');
        gridData = Array.from(gridRows).map(row => row.textContent);
      }
      break;
    case 'ArrowRight':
      const row = gridData[cursorPosition.y];
      const charIndex = cursorPosition.x;

      if (charIndex < row.length - 1) {
        if (/\w/.test(row[charIndex])) {
          const wordEnd = getWordEnd(row, charIndex);
          cursorPosition.x = Math.min(wordEnd, row.length - 1);
        } else {
          cursorPosition.x++;
        }
      } else if (currentGrid === 'grid2') {
        currentGrid = 'grid4';
        cursorPosition.x = 0;
        gridElement = document.getElementById('grid4');
        gridRows = gridElement.querySelectorAll('.grid-row');
        gridData = Array.from(gridRows).map(row => row.textContent);
      }
      break;
    case 'Enter':
      checkSelectedWord();
      break;
  }

  updateHighlight(gridElement, gridData);
});

let interactedDelimiters = new Set(); 

function updateHighlight(gridElement, gridData) {
  const gridRows = gridElement.querySelectorAll('.grid-row');
  const targetRow = gridRows[cursorPosition.y];
  const allSpans = Array.from(targetRow.querySelectorAll('span'));
  const row = gridData[cursorPosition.y];
  const charIndex = cursorPosition.x;

  highlightedWord.forEach(span => span.classList.remove('highlight-text'));
  highlightedWord = [];

  if (/^[A-Z]+$/.test(row[charIndex])) {
    let wordStart = charIndex;
    while (wordStart > 0 && /^[A-Z]+$/.test(row[wordStart - 1])) {
      wordStart--;
    }

    let wordEnd = charIndex;
    while (wordEnd < row.length && /^[A-Z]+$/.test(row[wordEnd + 1])) {
      wordEnd++;
    }

    for (let i = wordStart; i <= wordEnd; i++) {
      const span = allSpans[i];
      span.classList.add('highlight-text');
      highlightedWord.push(span);
    }
  } else if (isDelimiter(row, charIndex)) {
    const delimiter = row[charIndex];
    const matchingDelimiter = getMatchingDelimiter(delimiter);
    let contentStart = charIndex + 1;
    let contentEnd = row.indexOf(matchingDelimiter, contentStart);

    if (
      contentEnd !== -1 &&
      (contentEnd - contentStart) <= 8 &&
      !containsWord(row.slice(contentStart, contentEnd)) &&
      !interactedDelimiters.has(`${charIndex}-${contentEnd}`)
    ) {
      for (let i = charIndex; i <= contentEnd; i++) {
        const span = allSpans[i];
        span.classList.add('highlight-text');
        highlightedWord.push(span);
      }
    } else {
      const span = allSpans[charIndex];
      span.classList.add('highlight-text');
      highlightedWord.push(span);
    }
  } else {
    const span = allSpans[charIndex];
    span.classList.add('highlight-text');
    highlightedWord.push(span);
  }
}

function isDelimiter(row, index) {
  return delimiters.some(delimiter => {
    return delimiter[0] === row[index] && (index === 0 || row[index - 1] !== '\\');
  });
}

function getMatchingDelimiter(delimiter) {
  const delimiterPairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>',
    '"': '"'
  };
  return delimiterPairs[delimiter];
}

function containsWord(str) {
  return /\b[A-Z]+\b/.test(str);
}


function getMatchingDelimiter(delimiter) {
  const delimiterPairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>',
    '"': '"'
  };
  return delimiterPairs[delimiter];
}

function checkSelectedWord() {
  let gridElement, gridData, gridRows;

  if (currentGrid === 'grid2') {
    gridElement = document.getElementById('grid2');
    gridRows = gridElement.querySelectorAll('.grid-row');
    gridData = Array.from(gridRows).map(row => row.textContent);
  } else {
    gridElement = document.getElementById('grid4');
    gridRows = gridElement.querySelectorAll('.grid-row');
    gridData = Array.from(gridRows).map(row => row.textContent);
  }

  const rowText = gridData[cursorPosition.y];
  const charIndex = cursorPosition.x;

  if (isDelimiter(rowText, charIndex)) {
    const delimiter = rowText[charIndex];
    const matchingDelimiter = getMatchingDelimiter(delimiter);
    let contentStart = charIndex + 1;
    let contentEnd = rowText.indexOf(matchingDelimiter, contentStart);

    if (
      contentEnd !== -1 &&
      (contentEnd - contentStart) <= 8 &&
      !containsWord(rowText.slice(contentStart, contentEnd)) &&
      !interactedDelimiters.has(`${charIndex}-${contentEnd}`)
    ) {
      interactedDelimiters.add(`${charIndex}-${contentEnd}`);
      if (Math.random() < 0.5) {
        removeDudWord(gridElement);
        displayMessage('Dud removed');
      } else {
        resetAttempts();
        displayMessage('Tries reset');
      }
      return;
    }
  }

  const wordStart = rowText.lastIndexOf(' ', charIndex) + 1;
  let wordEnd = rowText.indexOf(' ', wordStart);

  if (wordEnd === -1) {
    wordEnd = rowText.length;
  }

  let word = rowText.slice(wordStart, wordEnd).trim();
  word = word.replace(/[^A-Z]/g, '');

  console.log(`Checking word: "${word}" against password: "${password}"`);

  if (word !== password) {
    attemptsRemaining--;
    document.querySelectorAll('.attempt-box')[attemptsRemaining].style.display = 'none';
    console.log(`Incorrect word. Attempts remaining: ${attemptsRemaining}`);

    if (attemptsRemaining === 0) {
      location.reload();
    }
  } else {
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.style.display = 'block';

    // Play the loading screen animation once, then redirect to "homescreen.html"
    setTimeout(() => {
      window.location.href = 'homescreen.html';
    }, 3000); // Adjust the timeout duration to match the length of your animation
  }

  const likeness = calculateLikeness(word, password);
  displayLikeness(word, likeness);
}



function removeDudWord(gridElement) {
  const allWords = Array.from(gridElement.querySelectorAll('.grid-row'))
    .flatMap(row => row.textContent.match(/\b[A-Z]+\b/g) || []);

  const dudWords = allWords.filter(word => word !== password);
  if (dudWords.length > 0) {
    const wordToReplace = dudWords[Math.floor(Math.random() * dudWords.length)];
    const rowElements = Array.from(gridElement.querySelectorAll('.grid-row'));

    rowElements.forEach(rowElement => {
      const rowText = rowElement.textContent;
      const updatedText = rowText.replace(wordToReplace, '.'.repeat(wordToReplace.length));
      if (rowText !== updatedText) {
        rowElement.innerHTML = updatedText
          .split('')
          .map((char, index) => `<span data-row="${rowElement.getAttribute('data-row')}" data-index="${index}">${char}</span>`)
          .join('');
      }
    });
  }
}

function resetAttempts() {
  attemptsRemaining = 4;
  document.querySelectorAll('.attempt-box').forEach(box => {
    box.style.display = 'block';
  });
  console.log(`Attempts have been reset. Attempts remaining: ${attemptsRemaining}`);
}

function displayLikeness(word, likeness) {
  const likenessContainer = document.getElementById('likeness-container');
  const maxMessages = 8; 


  const likenessMessage = document.createElement('div');
  likenessMessage.classList.add('likeness-message');
  likenessMessage.innerHTML = `&gt; ${word}<br>&gt; Likeness = ${likeness}`;
  likenessContainer.appendChild(likenessMessage);

  if (likenessContainer.children.length > maxMessages) {
    likenessContainer.removeChild(likenessContainer.firstChild);
  }
}

function displayMessage(message) {
  const likenessContainer = document.getElementById('likeness-container');
  const maxMessages = 8; 

  const messageElement = document.createElement('div');
  messageElement.classList.add('likeness-message');
  messageElement.innerHTML = `&gt; ${message}`;

  likenessContainer.appendChild(messageElement);

  if (likenessContainer.children.length > maxMessages) {
    likenessContainer.removeChild(likenessContainer.firstChild);
  }
}

function calculateLikeness(word, password) {
  let likeness = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === password[i]) {
      likeness++;
    }
  }
  return likeness;
}

function getWordEnd(row, startIndex) {
  while (startIndex < row.length && /\w/.test(row[startIndex])) {
    startIndex++;
  }
  return startIndex;
}


function containsWord(str) {
  return /\b[A-Z]+\b/.test(str);
}

  const likeness = calculateLikeness(word, password);
  displayLikeness(word, likeness);
  function displayMessage(message) {
    const likenessContainer = document.getElementById('likeness-container');
  
    const messageElement = document.createElement('div');
    messageElement.classList.add('likeness-message');
    messageElement.innerHTML = `&gt; ${message}`;
    likenessContainer.appendChild(messageElement);
  }
  
  function removeDudWord(gridElement) {
    const allWords = Array.from(gridElement.querySelectorAll('.grid-row'))
      .flatMap(row => row.textContent.match(/\b[A-Z]+\b/g) || []);
  
    const dudWords = allWords.filter(word => word !== password);
    if (dudWords.length > 0) {
      const wordToReplace = dudWords[Math.floor(Math.random() * dudWords.length)];
      const rowElements = Array.from(gridElement.querySelectorAll('.grid-row'));
  
      rowElements.forEach(rowElement => {
        const rowText = rowElement.textContent;
        const updatedText = rowText.replace(new RegExp(`\\b${wordToReplace}\\b`), '.'.repeat(wordToReplace.length));
        if (rowText !== updatedText) {
          rowElement.innerHTML = updatedText
            .split('')
            .map((char, index) => `<span data-row="${rowElement.getAttribute('data-row')}" data-index="${index}">${char}</span>`)
            .join('');
        }
      });
    }
  }
  
  function resetAttempts() {
    attemptsRemaining = 4;
    const attemptBoxes = document.querySelectorAll('.attempt-box');
    attemptBoxes.forEach(box => {
      box.style.display = 'inline-block';
      box.style.width = '20px';
      box.style.height = '20px';
      box.style.margin = '0 5px';
      box.style.backgroundColor = 'var(--bg-color)';
      box.style.border = '0';
      box.textContent = '▮';
    });
    console.log(`Attempts have been reset. Attempts remaining: ${attemptsRemaining}`);
  }  

  function displayLikeness(word, likeness) {
    const likenessContainer = document.getElementById('likeness-container');
    const maxMessages = 10;
  
    while (likenessContainer.children.length >= maxMessages) {
      likenessContainer.removeChild(likenessContainer.firstChild);
    }
  
    const likenessMessage = document.createElement('div');
    likenessMessage.classList.add('likeness-message');
    likenessMessage.innerHTML = `&gt; ${word}<br>&gt; Likeness = ${likeness}`;
    likenessContainer.appendChild(likenessMessage);
  }
  
function calculateLikeness(word, password) {
  let likeness = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === password[i]) {
      likeness++;
    }
  }
  return likeness;
}

function getWordEnd(row, startIndex) {
  while (startIndex < row.length && /\w/.test(row[startIndex])) {
    startIndex++;
  }
  return startIndex;
}

