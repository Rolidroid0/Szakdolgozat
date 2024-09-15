import React, { useEffect, useState } from 'react';
import { Territory } from '../../types/Territory';
import './TerritoryDetails.css';
import { houseColors } from '../../types/House';
import { WebSocketService } from '../../services/WebSocketService';
import { Player } from '../../types/Player';
import { Game } from '../../types/Game';
import { getPlayerDetails } from '../../services/playerService';
import { getAttackableTerritories, getManeuverableTerritories, getTerritoryDetails } from '../../services/territoryService';
import { getGameDetails } from '../../services/gameService';
import Spinner from '../spinner/Spinner';

interface TerritoryDetailsProps {
    playerId: string;
    territoryId: string;
    onClose: () => void;
}

const TerritoryDetails: React.FC<TerritoryDetailsProps> = ({ territoryId, onClose, playerId }) => {
    const [territory, setTerritory] = useState<Territory | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [armiesToAdd, setArmiesToAdd] = useState(0);
    const [armiesToAttack, setArmiesToAttack] = useState(0);
    const [availableArmies, setAvailableArmies] = useState(0);
    const [armiesToManeuver, setArmiesToManeuver] = useState(0);
    const [targetTerritoryId, setTargetTerritoryId] = useState<string | null>(null);
    const [maneuverableTerritories, setManeuverableTerritories] = useState<Territory[]>([]);
    const [attackableTerritories, setAttackableTerritories] = useState<Territory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const wsService = WebSocketService.getInstance();
    const ws = wsService.getWebSocket();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const playerData: Player = await getPlayerDetails(playerId);
                const territoryData: Territory = await getTerritoryDetails(territoryId);
                const gameData: Game = await getGameDetails();
                setPlayer(playerData);
                setAvailableArmies(playerData.plus_armies);
                setTerritory(territoryData);
                setGame(gameData);

                if (territoryData.owner_id === playerData.house) {
                    if (gameData.roundState === 'maneuver') {
                        await fetchManeuverableTerritories();
                    }
                    else if (gameData.roundState === 'invasion') {
                        await fetchEnemyTerritories();
                    }
                }
            } catch (error) {
                console.error('Error fetching details: ', error);
                setError('Failed to fetch details.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();

        if (ws) {
            ws.onmessage = async (event: MessageEvent) => {
                const message = JSON.parse(event.data);
                console.log(message);
    
                if (message.action === 'territory-updated') {
                    if (message.territory._id === territory?._id){
                        fetchDetails();
                    }
                } else if (message.action === 'territories-updated') {
                    if (message.data.fromTerritoryId === territory?._id
                        || message.data.toTerritoryId === territory?._id
                    ) {
                        fetchDetails();
                    }
                } else if (message.action === 'maneuver-done') {
                    if (message.data.success) {
                        fetchDetails();
                    }
                } else if (message.action === 'round-updated' || message.action === 'round-state-updated') {
                    fetchDetails();
                } else if (message.action === 'territory-reinforced' && message.data.success) {
                    fetchDetails();
                } else if (message.action === 'attack-failed') {
                    alert(message.data.message);
                }
            };
        };

        return () => {};
    }, [wsService, territoryId, playerId]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArmiesToAdd(parseInt(e.target.value, 10));
    };

    const handleManeuverSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArmiesToManeuver(parseInt(e.target.value, 10));
    };

    const handleAttackSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArmiesToAttack(parseInt(e.target.value, 10));
    };

    const fetchManeuverableTerritories = async () => {
        try {
            const fetchedTerritories = await getManeuverableTerritories(playerId, territoryId);
            setManeuverableTerritories(fetchedTerritories);
        } catch (error) {
            console.error('Error fetching maneuverable territories: ', error);
            setError('Failed to fetch maneuverable territories.');
        }
    };

    const fetchEnemyTerritories = async () => {
        try {
            const enemyTerritories = await getAttackableTerritories(playerId, territoryId);
            setAttackableTerritories(enemyTerritories);
        } catch (error) {
            console.error('Error fetching attackable territories: ', error);
            setError('Failed to fetch attackable territories.');
        }
    }

    const handleReinforce = () => {
        wsService.send(JSON.stringify({
            action: 'reinforce-territory',
            data: { territoryId, armies: armiesToAdd, playerId },
        }));
        setAvailableArmies(availableArmies - armiesToAdd);
        setArmiesToAdd(0);
    };

    const handleManeuver = () => {
        if (targetTerritoryId) {
            wsService.send(JSON.stringify({
                action: 'maneuver',
                data: { 
                    playerId,
                    fromTerritoryId: territoryId,
                    toTerritoryId: targetTerritoryId,
                    armies: armiesToManeuver,
                }
            }));
            setArmiesToManeuver(0);
            setTargetTerritoryId(null);
        }
    };

    const handleStartBattle = () => {
        if (targetTerritoryId) {
            wsService.send(JSON.stringify({
                action: 'start-battle',
                data: {
                    playerId,
                    fromTerritoryId: territoryId,
                    toTerritoryId: targetTerritoryId,
                    armies: armiesToAttack,
                }
            }));
            setArmiesToAttack(0);
            setTargetTerritoryId(null);
        }
    };

    if (loading) {
        return (
            <div className='territory-details-panel'>
                <div className='header'>
                    <h2>Loading Territory...</h2>
                    <button className='close-button' onClick={onClose}>
                        &times;
                    </button>
                </div>
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!territory || !player || !game) {
        return <div>Data is not available.</div>;
    }

    const headerStyle = {
        backgroundColor: houseColors[territory.owner_id] || '#8d8f8e',
    };

    const isInvasionAllowed = game.roundState === 'invasion'
        && game.currentPlayer === player.house
        && territory.owner_id === player.house
        && territory.last_attacked_from !== game.round;
    
    return (
        <div className="territory-details-panel">
            <div className="territory-header" style={headerStyle}>
                <h2>{territory.name}</h2>
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
            </div>
            <div className="details">
                {territory.fortress === 1 && <p>Fortress</p>}
                {territory.port === 1 && <p>Port</p>}
                <p>Region: {territory.region}</p>
                <p>Armies: {territory.number_of_armies}</p>
                {game.roundState === "reinforcement" 
                    && game.currentPlayer === player.house
                    && territory.owner_id === player.house && (
                    <div className="reinforcement-controls">
                        <input
                            type="range"
                            min="0"
                            max={availableArmies}
                            value={armiesToAdd}
                            onChange={handleSliderChange}
                        />
                        <p>Armies to add: {armiesToAdd}</p>
                        <button onClick={handleReinforce} disabled={armiesToAdd === 0}>
                            Reinforce
                        </button>
                    </div>
                )}

                {game.roundState === "maneuver"
                    && game.currentPlayer === player.house
                    && territory.owner_id === player.house && (
                    <div className="maneuver-controls">
                        <p>Select target territory for maneuver:</p>
                        <select 
                            value={targetTerritoryId || ""}
                            onChange={(e) => setTargetTerritoryId(e.target.value)}
                            >
                                <option value="">Select a territory</option>
                                {maneuverableTerritories.map(territory => (
                                    <option key={territory._id} value={territory._id}>
                                        {territory.name}
                                    </option>
                                ))}
                            </select>

                            <input 
                                type="range" 
                                min="0"
                                max={territory.number_of_armies - 1}
                                value={armiesToManeuver}
                                onChange={handleManeuverSliderChange}
                            />
                            <p>Armies to maneuver: {armiesToManeuver}</p>
                            <button onClick={handleManeuver} disabled={armiesToManeuver === 0 || !targetTerritoryId}>
                                Maneuver
                            </button>
                    </div>
                    )}

                {isInvasionAllowed && attackableTerritories.length != 0 && (
                    <div className='invasion-controls'>
                        <p>Select enemy territory to attack:</p>
                        <select 
                            value={targetTerritoryId || ""}
                            onChange={(e) => setTargetTerritoryId(e.target.value)}
                        >
                            <option value="">Select a territory</option>
                            {attackableTerritories.map(enemyTerritory => (
                                <option key={enemyTerritory._id} value={enemyTerritory._id}>
                                    {enemyTerritory.name}
                                </option>
                            ))}
                        </select>

                        <input 
                            type="range"
                            min="0"
                            max={territory.number_of_armies - 1}
                            value={armiesToAttack}
                            onChange={handleAttackSliderChange}
                        />
                        <p>Armies to attack: {armiesToAttack}</p>
                        <button onClick={handleStartBattle} disabled={armiesToAttack === 0 || !targetTerritoryId}>
                            Start Battle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerritoryDetails;