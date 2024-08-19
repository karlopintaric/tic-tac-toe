function Square() {
    let value = 0;

    const getValue = () => value;

    const addMark = (player) => {
        value = player;
    }

    return {
        addMark,
        getValue
    };
}

function GameBoard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    const createBoard = () => {
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < columns; j++) {
                board[i].push(Square())
            }
        }
    }

    const getBoard = () => board;

    const placeMark = (row, column, player) => {

        const valid = checkIfValid(row, column);
        if (!valid) return;

        board[row][column].addMark(player);
        return 1;
    }

    const printBoard = () => {
        const boardWithValues = board.map((row) =>
            row.map((cell) => cell.getValue()));
        console.table(boardWithValues);
    }

    const checkIfValid = (row, column) => {
        const isInRange = (row >= 0 && row < rows) && (column >= 0 && column < columns);

        if (isInRange && board[row][column].getValue() === 0) {
            return 1;
        }
    }

    createBoard();

    return {
        getBoard,
        placeMark,
        printBoard,
        createBoard
    };
}

function Player(name, mark) {
    this.name = name;
    this.mark = mark;
}

function GameController(
    playerOneName = 'Player One',
    playerTwoName = 'Player Two'
) {

    const board = GameBoard();
    
    const players = [
        new Player(playerOneName, 1),
        new Player(playerTwoName, 2)
    ];

    let activePlayer = players[0];
    let gameStatus = 'active';

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const playRound = (row, column) => {
        
        // Check if move is valid
        if (!board.placeMark(row, column, getActivePlayer().mark)) return;

        console.log(`Placing ${getActivePlayer().name} mark on into row ${row}, column ${column}`);

        if (checkWinner()) {
            gameStatus = 'win';
            printWinner()
            return;
        }

        if (checkTie()) {
            gameStatus = 'tie';
            printTie();
            return;
        }

        switchPlayerTurn();
        printNewRound();
    };

    const checkWinner = () => {
        const boardWithPlayerMarks = board.getBoard().map((row) =>
            row.map((cell) => cell.getValue() === activePlayer.mark));

        const playerMarksInColumns = [];
        const playerMarksInDiagonals = [[], []];

        // Loop through all cells
        for (let i = 0; i < boardWithPlayerMarks.length; i++) {
            let row = boardWithPlayerMarks[i]

            // Check rows if winner
            if (row.every(x => x === true)) return 1;
            
            // Create array to store columns
            playerMarksInColumns[i] = [];

            // Loop over columns
            for (let j = 0; j < row.length; j++) {
                // Push column values to new array
                playerMarksInColumns[i].push(boardWithPlayerMarks[j][i]);

                // Push values to array if left-to-right diagonal
                if (i === j) {
                    playerMarksInDiagonals[0].push(boardWithPlayerMarks[i][j]);
                }

                // Push values to array if right-to-left diagonal
                if (i === (row.length - 1 - j)) {
                    playerMarksInDiagonals[1].push(boardWithPlayerMarks[i][j])
                }
            }
        }

        const allTrue = arr => arr.every(x => x === true);

        // Check columns if winner
        if (playerMarksInColumns.some(allTrue)) {
            return 1;
        }

        // Check diagonals if winner
        if (playerMarksInDiagonals.some(allTrue)) {
            return 1;
        }

    }

    const checkTie = () => {
        const boardValues = board.getBoard().flat().map(cell => cell.getValue());

        if (boardValues.every(x => x !== 0)) return 1;
    }

    const printWinner = () => {
        console.log(`Congratulations! ${activePlayer.name} is the winner!`)
    }

    const printTie = () => {
        console.log('Game End! It\'s a tie!');
    }

    const getGameStatus = () => gameStatus;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${activePlayer.name}'s turn`);
    };

    const resetGame = () => {
        board.createBoard();
        activePlayer = players[0];
        gameStatus = 'active';

        printNewRound()
    }

    printNewRound();

    return {
        getActivePlayer,
        playRound,
        resetGame,
        getGameStatus,
        getBoard: board.getBoard
    };
}

(function ScreenController() {
    let game;

    const boardDiv = document.querySelector('.board');
    const playerTurnDiv = document.querySelector('.turn');
    const resultDialog = document.querySelector('dialog');
    const resultText = resultDialog.querySelector('p');
    const resetButton = resultDialog.querySelector('#reset');
    const startButton = document.querySelector('#start');

    const render = () => {
        // Reset board display
        boardDiv.textContent = '';
        
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        // Display board
        board.forEach((row, rowId) => {
            row.forEach((cell, colId) => {
                const squareButton = document.createElement('button');
                squareButton.classList.add('square');

                squareButton.dataset.row = rowId;
                squareButton.dataset.column = colId;

                // Display square value
                let squareDisplayMark;
                switch (cell.getValue()) {
                    case 1:
                        squareDisplayMark = 'X';
                        break;
                    case 2:
                        squareDisplayMark = 'O';
                        break;
                    default:
                        squareDisplayMark = '';
                }

                squareButton.textContent = squareDisplayMark;
                boardDiv.appendChild(squareButton);
            })
        });

        // Display active player name
        playerTurnDiv.textContent = `${activePlayer.name}'s turn`;

        // Check if game ended and display result
        if (checkIfGameEnded()) {
            displayResult();
        }

    }

    const boardClickHandler = (e) => {
        if (checkIfGameEnded()) {
            return;
        }

        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;

        if (!selectedRow || !selectedColumn) return;

        game.playRound(selectedRow, selectedColumn);
        render();
    }

    const checkIfGameEnded = () => {
        if (game.getGameStatus() !== 'active') return true;
    }

    const displayResult = () => {
        resultDialog.showModal();

        if (game.getGameStatus() === 'win') {
            resultText.textContent = `Congratulations! ${game.getActivePlayer().name} is the winner!`
        } else {
            resultText.textContent = 'Game End! It\'s a tie!'
        }
    }

    const resetGame = () => {
        resultDialog.close();
        game.resetGame();
        render();
    }

    const startGame = (e) => {
        const playerOneNameInput = document.querySelector('#player-one-name');
        const playerTwoNameInput = document.querySelector('#player-two-name');

        game = GameController(playerOneNameInput.value, playerTwoNameInput.value);
        render();

        boardDiv.addEventListener('click', boardClickHandler);
        resetButton.addEventListener('click', resetGame);

        e.target.remove()
        playerOneNameInput.disabled = true;
        playerTwoNameInput.disabled = true;
    }

    startButton.addEventListener('click', startGame);

})();
