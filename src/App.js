import React, { useState, useEffect } from 'react'; 

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

const pieceNames = {
  'r': 'Rook', 'n': 'Knight', 'b': 'Bishop', 'q': 'Queen', 'k': 'King', 'p': 'Pawn',
  'R': 'Rook', 'N': 'Knight', 'B': 'Bishop', 'Q': 'Queen', 'K': 'King', 'P': 'Pawn'
};

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

// Function to convert board coordinates to chess notation
const getChessNotation = (row, col) => {
  const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  return `${files[col]}${8 - row}`;
};

// Function to speak messages
const speak = (message) => {
  const utterance = new SpeechSynthesisUtterance(message);
  window.speechSynthesis.speak(utterance);
};

// Basic move validation function including piece movement logic
const isValidMove = (fromRow, fromCol, toRow, toCol, selectedPiece, game) => {
  if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
    return false;
  }

  const targetPiece = game[toRow][toCol];
  const selectedPieceColor = selectedPiece === selectedPiece.toUpperCase() ? 'white' : 'black';
  const targetPieceColor = targetPiece === targetPiece.toUpperCase() ? 'white' : 'black';

  // Prevent capturing own piece
  if (targetPiece && selectedPieceColor === targetPieceColor) {
    return false;
  }

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  switch (selectedPiece.toLowerCase()) {
    case 'p':  // Pawn
      return isValidPawnMove(fromRow, fromCol, toRow, toCol, selectedPiece, targetPiece, game);
    case 'n':  // Knight
      return isValidKnightMove(rowDiff, colDiff);
    case 'b':  // Bishop
      return isValidBishopMove(fromRow, fromCol, toRow, toCol, game);
    case 'r':  // Rook
      return isValidRookMove(fromRow, fromCol, toRow, toCol, game);
    case 'q':  // Queen
      return isValidQueenMove(fromRow, fromCol, toRow, toCol, game);
    case 'k':  // King
      return isValidKingMove(rowDiff, colDiff);
    default:
      return false;
  }
};

// Pawn movement logic
const isValidPawnMove = (fromRow, fromCol, toRow, toCol, selectedPiece, targetPiece, game) => {
  const direction = selectedPiece === 'P' ? -1 : 1;  // White pawns move up (-1), Black pawns move down (1)
  
  // Move forward
  if (toCol === fromCol && !targetPiece) {
    if (toRow === fromRow + direction) {
      return true;  // Normal move
    }
    if (((selectedPiece === 'P' && fromRow === 6) || (selectedPiece === 'p' && fromRow === 1)) && toRow === fromRow + 2 * direction && !game[fromRow + direction][fromCol]) {
      return true;  // First double move
    }
  }

  // Capture diagonally
  if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && targetPiece) {
    return true;
  }

  return false;
};

// Knight movement logic
const isValidKnightMove = (rowDiff, colDiff) => {
  return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
};

// Bishop movement logic
const isValidBishopMove = (fromRow, fromCol, toRow, toCol, game) => {
  if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;  // Must move diagonally

  const rowDirection = toRow > fromRow ? 1 : -1;
  const colDirection = toCol > fromCol ? 1 : -1;
  let currentRow = fromRow + rowDirection;
  let currentCol = fromCol + colDirection;

  // Ensure the path is clear
  while (currentRow !== toRow && currentCol !== toCol) {
    if (game[currentRow][currentCol]) return false;  // Blocked by a piece
    currentRow += rowDirection;
    currentCol += colDirection;
  }

  return true;
};

// Rook movement logic
const isValidRookMove = (fromRow, fromCol, toRow, toCol, game) => {
  if (fromRow !== toRow && fromCol !== toCol) return false;  // Must move in a straight line

  const rowDirection = fromRow === toRow ? 0 : toRow > fromRow ? 1 : -1;
  const colDirection = fromCol === toCol ? 0 : toCol > fromCol ? 1 : -1;
  let currentRow = fromRow + rowDirection;
  let currentCol = fromCol + colDirection;

  // Ensure the path is clear
  while (currentRow !== toRow || currentCol !== toCol) {
    if (game[currentRow][currentCol]) return false;  // Blocked by a piece
    currentRow += rowDirection;
    currentCol += colDirection;
  }

  return true;
};

// Queen movement logic (combination of rook and bishop)
const isValidQueenMove = (fromRow, fromCol, toRow, toCol, game) => {
  return isValidRookMove(fromRow, fromCol, toRow, toCol, game) || isValidBishopMove(fromRow, fromCol, toRow, toCol, game);
};

// King movement logic
const isValidKingMove = (rowDiff, colDiff) => {
  return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;  // Moves one square in any direction
};

// Check and Checkmate detection
const isInCheck = (game, turn) => {
  let kingPosition = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = game[row][col];
      if ((turn === 'white' && piece === 'K') || (turn === 'black' && piece === 'k')) {
        kingPosition = [row, col];
        break;
      }
    }
    if (kingPosition) break;
  }

  const opponent = turn === 'white' ? 'black' : 'white';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = game[row][col];
      const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
      if (piece && pieceColor === opponent) {
        if (isValidMove(row, col, kingPosition[0], kingPosition[1], piece, game)) {
          return true;
        }
      }
    }
  }
  return false;
};

