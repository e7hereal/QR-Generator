(async function() {
  const WORD_LENGTH = 5;
  const MAX_GUESSES = 6;

  let words = [];
  let targetWord = "";
  let guesses = [];
  let currentRow = 0;
  let currentCol = 0;
  let isGameOver = false;

  const board = document.getElementById("board");
  const keyboard = document.getElementById("keyboard");
  const messageContainer = document.getElementById("message");

  // Статистика
  const stats = {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
  };

  function saveStats() {
    localStorage.setItem("wordleStats", JSON.stringify(stats));
  }

  function loadStats() {
    const saved = localStorage.getItem("wordleStats");
    if(saved) {
      Object.assign(stats, JSON.parse(saved));
    }
  }

  function updateStatsUI() {
    document.getElementById("played").textContent = stats.played;
    document.getElementById("won").textContent = stats.won;
    document.getElementById("currentStreak").textContent = stats.currentStreak;
    document.getElementById("maxStreak").textContent = stats.maxStreak;
  }

  function resetGame() {
    guesses = Array(MAX_GUESSES).fill(null).map(() => Array(WORD_LENGTH).fill(""));
    currentRow = 0;
    currentCol = 0;
    isGameOver = false;
    messageContainer.textContent = "";
    board.innerHTML = "";
    createBoard();
    resetKeyboard();
  }

  function createBoard() {
    for(let r=0; r<MAX_GUESSES; r++) {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("row");
      for(let c=0; c<WORD_LENGTH; c++) {
        const tile = document.createElement("div");
        tile.id = `tile-${r}-${c}`;
        tile.classList.add("gridcell");
        rowDiv.appendChild(tile);
      }
      board.appendChild(rowDiv);
    }
  }

  // Клавиатура
  const keyboardRows = [
    ["й","ц","у","к","е","н","г","ш","щ","з"],
    ["х","ъ","ф","ы","в","а","п","р","о","л"],
    ["Enter","д","ж","э","я","ч","с","м","и","т","ь","б","ю","Backspace"]
  ];

  function setupKeyboard() {
    keyboard.innerHTML = "";
    keyboardRows.forEach(row => {
      const rowDiv = document.createElement("div");
      row.forEach(key => {
        const keyBtn = document.createElement("button");
        keyBtn.textContent = key === "Backspace" ? "⌫" : key === "Enter" ? "Enter" : key;
        keyBtn.setAttribute("data-key", key.toLowerCase());
        keyBtn.classList.add("key");
        if(key === "Enter" || key === "Backspace") keyBtn.classList.add("wide");
        keyBtn.addEventListener("click", () => handleKeyInput(key.toLowerCase()));
        rowDiv.appendChild(keyBtn);
      });
      keyboard.appendChild(rowDiv);
    });
  }

  function setMessage(msg, duration=2000) {
    messageContainer.textContent = msg;
    if(msg) {
      messageContainer.style.opacity = "1";
      setTimeout(() => { messageContainer.style.opacity = "0"; }, duration);
    }
  }

  function isLetter(char) {
    return /^[а-яё]$/i.test(char);
  }

  function addLetter(letter) {
    if(currentCol < WORD_LENGTH && !isGameOver) {
      guesses[currentRow][currentCol] = letter;
      updateTile(currentRow, currentCol, letter);
      currentCol++;
    }
  }

  function deleteLetter() {
    if(currentCol > 0 && !isGameOver) {
      currentCol--;
      guesses[currentRow][currentCol] = "";
      updateTile(currentRow, currentCol, "");
    }
  }

  function updateTile(row, col, letter) {
    const tile = document.getElementById(`tile-${row}-${col}`);
    if(tile) {
      tile.textContent = letter.toUpperCase();
      if(letter) tile.classList.add("filled");
      else tile.classList.remove("filled");
    }
  }

  async function submitGuess() {
    if(isGameOver) return;

    if(currentCol !== WORD_LENGTH) {
      shakeRow(currentRow);
      setMessage("Недостаточно букв");
      return;
    }

    const guess = guesses[currentRow].join("");
    if(!words.includes(guess)) {
      shakeRow(currentRow);
      setMessage("Нет такого слова");
      return;
    }

    await revealGuess(currentRow);

    if(guess === targetWord) {
      setMessage("Поздравляем! Вы угадали!", 4000);
      isGameOver = true;
      updateStats(true);
      return;
    }

    currentRow++;
    currentCol = 0;

    if(currentRow >= MAX_GUESSES) {
      setMessage(`Игра окончена! Слово было: ${targetWord.toUpperCase()}`, 6000);
      isGameOver = true;
      updateStats(false);
    }
  }

  function shakeRow(row) {
    const rowDiv = board.children[row];
    rowDiv.classList.add("shake");
    setTimeout(() => rowDiv.classList.remove("shake"), 600);
  }

  function revealGuess(row) {
    return new Promise(resolve => {
      const guess = guesses[row].join("");
      const rowTiles = board.children[row].children;
      const targetLetters = targetWord.split("");
      const guessLetters = guess.split("");

      const letterState = Array(WORD_LENGTH).fill("absent");
      const letterCount = {};

      targetLetters.forEach(l => letterCount[l] = (letterCount[l] || 0) + 1);

      for(let i=0; i<WORD_LENGTH; i++) {
        if(guessLetters[i] === targetLetters[i]) {
          letterState[i] = "correct";
          letterCount[guessLetters[i]]--;
        }
      }
      for(let i=0; i<WORD_LENGTH; i++) {
        if(letterState[i] === "correct") continue;
        if(letterCount[guessLetters[i]] > 0) {
          letterState[i] = "present";
          letterCount[guessLetters[i]]--;
        }
      }

      for(let i=0; i<WORD_LENGTH; i++) {
        setTimeout(() => {
          const tile = rowTiles[i];
          tile.classList.add("flip");
          setTimeout(() => {
            tile.classList.remove("flip");
            tile.classList.add(letterState[i]);
            updateKeyColor(guessLetters[i], letterState[i]);
            if(i === WORD_LENGTH - 1) resolve();
          }, 300);
        }, i * 300);
      }
    });
  }

  function updateKeyColor(letter, state) {
    letter = letter.toLowerCase();
    const keys = keyboard.querySelectorAll(`button[data-key="${letter}"]`);
    keys.forEach(key => {
      if(key.classList.contains("correct")) return;
      if(key.classList.contains("present") && state === "absent") return;

      key.classList.remove("correct", "present", "absent");
      key.classList.add(state);
    });
  }

  function updateStats(won) {
    stats.played++;
    if(won) {
      stats.won++;
      stats.currentStreak++;
      if(stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    } else {
      stats.currentStreak = 0;
    }
    saveStats();
    updateStatsUI();
  }

  async function loadWords() {
    try {
      const res = await fetch("words.json");
      words = await res.json();
    } catch(e) {
      console.error("Ошибка загрузки слов:", e);
      words = ["мирок","други","рыбак","город","река","солнц","птица","школа","звезда","лесок"];
    }
  }

  function resetKeyboard() {
    const keys = keyboard.querySelectorAll(".key");
    keys.forEach(k => k.classList.remove("correct","present","absent"));
  }

  function handleKeyInput(e) {
    if(isGameOver) return;

    if(e === "enter") {
      submitGuess();
    } else if(e === "backspace") {
      deleteLetter();
    } else if(isLetter(e)) {
      addLetter(e);
    }
  }

  function setupInputListeners() {
    document.addEventListener("keydown", e => {
      if(e.repeat) return;
      let key = e.key.toLowerCase();
      if(key === "backspace" || key === "enter" || isLetter(key)) {
        e.preventDefault();
        handleKeyInput(key);
      }
    });
  }

  function setupCloseButton() {
    const closeBtn = document.getElementById("close-btn");
    closeBtn.addEventListener("click", () => {
      window.parent.document.getElementById("wordle-container").style.display = "none";
    });
  }

  await loadWords();
  targetWord = words[Math.floor(Math.random() * words.length)];
  window._targetWord = targetWord; // <-- Добавь это
  loadStats();
  updateStatsUI();
  resetGame();
  setupKeyboard();
  setupInputListeners();
  setupCloseButton();

})();
