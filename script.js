let score = 0;

function updateScore(change) {
  score += change;
  document.getElementById('score').textContent = score;
}


function generateRandomSudokuBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(""));

  const shouldFill = () => Math.random() < 0.2;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (shouldFill()) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (let num of numbers) {
          if (isValidPlacement(board, row, col, num)) {
            board[row][col] = num;
            break;
          }
        }
      }
    }
  }

  let html = '<table>';
  for (let row = 0; row < 9; row++) {
    html += '<tr>';
    for (let col = 0; col < 9; col++) {
      const value = board[row][col] || '';
      const editable = value === '' ? 'class="editable"' : '';
      const borders = getCellBorders(row, col);
      html += `<td ${editable} style="${borders}">${value}</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

function solveBoard(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!board[r][c]) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            if (solveBoard(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}



function isValidPlacement(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function isBoardCompleteAndValid() {
  const table = document.querySelector('#sudoku-board table');
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = table.rows[r].cells[c];
      const value = parseInt(cell.textContent);
      if (!value || !isValidPlacement(getBoardArray(), r, c, value)) {
        return false;
      }
    }
  }
  return true;
}


function getBoardArray() {
  const arr = Array.from({ length: 9 }, () => Array(9).fill(0));
  const table = document.querySelector('#sudoku-board table');
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = table.rows[r].cells[c].textContent.trim();
      arr[r][c] = val ? parseInt(val) : 0;
    }
  }
  return arr;
}

function fillBoardFromArray(arr) {
  const table = document.querySelector('#sudoku-board table');
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      table.rows[r].cells[c].textContent = arr[r][c] || '';
    }
  }
}


function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCellBorders(row, col) {
  const top = row % 3 === 0 ? "border-top: 2px solid black;" : "";
  const left = col % 3 === 0 ? "border-left: 2px solid black;" : "";
  const right = col === 8 ? "border-right: 2px solid black;" : "";
  const bottom = row === 8 ? "border-bottom: 2px solid black;" : "";
  return `${top} ${left} ${right} ${bottom}`;
}



let selectedCell = null;


function enableCellSelection() {
  const editableCells = document.querySelectorAll('.editable');
  editableCells.forEach(cell => {
    cell.addEventListener('click', () => {
      if (selectedCell) {
        selectedCell.classList.remove('selected');
      }
      selectedCell = cell;
      selectedCell.classList.add('selected');
    });
  });
}

document.getElementById('leaderboard-toggle').addEventListener('click', () => {
  document.getElementById('leaderboard-list').classList.toggle('hidden');
});

function enableNumberSelection() {
  const numbers = document.querySelectorAll('#nos .number');
  numbers.forEach(number => {
    number.addEventListener('click', () => {
      if (selectedCell) {
        const row = selectedCell.parentElement.rowIndex;
        const col = selectedCell.cellIndex;
        const value = number.textContent;
        const table = document.querySelector('#sudoku-board table');


        const isValid = checkValidMove(table, row, col, value);

        if (isValid) {
          selectedCell.textContent = value;
          selectedCell.classList.remove('error');

          updateScore(10); // ✅ correct move = +10

          setTimeout(() => {
            if (isBoardCompleteAndValid()) {
              document.getElementById('win-message').classList.remove('hidden');
              updateScore(100);
              clearInterval(timerInterval);
              const name = document.getElementById('player-output').textContent || "Unknown";
              const time = document.getElementById('timer').textContent.replace("Time: ", "");
              const entry = { name, time, score };

              let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
              leaderboard.push(entry);
              leaderboard.sort((a, b) => b.score - a.score); // Highest score first
              leaderboard = leaderboard.slice(0, 10); // top 10
              localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
              ;

            }
          }, 2000);

        } else {
          selectedCell.classList.add('error');
          updateScore(-5);

          const errorMsg = document.getElementById('error-message');
          errorMsg.classList.remove('hidden');

          setTimeout(() => {
            selectedCell.classList.remove('error');
            selectedCell.classList.remove('selected');
            errorMsg.classList.add('hidden');
          }, 2000);
        }


      }
    }
    );
  });
}

function loadLeaderboard() {
  const list = JSON.parse(localStorage.getItem('leaderboard')) || [];
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = "";
  list.forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${entry.name}</td><td>${entry.time}</td><td>${entry.score}</td>`;
    tbody.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", loadLeaderboard);

function checkValidMove(table, row, col, value) {

  for (let c = 0; c < 9; c++) {
    if (c !== col && table.rows[row].cells[c].textContent === value) {
      return false;
    }
  }

  for (let r = 0; r < 9; r++) {
    if (r !== row && table.rows[r].cells[col].textContent === value) {
      return false;
    }
  }


  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;

  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      if ((r !== row || c !== col) &&
        table.rows[r].cells[c].textContent === value) {
        return false;
      }
    }
  }

  return true;
}

let timerInterval;
let seconds = 0;

clearInterval(timerInterval);


function startTimer() {
  const timer = document.getElementById('timer');
  if (timer) timer.classList.remove('hidden');

  seconds = 0;
  timer.textContent = "Time: 00:00";

  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timer.textContent = `Time: ${mins}:${secs}`;
  }, 1000);
}

function showSudoku() {
  const boardContainer = document.getElementById('sudoku-board');
  const playButton = document.getElementById('playBtn');
  const playText = document.getElementById('Play');
  const Numbers = document.getElementById('nos');
  const controlButtons = document.getElementById('control-buttons');
  const scorecard = document.getElementById('scorecard');

  boardContainer.innerHTML = generateRandomSudokuBoard();
  boardContainer.classList.add('show');

  if (playButton) playButton.style.display = "none";
  if (playText) playText.classList.add("hidden");
  if (welcomeText) welcomeText.classList.add("hidden");
  if (Numbers) Numbers.classList.remove("hidden");
  if (controlButtons) controlButtons.classList.remove("nos-hidden");
  if (scorecard) scorecard.classList.remove("hidden");


  enableCellSelection();
  enableNumberSelection();
  startTimer();

}

document.getElementById('home').addEventListener('click', () => {
  location.reload();
});



document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("playBtn");
  if (playButton) {
    playButton.addEventListener("click", showSudoku);
  }
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {

      showSudoku();
    })

    if (showSolutionBtn) {
      showSolutionBtn.addEventListener("click", () => {

      })
    }
  }
});

const showBtn = document.getElementById('showSolutionBtn');
if (showBtn) {
  showBtn.addEventListener('click', () => {
    const boardArr = getBoardArray();
    if (solveBoard(boardArr)) {
      fillBoardFromArray(boardArr);
    } else {
      alert("No solution found!");
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("player-name");
  const nameDisplay = document.getElementById("player-display");
  const nameOutput = document.getElementById("player-output");

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const name = nameInput.value.trim();
      if (name) {
        nameOutput.textContent = name;
        nameDisplay.classList.remove("hidden");
        nameInput.style.display = "none";
      }
    }
  });
});


document.getElementById("newGameBtn").addEventListener("click", () => {

  const playerNameInput = document.getElementById("player-name");
  const playerDisplay = document.getElementById("player-display");

  playerNameInput.value = "";
  playerNameInput.style.display = "inline-block";
  playerDisplay.classList.add("hidden");

  score = 0;
  document.getElementById("score").textContent = score;


});


