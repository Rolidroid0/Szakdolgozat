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
                    if (gameData.round_state === 'maneuver') {
                        await fetchManeuverableTerritories();
                    }
                    else if (gameData.round_state === 'invasion') {
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

        const territoryDetailsHandler = (message: any) => {
                if (message.action === 'territory-updated') {
                    fetchDetails();
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

        wsService.registerHandler('territory-updated', territoryDetailsHandler);
        wsService.registerHandler('territories-updated', territoryDetailsHandler);
        wsService.registerHandler('maneuver-done', territoryDetailsHandler);
        wsService.registerHandler('round-updated', territoryDetailsHandler);
        wsService.registerHandler('round-state-updated', territoryDetailsHandler);
        wsService.registerHandler('territory-reinforced', territoryDetailsHandler);
        wsService.registerHandler('attack-failed', territoryDetailsHandler);

        return () => {
            wsService.unregisterHandler('territory-updated', territoryDetailsHandler);
            wsService.unregisterHandler('territories-updated', territoryDetailsHandler);
            wsService.unregisterHandler('maneuver-done', territoryDetailsHandler);
            wsService.unregisterHandler('round-updated', territoryDetailsHandler);
            wsService.unregisterHandler('round-state-updated', territoryDetailsHandler);
            wsService.unregisterHandler('territory-reinforced', territoryDetailsHandler);
            wsService.unregisterHandler('attack-failed', territoryDetailsHandler);
        };
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
            onClose();
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

    const isInvasionAllowed = 
        game?.round_state === 'invasion'
        && game.current_player === player?.house
        && territory?.owner_id === player.house
        && territory.last_attacked_from !== game.round;
    
    return (
        <div className="territory-details-panel">
            <div className="territory-header" style={headerStyle}>
                <div className='territory-title'>
                    <h2>{territory.name}</h2>
                </div>
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
            </div>
            <div className="details">
            <div className="territory-tags">
                <div className="tag-line">
                    <span className="icon">🛡️</span>
                    <span>Fortress:</span>
                    <span className={territory.fortress === 1 ? "status success" : "status fail"}>
                        {territory.fortress === 1 ? "✔️" : "❌"}
                    </span>
                </div>
                <div className="tag-line">
                    <span className="icon">⚓</span>
                    <span>Port:</span>
                    <span className={territory.port === 1 ? "status success" : "status fail"}>
                        {territory.port === 1 ? "✔️" : "❌"}
                    </span>
                </div>
            </div>
                <div className='territory-info'>
                    <p>🗺️ Region: {territory.region}</p>
                    <p>⚔️ Armies: {territory.number_of_armies}</p>
                </div>
                <hr />
                {game.round_state === "reinforcement" 
                    && game.current_player === player.house
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

                {game.round_state === "maneuver"
                    && game.current_player === player.house
                    && territory.owner_id === player.house && (
                    <div className="maneuver-controls">
                        <p>Select target territory for maneuver:</p>
                        <select 
                            value={targetTerritoryId || ""}
                            onChange={(e) => setTargetTerritoryId(e.target.value)}
                            className='select'
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
                                className='slider'
                            />
                            <p>🚩 Armies to maneuver: {armiesToManeuver}</p>
                            <button onClick={handleManeuver} disabled={armiesToManeuver === 0 || !targetTerritoryId} className='terr-det-btn'>
                                Maneuver
                            </button>
                    </div>
                    )}

                {isInvasionAllowed && attackableTerritories.length != 0 && territory.number_of_armies > 1 && (
                    <div className='invasion-controls'>
                        <p>Select enemy territory to attack:</p>
                        <select 
                            value={targetTerritoryId || ""}
                            onChange={(e) => setTargetTerritoryId(e.target.value)}
                            className='select'
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
                            className='slider'
                        />
                        <p>⚔️ Armies to attack: {armiesToAttack}</p>
                        <button onClick={handleStartBattle} disabled={armiesToAttack === 0 || !targetTerritoryId} className='terr-det-btn'>
                            Start Battle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerritoryDetails;