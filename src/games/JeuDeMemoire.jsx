import React, { useState, useEffect } from 'react';

function JeuDeMemoire({ onBack }) {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('facile');
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [level, setLevel] = useState(1);

  const difficulties = {
    facile: { pairs: 6, timeLimit: 180, maxNumber: 20 },
    moyen: { pairs: 8, timeLimit: 120, maxNumber: 50 },
    difficile: { pairs: 10, timeLimit: 90, maxNumber: 100 }
  };

  const generateCards = () => {
    const config = difficulties[difficulty];
    const pairs = config.pairs;
    const cardPairs = [];

    // Générer des paires de calculs et résultats
    for (let i = 0; i < pairs; i++) {
      const num1 = Math.floor(Math.random() * config.maxNumber) + 1;
      const num2 = Math.floor(Math.random() * config.maxNumber) + 1;
      const operations = ['+', '-', '*'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      
      let result;
      switch (operation) {
        case '+':
          result = num1 + num2;
          break;
        case '-':
          result = Math.max(num1, num2) - Math.min(num1, num2);
          break;
        case '*':
          result = num1 * num2;
          break;
        default:
          result = num1 + num2;
      }

      const calculation = `${num1} ${operation} ${num2}`;
      
      cardPairs.push(
        { id: i * 2, type: 'calculation', value: calculation, pairId: i },
        { id: i * 2 + 1, type: 'result', value: result.toString(), pairId: i }
      );
    }

    // Mélanger les cartes
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setMoves(0);
    setTimeLeft(difficulties[difficulty].timeLimit);
    setLevel(1);
    generateCards();
  };

  const flipCard = (cardId) => {
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;
    if (matchedPairs.includes(cardId)) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const card1 = cards.find(card => card.id === newFlippedCards[0]);
      const card2 = cards.find(card => card.id === newFlippedCards[1]);

      if (card1.pairId === card2.pairId) {
        // Match trouvé
        setMatchedPairs(prev => [...prev, card1.id, card2.id]);
        setScore(prev => prev + 10 + Math.floor(timeLeft / 10));
        setTimeout(() => {
          setFlippedCards([]); // Correction : vider flippedCards après un match
          if (matchedPairs.length + 2 === cards.length) {
            // Niveau complété
            setLevel(prev => prev + 1);
            setTimeout(() => {
              generateCards();
            }, 1000);
          }
        }, 500);
      } else {
        // Pas de match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
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

  const getCardDisplay = (card) => {
    const isFlipped = flippedCards.includes(card.id);
    const isMatched = matchedPairs.includes(card.id);
    
    if (isMatched) {
      return card.value;
    } else if (isFlipped) {
      return card.value;
    } else {
      return '?';
    }
  };

  const getCardStyle = (card) => {
    const isFlipped = flippedCards.includes(card.id);
    const isMatched = matchedPairs.includes(card.id);
    
    if (isMatched) {
      return {
        backgroundColor: '#48bb78',
        color: 'white',
        transform: 'scale(0.95)'
      };
    } else if (isFlipped) {
      return {
        backgroundColor: '#667eea',
        color: 'white'
      };
    } else {
      return {
        backgroundColor: '#e2e8f0',
        color: '#4a5568'
      };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="button secondary" onClick={onBack}>
          ← Retour au menu
        </button>
        <h1 className="game-title">🎯 Mémoire Mathématique</h1>
        <div style={{ width: '100px' }}></div>
      </div>

      {gameState === 'menu' && (
        <div>
          <p className="game-subtitle">Retrouvez les paires de calculs et résultats !</p>
          
          <div className="difficulty-selector">
            {Object.entries(difficulties).map(([key, config]) => (
              <button
                key={key}
                className={`difficulty-button ${difficulty === key ? 'active' : ''}`}
                onClick={() => setDifficulty(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)} ({config.pairs} paires)
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p><strong>Paires:</strong> {difficulties[difficulty].pairs}</p>
            <p><strong>Temps:</strong> {difficulties[difficulty].timeLimit}s</p>
            <p><strong>Nombres max:</strong> {difficulties[difficulty].maxNumber}</p>
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
              <div className="stat-label">Coups</div>
              <div className="stat-value">{moves}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3>Niveau {level}</h3>
            <p>Trouvez toutes les paires de calculs et résultats</p>
          </div>

          <div className="memory-grid" style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(cards.length))}, 1fr)`,
            gap: '10px',
            maxWidth: '600px',
            margin: '0 auto 20px'
          }}>
            {cards.map((card) => (
              <button
                key={card.id}
                className="memory-card"
                onClick={() => flipCard(card.id)}
                style={{
                  width: '80px',
                  height: '80px',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ...getCardStyle(card)
                }}
              >
                {getCardDisplay(card)}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p>Paires trouvées: {matchedPairs.length / 2} / {cards.length / 2}</p>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="game-over">
          <h2>🎯 Partie terminée !</h2>
          <div className="final-score">{score}</div>
          <p>Niveau atteint: {level}</p>
          <p>Coups joués: {moves}</p>
          <p>Temps restant: {formatTime(timeLeft)}</p>
          <p>Paires trouvées: {matchedPairs.length / 2} / {cards.length / 2}</p>
          
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

export default JeuDeMemoire; 