import ShuffleCardsButton from "./components/ShuffleCardsButton";
import { WebSocketService } from "./services/WebSocketService";

const App: React.FC = () => {

  const wsService = WebSocketService.getInstance();
  wsService.connect('ws://localhost:3000');

  return (
    <div>
      <h1>WebSocket React App</h1>
      <ShuffleCardsButton />
    </div>
  );
};

export default App;