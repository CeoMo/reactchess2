import React, { useState } from 'react';

const initialGameState = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const pieceImages = {
  'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg'
};

// Basic move validation function
const isValidMove = (fromRow, fromCol, toRow, toCol, selectedPiece, game) => {
  // Ensure the destination is within bounds of the board
  if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
    return false;
  }

  const targetPiece = game[toRow][toCol];
  const selectedPieceColor = selectedPiece === selectedPiece.toUpperCase() ? 'white' : 'black';
  const targetPieceColor = targetPiece === targetPiece.toUpperCase() ? 'white' : 'black';

  // If the destination contains a piece of the same color, it's not valid
  if (targetPiece && selectedPieceColor === targetPieceColor) {
    return false;
  }

  // You can add specific rules for each piece type here
  // For now, it simply allows moving to empty squares or capturing opponent pieces
  return true;
};

// Main App component
function App() {
  const [game, setGame] = useState(initialGameState);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [tentativeMove, setTentativeMove] = useState(null);
  const [theme, setTheme] = useState('light');
  const [gameStarted, setGameStarted] = useState(false);
  const [turn, setTurn] = useState('white'); // Track whose turn it is
  const [isBotEnabled, setIsBotEnabled] = useState(false);

  const handleClick = (row, col) => {
    if (!gameStarted) return;
    if (tentativeMove) return;

    const piece = game[row][col];
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black'; // Uppercase pieces are white

    if (selectedSquare === null && pieceColor !== turn) {
      return; // Can't select opponent's piece
    }

    if (selectedSquare) {
      const newGame = game.map(row => row.slice());
      const [selectedRow, selectedCol] = selectedSquare;
      const selectedPiece = game[selectedRow][selectedCol];

      // Check if the move is valid for the selected piece
      if (!isValidMove(selectedRow, selectedCol, row, col, selectedPiece, game)) {
        return;
      }

      newGame[row][col] = newGame[selectedRow][selectedCol];
      newGame[selectedRow][selectedCol] = '';
      setTentativeMove({ from: selectedSquare, to: [row, col], newGame });
    } else {
      if (game[row][col]) {
        setSelectedSquare([row, col]);
      }
    }
  };

  const handleConfirmMove = () => {
    if (tentativeMove) {
      const newGame = tentativeMove.newGame;
      setGame(newGame);
      setSelectedSquare(null);
      setTurn(turn === 'white' ? 'black' : 'white');
      setTentativeMove(null);
    }
  };

  const handleRestart = () => {
    setGame(initialGameState);
    setSelectedSquare(null);
    setTentativeMove(null);
    setTurn('white'); // Reset to white's turn
    setGameStarted(false);
  };

  const switchTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>React Chess</h1>
      <h2>Current Turn: {turn.charAt(0).toUpperCase() + turn.slice(1)}</h2> {/* Show whose turn it is */}
      {!gameStarted && (
        <div>
          <button style={startButtonStyle} onClick={() => setGameStarted(true)}>Start Game</button>
          <div style={{ marginTop: '20px', fontSize: '18px' }}>
            <h3>Simple Chess Instructions</h3>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>The game is played between two players, one controlling the white pieces and the other controlling black.</li>
              <li>The goal is to checkmate your opponent's king.</li>
              <li>Each type of piece moves in a specific pattern:</li>
              <ul>
                <li><strong>King:</strong> Moves one square in any direction.</li>
                <li><strong>Queen:</strong> Moves any number of squares in any direction (horizontally, vertically, or diagonally).</li>
                <li><strong>Rook:</strong> Moves any number of squares along rows or columns.</li>
                <li><strong>Bishop:</strong> Moves any number of squares diagonally.</li>
                <li><strong>Knight:</strong> Moves in an "L" shape (two squares in one direction, one square perpendicular).</li>
                <li><strong>Pawn:</strong> Moves forward one square but captures diagonally. On their first move, they can move two squares.</li>
              </ul>
            </ul>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>
              <input type="checkbox" checked={isBotEnabled} onChange={() => setIsBotEnabled(!isBotEnabled)} />
              Play against bot
            </label>
          </div>
        </div>
      )}
      {gameStarted && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Board game={game} onSquareClick={handleClick} selectedSquare={selectedSquare} theme={theme} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '20px' }}>
            <button style={buttonStyle} onClick={switchTheme}>
              {theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            </button>
            <button style={buttonStyle} onClick={handleRestart}>Restart Game</button>
            <button style={buttonStyle} onClick={handleConfirmMove} disabled={!tentativeMove}>
              Confirm Move
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const startButtonStyle = {
  padding: '15px 30px',
  fontSize: '20px',
  cursor: 'pointer',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  marginTop: '20px',
};

const buttonStyle = {
  padding: '15px 25px',
  fontSize: '16px',
  margin: '10px',
  cursor: 'pointer',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  transition: 'background-color 0.3s',
};

function Board({ game, onSquareClick, selectedSquare, theme }) {
  return (
    <div>
      {game.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((value, colIndex) => (
            <Square
              key={colIndex}
              value={value}
              onClick={() => onSquareClick(rowIndex, colIndex)}
              isLight={(rowIndex + colIndex) % 2 === 0}
              isSelected={selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex}
              theme={theme}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Square({ value, onClick, isLight, isSelected, theme }) {
  const squareStyle = {
    width: '80px',
    height: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: isSelected
      ? '#ffeb3b'
      : isLight
      ? theme === 'light'
        ? '#f0d9b5'
        : '#333'
      : theme === 'light'
      ? '#b58863'
      : '#555',
    border: '1px solid #999'
  };

  const pieceDisplay = () => {
    if (value) {
      return <img src={pieceImages[value]} alt={value} style={{ width: '70px', height: '70px' }} />;
    }
    return null;
  };

  return (
    <button style={squareStyle} onClick={onClick}>
      {pieceDisplay()}
    </button>
  );
}

export default App;
