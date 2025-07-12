import React, { useState, useEffect, useCallback } from 'react';

const DIFFICULTY_LEVELS = {
  facile: {
    name: 'Facile',
    timeLimit: 30,
    operations: ['+', '-'],
    maxNumber: 20
  },
  moyen: {
    name: 'Moyen',
    timeLimit: 25,
    operations: ['+', '-', '*'],
    maxNumber: 50
  },
  difficile: {
    name: 'Difficile',
    timeLimit: 20,
    operations: ['+', '-', '*', '/'],
    maxNumber: 100
  }
};

function CalculMental({ onBack }) {
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('moyen');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS.moyen.timeLimit);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Charger le meilleur score depuis localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('calculMentalHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Sauvegarder le meilleur score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('calculMentalHighScore', score.toString());
    }
  }, [score, highScore]);

  // Timer pour le jeu
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Générer une nouvelle question
  const generateQuestion = useCallback(() => {
    const level = DIFFICULTY_LEVELS[difficulty];
    const operations = level.operations;
    const maxNum = level.maxNumber;
    
    let num1, num2, operation, answer;
    
    do {
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      operation = operations[Math.floor(Math.random() * operations.length)];
      
      switch (operation) {
        case '+':
          answer = num1 + num2;
          break;
        case '-':
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
          break;
        case '*':
          num1 = Math.floor(Math.random() * 12) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
          answer = num1 * num2;
          break;
        case '/':
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = Math.floor(Math.random() * 10) + 1;
          num1 = num2 * answer;
          break;
        default:
          answer = num1 + num2;
      }
    } while (answer < 0 || answer > 999);
    
    setCurrentQuestion({
      num1,
      num2,
      operation,
      answer
    });
    setUserAnswer('');
    setFeedback('');
  }, [difficulty]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setTimeLeft(DIFFICULTY_LEVELS[difficulty].timeLimit);
    generateQuestion();
  };

  const endGame = () => {
    setGameState('gameOver');
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const userAnswerNum = parseInt(userAnswer);
    const isCorrect = userAnswerNum === currentQuestion.answer;
    
    setQuestionsAnswered(prev => prev + 1);
    
    if (isCorrect) {
      const points = Math.max(1, Math.floor(timeLeft / 5)) + Math.floor(streak / 3);
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      setFeedback(`Correct ! +${points} points (Streak: ${streak + 1})`);
    } else {
      setStreak(0);
      setFeedback(`Incorrect. La réponse était ${currentQuestion.answer}`);
    }
    
    setTimeout(() => {
      generateQuestion();
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setTimeLeft(DIFFICULTY_LEVELS[difficulty].timeLimit);
    setUserAnswer('');
    setFeedback('');
    setStreak(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
  };

  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="button secondary" onClick={onBack}>
          ← Retour au menu
        </button>
        <h1 className="game-title">🧮 Calcul Mental</h1>
        <div style={{ width: '100px' }}></div>
      </div>

      {gameState === 'menu' && (
        <div>
          <p className="game-subtitle">Testez vos compétences en mathématiques !</p>
          <div className="difficulty-selector">
            {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
              <button
                key={key}
                className={`difficulty-button ${difficulty === key ? 'active' : ''}`}
                onClick={() => setDifficulty(key)}
              >
                {level.name}
              </button>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p><strong>Temps:</strong> {DIFFICULTY_LEVELS[difficulty].timeLimit} secondes</p>
            <p><strong>Opérations:</strong> {DIFFICULTY_LEVELS[difficulty].operations.join(', ')}</p>
            <p><strong>Nombres max:</strong> {DIFFICULTY_LEVELS[difficulty].maxNumber}</p>
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
              <div className={`stat-value ${timeLeft <= 10 ? 'timer' : ''}`}>
                {timeLeft}s
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Score</div>
              <div className="stat-value">{score}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Streak</div>
              <div className="stat-value">{streak}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Précision</div>
              <div className="stat-value">{accuracy}%</div>
            </div>
          </div>

          {currentQuestion && (
            <div className="question-container">
              <div className="question">
                {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2} = ?
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
          )}

          {feedback && (
            <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
              {feedback}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button className="button" onClick={checkAnswer}>
              Valider
            </button>
            <button className="button danger" onClick={endGame}>
              Arrêter
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="game-over">
          <h2>🎯 Partie terminée !</h2>
          <div className="final-score">{score}</div>
          <p>Meilleur score: {highScore}</p>
          <p>Précision: {accuracy}%</p>
          <p>Questions répondues: {questionsAnswered}</p>
          <p>Réponses correctes: {correctAnswers}</p>
          
          <div className="buttons-container">
            <button className="button" onClick={startGame}>
              Rejouer
            </button>
            <button className="button secondary" onClick={resetGame}>
              Menu principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalculMental; 