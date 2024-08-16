import { useEffect, useState } from "react";
import { WebSocketService } from "../services/WebSocketService";

interface StartGameButtonProps {
    onGameStart: () => void;
    wsService: WebSocketService;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ onGameStart, wsService }) => {
    const [responseMessage, setResponseMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleGameStartResponse = (data: any) => {
            if (data.success) {
                onGameStart();
                setResponseMessage('Game started successfully.');
            } else {
                setResponseMessage('Failed to start the game.');
            }
        };

        wsService.registerHandler('start-game', handleGameStartResponse);

        return () => {
            wsService.unregisterHandler('start-game');
        }
    }, [wsService, onGameStart]);

    const handleClick = () => {
        if (wsService.getWebSocket()?.readyState === WebSocket.OPEN) {
            wsService.send(JSON.stringify({ action: 'start-game' }));
        } else {
            setResponseMessage('WebSocket connection is not open.')
        }
    };

    return (
        <div>
            <button onClick={handleClick}>Start Game</button>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
};

export default StartGameButton;