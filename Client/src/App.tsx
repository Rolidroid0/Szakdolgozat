import { useEffect, useState } from "react";
import Map from "./components/map/Map";
import { WebSocketService } from "./services/WebSocketService";
import Header from "./components/header/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CardsDisplay from "./components/cards/CardsDisplay";
import './App.css';
import { getOngoingBattle } from "./services/battleService";

const App: React.FC = () => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [showCards, setShowCards] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>('');
  const [ongoingBattle, setOngoingBattle] = useState<boolean>(false);

  const wsService = WebSocketService.getInstance();
  wsService.connect('ws://localhost:3000');

  useEffect(() => {
    if (loggedIn) {
      const checkOngoingBattle = async () => {
        try {
          const battle = await getOngoingBattle();
          if (battle) {
            console.log('Ongoing battle found: ', battle);
            setOngoingBattle(true);
          }
        } catch (error) {
          console.error("Error checking ongoing battle: ", error);
        }
      };
      checkOngoingBattle();
    }
  }, [loggedIn]);

  useEffect(() => {
    const ws = wsService.getWebSocket();

    if (ws) {
      ws.onmessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);

        if (message.action === 'battle-started') {
          console.log('Battle started: ', message.data);
          setOngoingBattle(true);
        }
      };
    }

    return () => {
      if (ws) {
        ws.onmessage = null;
      }
    };
  }, [wsService]);

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