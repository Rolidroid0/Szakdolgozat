import { useState } from "react";
import Map from "./components/map/Map";
import ShuffleCardsButton from "./components/ShuffleCardsButton";
import { WebSocketService } from "./services/WebSocketService";
import Header from "./components/header/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CardsDisplay from "./components/cards/CardsDisplay";

const App: React.FC = () => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [showCards, setShowCards] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const wsService = WebSocketService.getInstance();
  wsService.connect('ws://localhost:3000');

  const handleLoggedIn = (isLoggedIn: boolean, playerId: string | null) => {
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
    /*<div>
      <h1>WebSocket React App</h1>
      <ShuffleCardsButton />
      <StartGameButton />
      <Map />
    </div>*/
    <Router>
      <div>
        <Header wsService={wsService} handleLoggedIn={handleLoggedIn}/>
        <Routes>
          <Route path="/" element={!loggedIn ? (
              <h1>Game Of Thrones RISK</h1>
            ) : (
              <>
                <ShuffleCardsButton wsService={wsService} />
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
                <Map />
              </>
            )} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;