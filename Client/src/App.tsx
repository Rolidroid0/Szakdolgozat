import { useEffect, useState } from "react";
import Map from "./components/map/Map";
import { WebSocketService } from "./services/WebSocketService";
import Header from "./components/header/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CardsDisplay from "./components/cards/CardsDisplay";
import './App.css';
import { getOngoingBattle } from "./services/battleService";
import BattleModal from "./components/battleModal/BattleModal";
import { WebSocketProvider } from "./providers/WebSocketProvider";

const App: React.FC = () => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [showCards, setShowCards] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>('');
  const [ongoingBattle, setOngoingBattle] = useState<any>(null);

  const wsService = WebSocketService.getInstance();
  //wsService.connect('ws://localhost:3000');

  useEffect(() => {
    if (loggedIn) {
      const checkOngoingBattle = async () => {
        try {
          const battle = await getOngoingBattle();
          if (battle) {
            console.log('Ongoing battle found: ', battle);
            setOngoingBattle(battle);
          }
        } catch (error) {
          console.error("Error checking ongoing battle: ", error);
        }
      };
      checkOngoingBattle();
    } else {
      setOngoingBattle(null);
    }
  }, [loggedIn]);

  useEffect(() => {
      const appHandler = (message: any) => {
        if (message.action === 'battle-started') {
          console.log('Battle started: ', message.data);
          setOngoingBattle(message.data.battle);
          console.log(ongoingBattle);
        } else if (message.action === 'battle-update') {
          console.log('Battle updated: ', message.data);
          setOngoingBattle(message.data.battle);
        } else if (message.action === 'battle-ended') {
          console.log('Battle ended: ', message.data);
          setOngoingBattle(null);
        }
      };

      wsService.registerHandler('battle-started', appHandler);
      wsService.registerHandler('battle-update', appHandler);
      wsService.registerHandler('battle-ended', appHandler);

    return () => {
      wsService.unregisterHandler('battle-started');
      wsService.unregisterHandler('battle-update');
      wsService.unregisterHandler('battle-ended');
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
    <WebSocketProvider>
    <Router>
      <div id="root">
        <Header wsService={wsService} handleLoggedIn={handleLoggedIn} ongoingBattle={ongoingBattle}/>
        <div className="app-container">
            <>
            {ongoingBattle && <BattleModal wsService={wsService} battle={ongoingBattle} playerId={playerId} />}
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
            </>
        </div>
      </div>
    </Router>
    </WebSocketProvider>
  );
};

export default App;