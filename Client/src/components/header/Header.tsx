import { useState } from "react";
import './Header.css';
import { API_BASE_URL } from "../../config/config";
import { Player } from "../../types/Player";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

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

    const handleLogin = () => {
        if (selectedPlayer) {
            setIsLoggedIn(true);
        }
    };

    const handleLogout = () => {
        setSelectedPlayer(null);
        setIsLoggedIn(false);
    }

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
                            <option key={player._id} value={player.house}>
                                {player.house}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleLogin} className="header-button">
                        Log in
                    </button>
                </>
            ) : (
                <div className="header-loggedInContainer">
                    <span>House {selectedPlayer}</span>
                    <button onClick={handleLogout} className="header-button">
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;