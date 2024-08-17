import { useState } from "react";
import Map from "./components/map/Map";
import ShuffleCardsButton from "./components/ShuffleCardsButton";
import { WebSocketService } from "./services/WebSocketService";
import Header from "./components/header/Header";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App: React.FC = () => {

  const [loggedIn, setLoggedIn] = useState(false);

  const wsService = WebSocketService.getInstance();
  wsService.connect('ws://localhost:3000');

  const handleLoggedIn = (isLoggedIn: boolean) => {
    setLoggedIn(isLoggedIn);
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
                <Map />
              </>
            )} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;