import React, { useEffect, useState } from 'react';
import { WebSocketService } from '../../services/WebSocketService'; // Import your WebSocket service

const KeverKártyákButton: React.FC = () => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const wsService = WebSocketService.getInstance(); // Singleton instance of WebSocketService

  useEffect(() => {
    // Handle incoming messages from the WebSocket server
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setResponseMessage(data.message || 'No message received');
    };

    const ws = wsService.getWebSocket();
    ws?.addEventListener('message', handleMessage);

    return () => {
      ws?.removeEventListener('message', handleMessage);
    };
  }, [wsService]);

  const handleClick = () => {
    if (wsService.getWebSocket()?.readyState === WebSocket.OPEN) {
      wsService.send(JSON.stringify({ action: 'kever-kartyak' }));
    } else {
      setResponseMessage('WebSocket connection is not open.');
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Kártyák Keverése</button>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
};

export default KeverKártyákButton;
