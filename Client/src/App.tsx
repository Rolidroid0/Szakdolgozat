import { useEffect } from 'react';

const App = () => {

  useEffect(() => {
    
    const socket = new WebSocket('ws://localhost:3000');

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
      //socket.send('Hello WebSocket');
    };

    socket.onmessage = (event) => {
      console.log(`Received message: ${event.data}`);
      // Handle the received message here
    };

    socket.onclose = (event) => {
      console.log(`Disconnected from WebSocket server: ${event.code}, ${event.reason}`);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };

  }, []);

  return (
    <div>
      <h1>WebSocket React App</h1>
      {/* UI elements */}
    </div>
  );
};

export default App;
