import { WebSocketService } from "../services/WebSocketService";

interface EndTurnButtonProps {
    wsService: WebSocketService;
    selectedPlayer: string | null;
}

const EndTurnButton: React.FC<EndTurnButtonProps> = ({ wsService, selectedPlayer }) => {

    const handleClick = () => {
        if (wsService.getWebSocket()?.readyState === WebSocket.OPEN) {
            wsService.send(JSON.stringify({ action: 'end-of-player-turn', data: {playerId: selectedPlayer} }));
        } else {
            console.warn("Can't end turn");
        }
    };

    return (
        <div>
            <button onClick={handleClick} className="header-button">End Turn</button>
        </div>
    );
};

export default EndTurnButton;