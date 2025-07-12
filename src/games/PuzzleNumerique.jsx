import React, { useState, useEffect } from 'react';

function PuzzleNumerique({ onBack }) {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('moyen');
  const [grid, setGrid] = useState([]);
  const [solution, setSolution] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [hints, setHints] = useState(3);
  const [level, setLevel] = useState(1);
  const [hintMessage, setHintMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const difficulties = {
    facile: { size: 3, timeLimit: 180, hints: 5 },
    moyen: { size: 4, timeLimit: 120, hints: 3 },
    difficile: { size: 5, timeLimit: 90, hints: 2 }
  };

  const generatePuzzle = () => {
    const size = difficulties[difficulty].size;
    const newGrid = [];
    const newSolution = [];

    // Générer une grille avec des opérations
    for (let i = 0; i < size; i++) {
      const row = [];
      const solRow = [];
      for (let j = 0; j < size; j++) {
        if (i === 0 && j === 0) {
          // Coin supérieur gauche - nombre de base
          const baseNum = Math.floor(Math.random() * 10) + 1;
          row.push(baseNum);
          solRow.push(baseNum);
        } else if (i === 0) {
          // Première ligne - multiplications
          const prevNum = row[j - 1];
          const multiplier = Math.floor(Math.random() * 5) + 1;
          const result = prevNum * multiplier;
          row.push(result);
          solRow.push(result);
        } else if (j === 0) {
          // Première colonne - additions
          const prevNum = newGrid[i - 1][0];
          const addend = Math.floor(Math.random() * 10) + 1;
          const result = prevNum + addend;
          row.push(result);
          solRow.push(result);
        } else {
          // Intersection - calcul basé sur les deux valeurs précédentes
          const leftNum = row[j - 1];
          const topNum = newGrid[i - 1][j];
          const operation = Math.random() > 0.5 ? '+' : '*';
          let result;
          if (operation === '+') {
            result = leftNum + topNum;
          } else {
            result = Math.floor((leftNum + topNum) / 2);
          }
          row.push(result);
          solRow.push(result);
        }
      }
      newGrid.push(row);
      newSolution.push([...solRow]);
    }

    // Créer la grille avec des cases vides
    const puzzleGrid = newGrid.map(row => 
      row.map((cell, index) => {
        // Garder quelques nombres visibles comme indices
        if (Math.random() < 0.3) {
          return { value: cell, visible: true, editable: false };
        } else {
          return { value: '', visible: false, editable: true };
        }
      })
    );

    setGrid(puzzleGrid);
    setSolution(newSolution);
    setUserGrid(puzzleGrid.map(row => row.map(cell => cell.value)));
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(difficulties[difficulty].timeLimit);
    setHints(difficulties[difficulty].hints);
    setLevel(1);
    generatePuzzle();
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    if (!grid[rowIndex][colIndex].editable) return;

    const newUserGrid = [...userGrid];
    newUserGrid[rowIndex][colIndex] = parseInt(value) || '';
    setUserGrid(newUserGrid);
  };

  const checkSolution = () => {
    let correct = 0;
    let total = 0;

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j].editable) {
          total++;
          if (userGrid[i][j] === solution[i][j]) {
            correct++;
          }
        }
      }
    }

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const points = Math.floor(accuracy * 10) + Math.floor(timeLeft / 10);

    if (accuracy === 100) {
      setScore(prev => prev + points);
      setLevel(prev => prev + 1);
      setTimeout(() => {
        generatePuzzle();
      }, 1000);
    } else {
      setErrorMessage("La grille n'est pas correcte. Corrigez les erreurs pour valider !");
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const useHint = () => {
    if (hints <= 0) return;

    // Trouver une case vide et révéler sa valeur
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j].editable && userGrid[i][j] === '') {
          const newUserGrid = [...userGrid];
          newUserGrid[i][j] = solution[i][j];
          setUserGrid(newUserGrid);
          setHints(prev => prev - 1);
          // Déterminer la logique de la case
          let message = '';
          if (i === 0 && j > 0) {
            message = `Indice : Sur la première ligne, chaque case est le résultat d'une multiplication avec la précédente.`;
          } else if (j === 0 && i > 0) {
            message = `Indice : Sur la première colonne, chaque case est le résultat d'une addition avec la précédente.`;
          } else if (i > 0 && j > 0) {
            message = `Indice : Cette case est calculée à partir de la case à gauche et celle au-dessus (somme ou moyenne).`;
          } else {
            message = `Indice : Case de départ.`;
          }
          setHintMessage(message);
          setTimeout(() => setHintMessage(''), 5000);
          return;
        }
      }
    }
  };

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('gameOver');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="button secondary" onClick={onBack}>
          ← Retour au menu
        </button>
        <h1 className="game-title">🧩 Puzzle Numérique</h1>
        <div style={{ width: '100px' }}></div>
      </div>

      {gameState === 'menu' && (
        <div>
          <p className="game-subtitle">Trouvez les nombres manquants en suivant les règles mathématiques !</p>
          
          <div className="difficulty-selector">
            {Object.entries(difficulties).map(([key, config]) => (
              <button
                key={key}
                className={`difficulty-button ${difficulty === key ? 'active' : ''}`}
                onClick={() => setDifficulty(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)} ({config.size}x{config.size})
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p><strong>Taille:</strong> {difficulties[difficulty].size}x{difficulties[difficulty].size}</p>
            <p><strong>Temps:</strong> {difficulties[difficulty].timeLimit}s</p>
            <p><strong>Indices:</strong> {difficulties[difficulty].hints}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="button" onClick={startGame}>
              Commencer le jeu
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-label">Temps</div>
              <div className={`stat-value ${timeLeft <= 30 ? 'timer' : ''}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Score</div>
              <div className="stat-value">{score}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Niveau</div>
              <div className="stat-value">{level}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Indices</div>
              <div className="stat-value">{hints}</div>
            </div>
          </div>

          {hintMessage && (
            <div className="feedback" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', marginBottom: 10 }}>
              {hintMessage}
            </div>
          )}
          {errorMessage && (
            <div className="feedback incorrect" style={{ marginBottom: 10 }}>
              {errorMessage}
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3>Niveau {level}</h3>
            <p>Complétez la grille en suivant les règles mathématiques</p>
          </div>

          <div className="puzzle-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${grid.length}, 1fr)`,
            gap: '10px',
            maxWidth: '400px',
            margin: '0 auto 20px'
          }}>
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <input
                  key={`${rowIndex}-${colIndex}`}
                  type="number"
                  className="puzzle-cell"
                  value={userGrid[rowIndex][colIndex] || ''}
                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                  disabled={!cell.editable}
                  style={{
                    width: '60px',
                    height: '60px',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    backgroundColor: cell.visible ? '#f0f4ff' : 'white',
                    color: cell.visible ? '#667eea' : '#333',
                    fontWeight: cell.visible ? 'bold' : 'normal'
                  }}
                />
              ))
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="button" onClick={checkSolution}>
              Vérifier
            </button>
            <button className="button secondary" onClick={useHint} disabled={hints <= 0}>
              Indice ({hints})
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="game-over">
          <h2>🎯 Partie terminée !</h2>
          <div className="final-score">{score}</div>
          <p>Niveau atteint: {level}</p>
          <p>Temps restant: {formatTime(timeLeft)}</p>
          
          <div className="buttons-container">
            <button className="button" onClick={startGame}>
              Rejouer
            </button>
            <button className="button secondary" onClick={() => setGameState('menu')}>
              Menu principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PuzzleNumerique; 