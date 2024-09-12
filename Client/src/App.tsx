import { useState } from "react";
import Map from "./components/map/Map";
import { WebSocketService } from "./services/WebSocketService";
import Header from "./components/header/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CardsDisplay from "./components/cards/CardsDisplay";
import './App.css';

const App: React.FC = () => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [showCards, setShowCards] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>('');

  const wsService = WebSocketService.getInstance();
  wsService.connect('ws://localhost:3000');

  const handleLoggedIn = (isLoggedIn: boolean, playerId: string) => {
    setLoggedIn(isLoggedIn);
    setPlayerId(playerId);
  };

  const handleToggleCards = () => {
    setShowCards(!showCards);
  };

  const handleTradeCards = (additionalArmies: number) => {
    console.log(`Traded cards for ${additionalArmies} additional armies`);
  };

  return (
    <Router>
      <div id="root">
        <Header wsService={wsService} handleLoggedIn={handleLoggedIn}/>
        <div className="app-container">
          <Routes>
            <Route path="/" element={!loggedIn ? (
                <div className="game-title-container">
                  <h1 className="game-title">Game Of Thrones RISK</h1>
                </div>
              ) : (
                <>
                  {!showCards ? (
                          <button onClick={handleToggleCards} className="header-button">
                              Show Cards
                          </button>
                      ) : (
                          <div className="cards-panel">
                              <CardsDisplay 
                                playerId={playerId}
                                onTradeSuccess={handleTradeCards} />
                              <button onClick={handleToggleCards} className="header-button">
                                  Hide Cards
                              </button>
                          </div>
                      )}
                  <Map playerId={playerId} />
                </>
              )} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;