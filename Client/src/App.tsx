
import { useState } from "react";
import Map from "./components/Map";
import ShuffleCardsButton from "./components/ShuffleCardsButton";
import StartGameButton from "./components/StartGameButton";
import { WebSocketService } from "./services/WebSocketService";

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
    <div>
      <h1>Game Of Thrones RISK</h1>
      {!gameStarted ? (
        <StartGameButton onGameStart={handleGameStart} wsService={wsService} />
      ) : (
        <>
          <ShuffleCardsButton wsService={wsService} />
          <Map />
        </>
      )}
    </div>
  );
};

export default App;