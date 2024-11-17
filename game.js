class Battleship {
  constructor() {
    this.ships = [
      { name: "Carrier", length: 5 },
      { name: "Battleship", length: 4 },
      { name: "Cruiser", length: 3 },
      { name: "Submarine", length: 3 },
      { name: "Destroyer", length: 2 },
    ];

    this.playerBoard = Array(10)
      .fill()
      .map(() => Array(10).fill(null));
    this.computerBoard = Array(10)
      .fill()
      .map(() => Array(10).fill(null));
    this.computerShips = [];
    this.isGameStarted = false;
    this.currentShip = null;
    this.isHorizontal = true;

    this.initializeGame();
  }

  initializeGame() {
    this.createBoards();
    this.createShipsList();
    this.setupEventListeners();
    this.placeComputerShips();
  }

  createBoards() {
    const playerBoard = document.getElementById("player-board");
    const computerBoard = document.getElementById("computer-board");

    for (let i = 0; i < 100; i++) {
      const playerCell = document.createElement("div");
      const computerCell = document.createElement("div");

      playerCell.className = "cell";
      computerCell.className = "cell";

      playerCell.dataset.index = i;
      computerCell.dataset.index = i;

      playerBoard.appendChild(playerCell);
      computerBoard.appendChild(computerCell);
    }
  }

  createShipsList() {
    const shipsList = document.getElementById("ships-list");

    this.ships.forEach((ship) => {
      const shipElement = document.createElement("div");
      shipElement.className = "ship-item";
      shipElement.dataset.ship = ship.name;
      shipElement.dataset.length = ship.length;

      for (let i = 0; i < ship.length; i++) {
        const cell = document.createElement("div");
        cell.className = "ship-cell";
        shipElement.appendChild(cell);
      }

      shipsList.appendChild(shipElement);
    });
  }

  setupEventListeners() {
    const playerBoard = document.getElementById("player-board");
    const computerBoard = document.getElementById("computer-board");
    const rotateBtn = document.getElementById("rotate-btn");
    const startBtn = document.getElementById("start-game");
    const resetBtn = document.getElementById("reset-game");
    const shipsList = document.getElementById("ships-list");

    shipsList.addEventListener("click", (e) => {
      const shipItem = e.target.closest(".ship-item");
      if (shipItem) {
        this.selectShip(shipItem);
      }
    });

    playerBoard.addEventListener("click", (e) => {
      if (!this.isGameStarted && this.currentShip) {
        this.placeShip(e.target);
      }
    });

    computerBoard.addEventListener("click", (e) => {
      if (this.isGameStarted) {
        this.playerMove(e.target);
      }
    });

    rotateBtn.addEventListener("click", () => {
      this.isHorizontal = !this.isHorizontal;
    });

    startBtn.addEventListener("click", () => {
      this.startGame();
    });

    resetBtn.addEventListener("click", () => {
      location.reload();
    });
  }

  selectShip(shipItem) {
    if (this.isGameStarted) return;

    const shipName = shipItem.dataset.ship;
    const shipLength = parseInt(shipItem.dataset.length);

    this.currentShip = {
      name: shipName,
      length: shipLength,
    };
  }

  placeShip(cell) {
    if (!cell.classList.contains("cell")) return;

    const index = parseInt(cell.dataset.index);
    const row = Math.floor(index / 10);
    const col = index % 10;

    if (this.canPlaceShip(row, col)) {
      this.placePlayerShip(row, col);
      document.querySelector(`[data-ship="${this.currentShip.name}"]`).remove();
      this.currentShip = null;

      if (document.getElementById("ships-list").children.length === 0) {
        document.getElementById("start-game").disabled = false;
      }
    } else {
      alert("Ogiltig placering! Försök igen.");
    }
  }

  canPlaceShip(row, col) {
    const length = this.currentShip.length;

    if (this.isHorizontal) {
      if (col + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (this.playerBoard[row][col + i]) return false;
      }
    } else {
      if (row + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (this.playerBoard[row + i][col]) return false;
      }
    }

    return true;
  }

  placePlayerShip(row, col) {
    const length = this.currentShip.length;
    const cells = document.getElementById("player-board").children;

    if (this.isHorizontal) {
      for (let i = 0; i < length; i++) {
        this.playerBoard[row][col + i] = this.currentShip.name;
        cells[row * 10 + (col + i)].classList.add("ship");
      }
    } else {
      for (let i = 0; i < length; i++) {
        this.playerBoard[row + i][col] = this.currentShip.name;
        cells[(row + i) * 10 + col].classList.add("ship");
      }
    }
  }

  placeComputerShips() {
    this.ships.forEach((ship) => {
      let placed = false;
      while (!placed) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const isHorizontal = Math.random() < 0.5;

        if (this.canPlaceComputerShip(row, col, ship.length, isHorizontal)) {
          this.placeComputerShipOnBoard(row, col, ship, isHorizontal);
          placed = true;
        }
      }
    });
  }

  canPlaceComputerShip(row, col, length, isHorizontal) {
    if (isHorizontal) {
      if (col + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (this.computerBoard[row][col + i]) return false;
      }
    } else {
      if (row + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (this.computerBoard[row + i][col]) return false;
      }
    }
    return true;
  }

  placeComputerShipOnBoard(row, col, ship, isHorizontal) {
    if (isHorizontal) {
      for (let i = 0; i < ship.length; i++) {
        this.computerBoard[row][col + i] = ship.name;
      }
    } else {
      for (let i = 0; i < ship.length; i++) {
        this.computerBoard[row + i][col] = ship.name;
      }
    }

    this.computerShips.push({
      name: ship.name,
      positions: this.getShipPositions(row, col, ship.length, isHorizontal),
    });
  }

  getShipPositions(row, col, length, isHorizontal) {
    const positions = [];
    if (isHorizontal) {
      for (let i = 0; i < length; i++) {
        positions.push([row, col + i]);
      }
    } else {
      for (let i = 0; i < length; i++) {
        positions.push([row + i, col]);
      }
    }
    return positions;
  }

  startGame() {
    this.isGameStarted = true;
    document.getElementById("game-status").textContent =
      "Your turn! Fire at enemy waters!";
    document.getElementById("start-game").disabled = true;
    document.getElementById("rotate-btn").disabled = true;
  }

  playerMove(cell) {
    if (
      !cell.classList.contains("cell") ||
      cell.classList.contains("hit") ||
      cell.classList.contains("miss")
    )
      return;

    const index = parseInt(cell.dataset.index);
    const row = Math.floor(index / 10);
    const col = index % 10;

    if (this.computerBoard[row][col]) {
      cell.classList.add("hit");
      this.checkShipDestroyed(row, col);
    } else {
      cell.classList.add("miss");
    }

    setTimeout(() => this.computerMove(), 1000);
  }

  computerMove() {
    let row, col;
    do {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
    } while (this.isAttacked(row, col));

    const cell =
      document.getElementById("player-board").children[row * 10 + col];

    if (this.playerBoard[row][col]) {
      cell.classList.add("hit");
    } else {
      cell.classList.add("miss");
    }

    document.getElementById("game-status").textContent =
      "Your turn! Fire at enemy waters!";
  }

  isAttacked(row, col) {
    const cell =
      document.getElementById("player-board").children[row * 10 + col];
    return cell.classList.contains("hit") || cell.classList.contains("miss");
  }

  checkShipDestroyed(row, col) {
    const shipName = this.computerBoard[row][col];
    const ship = this.computerShips.find((s) => s.name === shipName);

    const isDestroyed = ship.positions.every(([r, c]) => {
      const cell =
        document.getElementById("computer-board").children[r * 10 + c];
      return cell.classList.contains("hit");
    });

    if (isDestroyed) {
      this.computerShips = this.computerShips.filter(
        (s) => s.name !== shipName
      );
      if (this.computerShips.length === 0) {
        this.endGame(true);
      }
    }
  }

  endGame(playerWon) {
    this.isGameStarted = false;
    const message = playerWon
      ? "Congratulations! You won!"
      : "Game Over! The computer won!";
    document.getElementById("game-status").textContent = message;
  }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Battleship();
});
