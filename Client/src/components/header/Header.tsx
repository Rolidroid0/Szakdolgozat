import { useEffect, useState } from "react";
import './Header.css';
import { API_BASE_URL } from "../../config/config";
import { Player } from "../../types/Player";
import { WebSocketService } from "../../services/WebSocketService";
import { useNavigate } from 'react-router-dom';
import StartGameButton from "../StartGameButton";
import EndTurnButton from "../EndTurnButton";

interface HeaderProps {
    wsService: WebSocketService;
    handleLoggedIn: (isLoggedIn: boolean, playerId: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({ wsService, handleLoggedIn }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [round, setRound] = useState(0);
    const [currentHouse, setCurrentHouse] = useState('');
    const [roundState, setRoundState] = useState<string>('');
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
                    handleLoggedIn(true, selectedPlayer);
                    fetchCurrentRound();

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
                handleLoggedIn(false, null);
            } catch (error) {
                console.error('Error during logout:', error);
            }
        }
    };

    const fetchCurrentRound = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/current-round`);
            const data = await response.json();

            setRound(data.round);
            setCurrentHouse(data.currentPlayer);
            setRoundState(data.roundState);
        } catch (error) {
            console.error('Error fetching current round: ', error);
        }
    };

    const handleEndPhase = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/end-phase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ playerId: selectedPlayer }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData || "Error ending current phase");
            }

            const data = await response.json();
            if (data.message === "Turn ended") {
                console.log("Turn ended, waiting for the next player's move.");
                fetchCurrentRound();
            } else {
                setRoundState(data.nextRoundState);
            }
        } catch (error) {
            console.error("Error ending phase: ", error);
        }
    };

    useEffect(() => {
        if (ws) {
            ws.onmessage = (event: MessageEvent) => {
                const message = JSON.parse(event.data);
    
                if (message.action === 'start-game') {
                    if (isLoggedIn){
                        handleLogout();
                        alert("The game restarted, you were logged out.");
                        navigate('/');
                    }
                } else if (message.action === 'round-updated') {
                    console.log(message);
                    const { currentRound, currentHouse, roundState } = message.data;
                    setRound(currentRound);
                    setCurrentHouse(currentHouse);
                    setRoundState(roundState);
                } else if (message.action === 'round-state-updated') {
                    console.log(message);
                    const { roundState } = message.data;
                    setRoundState(roundState);
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
    }, [ws, isLoggedIn, selectedPlayer]);

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
                    <StartGameButton wsService={wsService}></StartGameButton>
                </>
            ) : (
                <div className="header-loggedInContainer">
                    <span>House {players.find(p => p._id === selectedPlayer)?.house}</span>
                    <button onClick={handleLogout} className="header-button">
                        Logout
                    </button>
                    <h1>Round {round} : {currentHouse}</h1>
                    <h2>Current Phase: {roundState}</h2>
                    {players.find(p => p._id === selectedPlayer)?.house === currentHouse && 
                    <>
                        <EndTurnButton wsService={wsService} selectedPlayer={selectedPlayer}></EndTurnButton>
                        <button onClick={handleEndPhase} className="header-button">
                            End {roundState} Phase
                        </button>
                    </>
                    }
                </div>
            )}
        </header>
    );
};

export default Header;