import { useEffect, useState } from "react";
import { WebSocketService } from "../services/WebSocketService";

interface EndTurnButtonProps {
    wsService: WebSocketService;
    selectedPlayer: string | null;
}

const EndTurnButton: React.FC<EndTurnButtonProps> = ({ wsService, selectedPlayer }) => {
    const [responseMessage, setResponseMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleEndTurnResponse = (data: any) => {
            console.log('Received message:', data.cards);
            setResponseMessage('Turn ended.');
        };

        wsService.registerHandler('round-updated', handleEndTurnResponse);

        return () => {
            wsService.unregisterHandler('round-updated');
        };
    }, [wsService]);

    const handleClick = () => {
        if (wsService.getWebSocket()?.readyState === WebSocket.OPEN) {
            wsService.send(JSON.stringify({ action: 'end-of-player-turn', data: {playerId: selectedPlayer} }));
        } else {
            setResponseMessage('WebSocket connection is not open.')
        }
    };

    return (
        <div>
            <button onClick={handleClick}>End Turn</button>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
};

export default EndTurnButton;