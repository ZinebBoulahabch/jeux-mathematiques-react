import React, { useState } from 'react';
import CalculMental from './games/CalculMental';
import PuzzleNumerique from './games/PuzzleNumerique';
import SequenceMathematique from './games/SequenceMathematique';
import JeuDeMemoire from './games/JeuDeMemoire';

function App() {
  const [currentGame, setCurrentGame] = useState('menu');

  const games = [
    {
      id: 'calcul-mental',
      name: '🧮 Calcul Mental',
      description: 'Résolvez des calculs rapidement avec un timer',
      difficulty: 'Facile à Difficile',
      icon: '🧮'
    },
    {
      id: 'puzzle-numerique',
      name: '🧩 Puzzle Numérique',
      description: 'Trouvez les nombres manquants dans les grilles',
      difficulty: 'Moyen',
      icon: '🧩'
    },
    {
      id: 'sequence-math',
      name: '📊 Séquence Mathématique',
      description: 'Complétez les suites logiques de nombres',
      difficulty: 'Moyen à Difficile',
      icon: '📊'
    },
    {
      id: 'memoire-math',
      name: '🎯 Mémoire Mathématique',
      description: 'Retrouvez les paires de calculs et résultats',
      difficulty: 'Facile à Moyen',
      icon: '🎯'
    }
  ];

  const renderGame = () => {
    switch (currentGame) {
      case 'calcul-mental':
        return <CalculMental onBack={() => setCurrentGame('menu')} />;
      case 'puzzle-numerique':
        return <PuzzleNumerique onBack={() => setCurrentGame('menu')} />;
      case 'sequence-math':
        return <SequenceMathematique onBack={() => setCurrentGame('menu')} />;
      case 'memoire-math':
        return <JeuDeMemoire onBack={() => setCurrentGame('menu')} />;
      default:
        return (
          <div className="menu-container">
            <h1 className="game-title">🎮 Jeux de Mathématiques</h1>
            <p className="game-subtitle">Choisissez votre jeu préféré pour améliorer vos compétences !</p>
            
            <div className="games-grid">
              {games.map((game) => (
                <div key={game.id} className="game-card-menu" onClick={() => setCurrentGame(game.id)}>
                  <div className="game-icon">{game.icon}</div>
                  <h3 className="game-name">{game.name}</h3>
                  <p className="game-description">{game.description}</p>
                  <div className="game-difficulty">{game.difficulty}</div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container">
      <div className="game-card">
        {renderGame()}
      </div>
    </div>
  );
}

export default App; 