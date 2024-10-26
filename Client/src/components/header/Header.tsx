import { useEffect, useState } from "react";
import './Header.css';
import { API_BASE_URL } from "../../config/config";
import { Player } from "../../types/Player";
import { WebSocketService } from "../../services/WebSocketService";
import { useNavigate } from 'react-router-dom';
import StartGameButton from "../StartGameButton";
import EndTurnButton from "../EndTurnButton";
import { Battle } from "../../types/Battle";

interface HeaderProps {
    wsService: WebSocketService;
    handleLoggedIn: (isLoggedIn: boolean, playerId: string) => void;
    ongoingBattle: Battle | null;
}

const Header: React.FC<HeaderProps> = ({ wsService, handleLoggedIn, ongoingBattle }) => {
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
                handleLoggedIn(false, '');
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
            setCurrentHouse(data.current_player);
            setRoundState(data.round_state);
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
        const headerHandler = (message: any) => {
            if (message.action === 'round-updated') {
                const { current_round, currentHouse, round_state } = message.data;
                setRound(current_round);
                setCurrentHouse(currentHouse);
                setRoundState(round_state);
            } else if (message.action === 'round-state-updated') {
                const { round_state } = message.data;
                setRoundState(round_state);
            } else if (message.action === 'start-game') {
                if (isLoggedIn){
                    handleLogout();
                    alert("The game restarted, you were logged out.");
                    navigate('/');
                }
            } else if (message.action === 'game-over') {
                if (isLoggedIn){
                    console.log('Game over: ', message.data);

                    const winner = message.data.winner;
                    const scores: any[] = message.data.scores;

                    let alertMessage = `Game over! Winner: ${winner}\n\nScores:\n`;
                    scores.forEach(score => {
                        alertMessage += `${score.player}: ${score.score}\n`;
                    });

                    handleLogout();
                    alert(alertMessage);
                    navigate('/');
                }
            }
        };
        
        const handleWindowClose = async () => {
            if (isLoggedIn && selectedPlayer) {
                await handleLogout();
            }
        };

        wsService.registerHandler('round-updated', headerHandler);
        wsService.registerHandler('round-state-updated', headerHandler);
        wsService.registerHandler('start-game', headerHandler);
        wsService.registerHandler('game-over', headerHandler);
        window.addEventListener("beforeunload", handleWindowClose);

        return () => {
            window.removeEventListener("beforeunload", handleWindowClose);
            wsService.unregisterHandler('round-updated', headerHandler);
            wsService.unregisterHandler('round-state-updated', headerHandler);
            wsService.unregisterHandler('start-game', headerHandler);
            wsService.unregisterHandler('game-over', headerHandler);
        };
    }, [ws, isLoggedIn, selectedPlayer, round, currentHouse, roundState]);

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
                    {players.find(p => p._id === selectedPlayer)?.house === currentHouse && !ongoingBattle &&
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