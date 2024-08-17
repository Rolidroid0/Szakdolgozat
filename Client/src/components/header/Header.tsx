import { useEffect, useState } from "react";
import './Header.css';
import { API_BASE_URL } from "../../config/config";
import { Player } from "../../types/Player";
import { WebSocketService } from "../../services/WebSocketService";
import { useNavigate } from 'react-router-dom';
import StartGameButton from "../StartGameButton";

interface HeaderProps {
    wsService: WebSocketService;
    handleGameStart: any;
}

const Header: React.FC<HeaderProps> = ({ wsService, handleGameStart }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const navigate = useNavigate();

    const ws = wsService.getWebSocket();

    const fetchPlayers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/players`);
            const data: Player[] = await response.json();
            console.log(data);
            setPlayers(data);
        } catch (error) {
            console.error('Error fetching players: ', error);
        }
    };

    const handleLogin = async () => {
        if (selectedPlayer) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/players/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ playerId: selectedPlayer }),
                });

                const data = await response.json();
                
                if (data.success) {
                    setIsLoggedIn(true);

                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ action: 'set-player-id', data: {playerId: selectedPlayer} }));
                    }
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error during login:', error);
            }
        }
    };

    const handleLogout = async () => {
        if (selectedPlayer) {
            try {
                await fetch(`${API_BASE_URL}/api/players/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ playerId: selectedPlayer }),
                });

                setSelectedPlayer(null);
                setIsLoggedIn(false);
            } catch (error) {
                console.error('Error during logout:', error);
            }
        }
    };

    useEffect(() => {
        if (ws) {
            ws.onmessage = (event: MessageEvent) => {
                const message = JSON.parse(event.data);
    
                if (message.action === 'start-game') {
                    handleLogout();
                    alert("The game restarted, you were logged out.");
                    navigate('/');
                }
            };
        };
        
        const handleWindowClose = async () => {
            if (isLoggedIn && selectedPlayer) {
                await handleLogout();
            }
        };

        window.addEventListener("beforeunload", handleWindowClose);

        return () => {
            window.removeEventListener("beforeunload", handleWindowClose);
        };
    }, [isLoggedIn, selectedPlayer]);

    return (
        <header className="header">
            {!isLoggedIn ? (
                <>
                    <select
                        value={selectedPlayer || ''}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        onClick={fetchPlayers}
                        className="header-select"
                    >
                        <option value="" disabled>
                            Choose a house
                        </option>
                        {players.map((player) => (
                            <option key={player._id} value={player._id}>
                                {player.house}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleLogin} className="header-button">
                        Log in
                    </button>
                    <StartGameButton wsService={wsService} onGameStart={handleGameStart}></StartGameButton>
                </>
            ) : (
                <div className="header-loggedInContainer">
                    <span>House {players.find(p => p._id === selectedPlayer)?.house}</span>
                    <button onClick={handleLogout} className="header-button">
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;