const isCheckmate = (game, turn) => {
  if (!isInCheck(game, turn)) {
    return false;
  }

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = game[row][col];
      const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
      if (piece && pieceColor === turn) {
        for (let newRow = 0; newRow < 8; newRow++) {
          for (let newCol = 0; newCol < 8; newCol++) {
            const newGame = game.map(r => r.slice());
            if (isValidMove(row, col, newRow, newCol, piece, game)) {
              newGame[newRow][newCol] = newGame[row][col];
              newGame[row][col] = '';
              if (!isInCheck(newGame, turn)) {
                return false;
              }
            }
          }
        }
      }
    }
  }

  return true;
};

// Main App component
function App() {
  const [game, setGame] = useState(initialGameState);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [tentativeMove, setTentativeMove] = useState(null);
  const [theme, setTheme] = useState('light');
  const [gameStarted, setGameStarted] = useState(false);
  const [turn, setTurn] = useState('white'); 
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [moves, setMoves] = useState(0); // Count of moves made
  const [capturedWhite, setCapturedWhite] = useState([]); // Captured white pieces
  const [capturedBlack, setCapturedBlack] = useState([]); // Captured black pieces

  const handleClick = (row, col) => {
    if (!gameStarted || tentativeMove) return;

    const piece = game[row][col];
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';

    if (selectedSquare === null && pieceColor !== turn) {
      return;
    }

    if (selectedSquare) {
      const newGame = game.map(row => row.slice());
      const [selectedRow, selectedCol] = selectedSquare;
      const selectedPiece = game[selectedRow][selectedCol];

      if (!isValidMove(selectedRow, selectedCol, row, col, selectedPiece, game)) {
        setSelectedSquare(null);  // Deselect if move is invalid
        return;
      }

      const capturedPiece = newGame[row][col]; // Capture logic
      if (capturedPiece) {
        if (capturedPiece === capturedPiece.toUpperCase()) {
          setCapturedWhite([...capturedWhite, capturedPiece]);
        } else {
          setCapturedBlack([...capturedBlack, capturedPiece]);
        }
      }

      const moveNotation = `${pieceNames[selectedPiece]} moves to ${getChessNotation(row, col)}`;
      speak(moveNotation); // Announce move
      
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

      const nextTurn = turn === 'white' ? 'black' : 'white';
      let message = '';

      if (isInCheck(newGame, nextTurn)) {
        if (isCheckmate(newGame, nextTurn)) {
          message = `Checkmate! ${turn.charAt(0).toUpperCase() + turn.slice(1)} wins!`;
          setGameStarted(false);  // End the game
          speak(message); // Announce checkmate
        } else {
          message = `Check! ${nextTurn.charAt(0).toUpperCase() + nextTurn.slice(1)} is in check.`;
          speak("Check"); // Announce check
        }
      } else {
        message = '';  // Clear the message when no check/checkmate occurs
      }

      setMoves(moves + 1); // Increment the moves counter
      setStatusMessage(message);
      setTurn(nextTurn);
      setTentativeMove(null);
    }
  };

  const handleRestart = () => {
    setGame(initialGameState);
    setSelectedSquare(null);
    setTentativeMove(null);
    setTurn('white');
    setGameStarted(false);
    setStatusMessage('');
    setMoves(0); // Reset moves count
    setCapturedWhite([]); // Reset captured pieces
    setCapturedBlack([]); // Reset captured pieces
  };

  const switchTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div style={containerStyle}>
      <h1>React Chess</h1>
      <h2>Current Turn: {turn.charAt(0).toUpperCase() + turn.slice(1)}</h2>
      {statusMessage && <div style={{ color: 'red', fontSize: '24px' }}>{statusMessage}</div>}
      <div style={{ marginBottom: '20px' }}>
        <div>Moves Made: {moves}</div>
        <div>Captured White Pieces: {capturedWhite.join(', ') || 'None'}</div>
        <div>Captured Black Pieces: {capturedBlack.join(', ') || 'None'}</div>
      </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Board game={game} onSquareClick={handleClick} selectedSquare={selectedSquare} theme={theme} />
          {/* Button controls placed below the board */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px', flexWrap: 'wrap' }}>
            <button style={buttonStyle} onClick={handleConfirmMove} disabled={!tentativeMove}>
              Confirm Move
            </button>
            <button style={buttonStyle} onClick={handleRestart}>Restart Game</button>
            <button style={buttonStyle} onClick={switchTheme}>
              {theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  textAlign: 'center',
  padding: '20px',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

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
    <div style={boardContainerStyle}>
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

const boardContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxWidth: '90vw',
  maxHeight: '90vh',
};

function Square({ value, onClick, isLight, isSelected, theme }) {
  const [squareSize, setSquareSize] = useState(80);

  // Adjust square size based on the screen size
  useEffect(() => {
    const updateSquareSize = () => {
      const newSquareSize = Math.min(window.innerWidth * 0.1, window.innerHeight * 0.1);
      setSquareSize(newSquareSize);
    };

    window.addEventListener('resize', updateSquareSize);
    updateSquareSize();

    return () => window.removeEventListener('resize', updateSquareSize);
  }, []);

  const squareStyle = {
    width: `${squareSize}px`,
    height: `${squareSize}px`,
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
      return <img src={pieceImages[value]} alt={value} style={{ width: `${squareSize - 10}px`, height: `${squareSize - 10}px` }} />;
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
