// Megoldások enumra

function createEnum(values) {
    const enumObject = {};
    for (const val of values) {
      enumObject[val] = val;
    }
    return Object.freeze(enumObject);
  }
  
  // { Up: 'Up', Down: 'Down', Left: 'Left', Right: 'Right' }
  createEnum(['Up', 'Down', 'Left', 'Right']);

  class Direction {
    static Up = new Direction('Up');
    static Down = new Direction('Down');
    static Left = new Direction('Left');
    static Right = new Direction('Right');
  
    constructor(name) {
      this.name = name;
    }
    toString() {
      return `Direction.${this.name}`;
    }
  }

// Client App.tsx WebSocket tesztelésére

/*import { useEffect, useState } from 'react';
import { WebSocketService } from './services/WebSocketService';

const App = () => {

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
};

export default App;*/