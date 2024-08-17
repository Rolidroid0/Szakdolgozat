import { useState } from "react";
import Map from "./components/map/Map";
import ShuffleCardsButton from "./components/ShuffleCardsButton";
import { WebSocketService } from "./services/WebSocketService";
import Header from "./components/header/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App: React.FC = () => {

  const [gameStarted, setGameStarted] = useState(false);

  const wsService = WebSocketService.getInstance();
  wsService.connect('ws://localhost:3000');

  const handleGameStart = () => {
    setGameStarted(true);
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
        <Header wsService={wsService} handleGameStart={handleGameStart}/>
        <Routes>
          <Route path="/" element={!gameStarted ? (
              <h1>Game Of Thrones RISK</h1>
            ) : (
              <>
                <ShuffleCardsButton wsService={wsService} />
                <Map />
              </>
            )} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;