import React, { useState, useEffect } from 'react';

function SequenceMathematique({ onBack }) {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('moyen');
  const [currentSequence, setCurrentSequence] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(null);

  const difficulties = {
    facile: { timeLimit: 90, maxNumber: 50, operations: ['+', '-'] },
    moyen: { timeLimit: 60, maxNumber: 100, operations: ['+', '-', '*'] },
    difficile: { timeLimit: 45, maxNumber: 200, operations: ['+', '-', '*', '/'] }
  };

  const generateSequence = () => {
    const config = difficulties[difficulty];
    const sequenceLength = 4 + Math.floor(Math.random() * 3); // 4-6 nombres
    const sequence = [];
    
    // Choisir un type de séquence
    const sequenceTypes = [
      'arithmetic', // Suite arithmétique
      'geometric',  // Suite géométrique
      'fibonacci',  // Suite de Fibonacci
      'alternating', // Suite alternée
      'square',     // Suite des carrés
      'custom'      // Suite personnalisée
    ];
    
    const type = sequenceTypes[Math.floor(Math.random() * sequenceTypes.length)];
    
    switch (type) {
      case 'arithmetic':
        const start = Math.floor(Math.random() * 20) + 1;
        const diff = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push(start + i * diff);
        }
        break;
        
      case 'geometric':
        const first = Math.floor(Math.random() * 10) + 1;
        const ratio = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push(first * Math.pow(ratio, i));
        }
        break;
        
      case 'fibonacci':
        sequence.push(1, 1);
        for (let i = 2; i < sequenceLength; i++) {
          sequence.push(sequence[i-1] + sequence[i-2]);
        }
        break;
        
      case 'alternating':
        const base = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push(base + (i % 2 === 0 ? i : -i));
        }
        break;
        
      case 'square':
        const startSquare = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push(Math.pow(startSquare + i, 2));
        }
        break;
        
      case 'custom':
        // Séquence avec opération personnalisée
        const startCustom = Math.floor(Math.random() * 10) + 1;
        const operation = config.operations[Math.floor(Math.random() * config.operations.length)];
        const operand = Math.floor(Math.random() * 5) + 1;
        
        sequence.push(startCustom);
        for (let i = 1; i < sequenceLength; i++) {
          let next;
          switch (operation) {
            case '+':
              next = sequence[i-1] + operand;
              break;
            case '-':
              next = sequence[i-1] - operand;
              break;
            case '*':
              next = sequence[i-1] * operand;
              break;
            case '/':
              next = Math.floor(sequence[i-1] / operand);
              break;
            default:
              next = sequence[i-1] + operand;
          }
          sequence.push(next);
        }
        break;
    }
    
    // Calculer le prochain nombre
    const nextNumber = calculateNextNumber(sequence, type);
    setCorrectAnswer(nextNumber);
    
    // Masquer le dernier nombre
    const visibleSequence = sequence.slice(0, -1);
    setCurrentSequence(visibleSequence);
  };

  const calculateNextNumber = (sequence, type) => {
    switch (type) {
      case 'arithmetic':
        const diff = sequence[1] - sequence[0];
        return sequence[sequence.length - 1] + diff;
        
      case 'geometric':
        const ratio = sequence[1] / sequence[0];
        return sequence[sequence.length - 1] * ratio;
        
      case 'fibonacci':
        return sequence[sequence.length - 1] + sequence[sequence.length - 2];
        
      case 'alternating':
        const lastIndex = sequence.length - 1;
        const base = sequence[0];
        return base + (lastIndex % 2 === 0 ? lastIndex + 1 : -(lastIndex + 1));
        
      case 'square':
        const startSquare = Math.sqrt(sequence[0]);
        return Math.pow(startSquare + sequence.length, 2);
        
      case 'custom':
        // Déterminer l'opération et l'opérande
        const op1 = sequence[1] - sequence[0];
        const op2 = sequence[2] - sequence[1];
        if (op1 === op2) {
          return sequence[sequence.length - 1] + op1;
        } else {
          const div1 = sequence[1] / sequence[0];
          const div2 = sequence[2] / sequence[1];
          if (Math.abs(div1 - div2) < 0.1) {
            return sequence[sequence.length - 1] * div1;
          }
        }
        return sequence[sequence.length - 1] + (sequence[1] - sequence[0]);
        
      default:
        return sequence[sequence.length - 1] + (sequence[1] - sequence[0]);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(difficulties[difficulty].timeLimit);
    setLevel(1);
    generateSequence();
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === correctAnswer;
    
    if (isCorrect) {
      const points = Math.max(10, Math.floor(timeLeft / 5)) + level * 5;
      setScore(prev => prev + points);
      setLevel(prev => prev + 1);
      setFeedback(`Correct ! +${points} points`);
      
      setTimeout(() => {
        generateSequence();
        setUserAnswer('');
        setFeedback('');
      }, 1500);
    } else {
      setFeedback(`Incorrect. La réponse était ${correctAnswer}`);
      setTimeout(() => {
        setFeedback('');
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
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
        <h1 className="game-title">📊 Séquence Mathématique</h1>
        <div style={{ width: '100px' }}></div>
      </div>

      {gameState === 'menu' && (
        <div>
          <p className="game-subtitle">Complétez les suites logiques de nombres !</p>
          
          <div className="difficulty-selector">
            {Object.entries(difficulties).map(([key, config]) => (
              <button
                key={key}
                className={`difficulty-button ${difficulty === key ? 'active' : ''}`}
                onClick={() => setDifficulty(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p><strong>Temps:</strong> {difficulties[difficulty].timeLimit}s</p>
            <p><strong>Opérations:</strong> {difficulties[difficulty].operations.join(', ')}</p>
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
              <div className={`stat-value ${timeLeft <= 15 ? 'timer' : ''}`}>
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
          </div>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3>Niveau {level}</h3>
            <p>Quel est le prochain nombre de la séquence ?</p>
          </div>

          <div className="question-container">
            <div className="question" style={{ fontSize: '2rem', marginBottom: '20px' }}>
              {currentSequence.join(' → ')} → ?
            </div>
            <input
              type="number"
              className="answer-input"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Votre réponse..."
              autoFocus
            />
          </div>

          {feedback && (
            <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
              {feedback}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button className="button" onClick={checkAnswer}>
              Valider
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

export default SequenceMathematique; 