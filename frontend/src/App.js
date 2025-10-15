import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'comparison'
  const [comparisonData, setComparisonData] = useState(null); // backend comparison response
  const [comparisonError, setComparisonError] = useState(null);

  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  const handleHeroSelection = (hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        // Remove if already selected
        return prev.filter(h => h.id !== hero.id);
      } else if (prev.length < 2) {
        // Add if less than 2 selected
        return [...prev, hero];
      } else {
        // Replace first selection if 2 already selected
        return [prev[1], hero];
      }
    });
  };

  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      const [h1, h2] = selectedHeroes;
      setComparisonError(null);
      setComparisonData(null);
      fetch(`/api/superheroes/compare?id1=${h1.id}&id2=${h2.id}`)
        .then(r => {
          if (!r.ok) throw new Error(`Compare request failed: ${r.status}`);
          return r.json();
        })
        .then(data => {
          setComparisonData(data);
          setCurrentView('comparison');
        })
        .catch(err => {
          console.error('Error fetching comparison:', err);
            setComparisonError('Failed to fetch comparison');
            setCurrentView('comparison');
        });
    }
  };

  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  // derive winner info from backend comparisonData
  const deriveWinner = (hero1, hero2) => {
    if (!comparisonData) return { winner: null, score: '' };
    const hero1Wins = comparisonData.categories.filter(c => c.winner === hero1.id).length;
    const hero2Wins = comparisonData.categories.filter(c => c.winner === hero2.id).length;
    const score = `${hero1Wins}-${hero2Wins}`;
    if (comparisonData.overall_winner === 'tie') return { winner: null, score };
    const winnerHero = comparisonData.overall_winner === hero1.id ? hero1 : hero2;
    return { winner: winnerHero, score };
  };

  const renderComparison = () => {
    if (selectedHeroes.length !== 2) return null;
    
    const [hero1, hero2] = selectedHeroes;
  const result = deriveWinner(hero1, hero2);
  const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

    return (
      <div className="comparison-view">
        <button className="back-button" onClick={handleBackToTable}>
          ← Back to Heroes Table
        </button>
        <h1>Superhero Comparison</h1>
        
        <div className="comparison-container">
          <div className="hero-card">
            <img src={hero1.image} alt={hero1.name} className="hero-image" />
            <h2>{hero1.name}</h2>
          </div>
          
          <div className="vs-section">
            <h2>VS</h2>
          </div>
          
          <div className="hero-card">
            <img src={hero2.image} alt={hero2.name} className="hero-image" />
            <h2>{hero2.name}</h2>
          </div>
        </div>

        <div className="stats-comparison">
          {comparisonError && (
            <div className="error-message">{comparisonError}</div>
          )}
          {!comparisonError && !comparisonData && (
            <div className="loading-message">Loading comparison...</div>
          )}
          {!comparisonError && comparisonData && stats.map(stat => {
            const cat = comparisonData.categories.find(c => c.name === stat);
            const winner = cat.winner === 'tie' ? 'tie' : (cat.winner === hero1.id ? 'hero1' : 'hero2');
            return (
              <div key={stat} className="stat-row">
                <div className={`stat-value ${winner === 'hero1' ? 'winner' : ''}`}>{cat.id1_value}</div>
                <div className="stat-name">{stat.charAt(0).toUpperCase() + stat.slice(1)}</div>
                <div className={`stat-value ${winner === 'hero2' ? 'winner' : ''}`}>{cat.id2_value}</div>
              </div>
            );
          })}
        </div>

        <div className="final-result">
          <h2>Final Result</h2>
          {comparisonError ? (
            <div className="tie-announcement">
              <h3>⚠️ Comparison failed</h3>
              <p>{comparisonError}</p>
            </div>
          ) : result.winner ? (
            <div className="winner-announcement">
              <h3>🏆 {result.winner.name} Wins!</h3>
              <p>Score: {result.score}</p>
            </div>
          ) : (
            <div className="tie-announcement">
              <h3>🤝 It's a Tie!</h3>
              <p>Score: {result.score}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTable = () => (
    <div className="table-view">
      <h1>Superheroes</h1>
      <div className="selection-info">
        <p>Select 2 superheroes to compare ({selectedHeroes.length}/2 selected)</p>
        {selectedHeroes.length > 0 && (
          <div className="selected-heroes">
            Selected: {selectedHeroes.map(h => h.name).join(', ')}
          </div>
        )}
        <button 
          className="compare-button" 
          onClick={handleCompare}
          disabled={selectedHeroes.length !== 2}
        >
          Compare Heroes
        </button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>ID</th>
            <th>Name</th>
            <th>Image</th>
            <th>Intelligence</th>
            <th>Strength</th>
            <th>Speed</th>
            <th>Durability</th>
            <th>Power</th>
            <th>Combat</th>
          </tr>
        </thead>
        <tbody>
          {superheroes.map((hero) => (
            <tr 
              key={hero.id} 
              className={isHeroSelected(hero.id) ? 'selected-row' : ''}
            >
              <td>
                <input
                  type="checkbox"
                  checked={isHeroSelected(hero.id)}
                  onChange={() => handleHeroSelection(hero)}
                />
              </td>
              <td>{hero.id}</td>
              <td>{hero.name}</td>
              <td><img src={hero.image} alt={hero.name} width="50" /></td>
              <td>{hero.powerstats.intelligence}</td>
              <td>{hero.powerstats.strength}</td>
              <td>{hero.powerstats.speed}</td>
              <td>{hero.powerstats.durability}</td>
              <td>{hero.powerstats.power}</td>
              <td>{hero.powerstats.combat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        {currentView === 'table' ? renderTable() : renderComparison()}
      </header>
    </div>
  );
}

export default App;
