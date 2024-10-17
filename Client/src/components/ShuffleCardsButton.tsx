import { useEffect, useState } from "react";
import { WebSocketService } from "../services/WebSocketService";

interface ShuffleCardsButtonProps {
    wsService: WebSocketService;
}

const ShuffleCardsButton: React.FC<ShuffleCardsButtonProps> = ({ wsService }) => {
    const [responseMessage, setResponseMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleShuffleResponse = (data: any) => {
            console.log('Received cards:', data.cards);
            setResponseMessage('Cards received and logged in the console.');
        };

        wsService.registerHandler('shuffle-cards', handleShuffleResponse);

        return () => {
            wsService.unregisterHandler('shuffle-cards', handleShuffleResponse);
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