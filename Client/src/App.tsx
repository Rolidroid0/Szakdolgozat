import { useEffect, useState } from 'react';
import { WebSocketService } from './services/WebSocketService';
import KeverKártyákButton from './components/Kártyák/KeverKártyákButton';

/*const App = () => {

  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    
    const wsService = WebSocketService.getInstance();
    wsService.connect('ws://localhost:3000');

    wsService.send('Hello WebSocket');

    const handleMessage = async (event: MessageEvent) => {
      if (event.data instanceof Blob) {
        const text = await event.data.text();
        console.log(`Received message: ${text}`);
        setData(prevData => [...prevData, text]);
      } else {
        console.log(`Received message: ${event.data}`);
        setData(prevData => [...prevData, event.data]);
      }
    };

    const ws = wsService.getWebSocket();
    ws?.addEventListener('message', handleMessage);

    return () => {
      ws?.removeEventListener('message', handleMessage);
      wsService.disconnect();
    };

  }, []);

  return (
    <div>
      <h1>WebSocket React App</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};*/

const App: React.FC = () => {

  const wsService = WebSocketService.getInstance();
  wsService.connect('ws://localhost:3000');

  return (
    <div>
      <h1>WebSocket React App</h1>
      <KeverKártyákButton />
    </div>
  );
};


export default App;
