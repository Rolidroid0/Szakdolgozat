import { useState } from "react";
import { WebSocketService } from "../services/WebSocketService";

interface StartGameButtonProps {
    wsService: WebSocketService;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ wsService }) => {
    const [responseMessage, setResponseMessage] = useState<string | null>(null);

    const handleClick = () => {
        if (wsService.getWebSocket()?.readyState === WebSocket.OPEN) {
            wsService.send(JSON.stringify({ action: 'start-game' }));
        } else {
            setResponseMessage('WebSocket connection is not open.')
        }
    };

    return (
        <div>
            <button onClick={handleClick} className="header-button">Start Game</button>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
};

export default StartGameButton;