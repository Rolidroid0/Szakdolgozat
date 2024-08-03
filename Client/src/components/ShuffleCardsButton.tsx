import { useEffect, useState } from "react";
import { WebSocketService } from "../services/WebSocketService";

const ShuffleCardsButton: React.FC = () => {
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const wsService = WebSocketService.getInstance();

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            const text = await event.data.text();
            const data = JSON.parse(text);
            console.log('Received cards:', data.message);
            setResponseMessage('Cards received and logged in the console.');
        };

        const ws = wsService.getWebSocket();
        ws?.addEventListener('message', handleMessage);

        return () => {
            ws?.removeEventListener('message', handleMessage);
        };
    }, [wsService]);

    const handleClick = () => {
        if (wsService.getWebSocket()?.readyState === WebSocket.OPEN) {
            wsService.send(JSON.stringify({ action: 'shuffle-cards' }));
        } else {
            setResponseMessage('WebSocket connection is not open.')
        }
    };

    return (
        <div>
            <button onClick={handleClick}>Shuffle Cards</button>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
};

export default ShuffleCardsButton;