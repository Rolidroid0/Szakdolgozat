import { ObjectId } from "mongodb";
import { connectToDb } from "../config/db";
import { findConnectedTerritories } from "../services/territoriesService";
import { Role } from "../models/enums";
import { getWebSocketServer } from "../config/websocket";
import WebSocket from "ws";
import { Player } from "../models/playersModel";
import { Territory } from "../models/territoriesModel";
import { Region } from "../models/regionsModel";
import { Game } from "../models/gamesModel";

function generateShuffledNumbers(n: number) {
    const numbers = Array.from({ length: n}, (_, i) => i);
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
};

export const handleDisconnect = async (playerId: string) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        await playersCollection.updateOne(
            { _id: new ObjectId(playerId),
              game_id: ongoingGame._id
            },
            { $set: { is_logged_in: false } }
        );
    } catch (error) {
        console.error('Error during player disconnect:', error);
    }
};

export const calculatePlusArmies = async (playerId: ObjectId) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const territoriesCollection = db?.collection('EssosTerritories');
    const regionsCollection = db?.collection('Regions');
    const gamesCollection = db?.collection('Games');

    if (!playersCollection || !territoriesCollection || !regionsCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

    if (!ongoingGame) {
        throw new Error("No ongoing game found");
    }
    
    const player = await playersCollection.findOne<Player>({ _id: playerId, game_id: ongoingGame._id });

    if (!player) {
        throw new Error("No player found");
    }

    const territories = await territoriesCollection.find<Territory>({ owner_id: player.house, game_id: ongoingGame._id }).toArray();

    const territoryCount = territories.length;
    const fortressCount = territories.filter(territory => territory.fortress === 1).length;
    
    let additionalArmies = Math.floor((territoryCount + fortressCount) / 3);

    if (additionalArmies < 3) additionalArmies = 3;

    const regions = await regionsCollection.find<Region>({}).toArray();
    for (const region of regions) {
        const ownedTerritoriesInRegion = territories.filter(territory => territory.region === region.name);
        if (ownedTerritoriesInRegion.length === region.territory_count) {
            additionalArmies += region.region_bonus;
        }
    }

    return additionalArmies;
};

export const validateManeuver = async (fromTerritoryId: ObjectId, toTerritoryId: ObjectId, playerId: ObjectId) => {
    const connectedTerritories = await findConnectedTerritories(fromTerritoryId, playerId);
    const isConnected = connectedTerritories.some(t => t._id.equals(toTerritoryId));

    if (!isConnected) {
        throw new Error("The target territory is not connected to the starting territory");
    }

    return true;
};

export const rollDice = async (armies: number, role: Role) => {
    const maxDice = role === Role.Attacker ? 3 : 2;
    const rolls = [];
    for (let i = 0; i < Math.min(maxDice, armies); i++) {
        rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    return rolls.sort((a, b) => b - a);
};

export const compareRolls = async (attackerRolls: number[], defenderRolls: number[]) => {
    const minRolls = Math.min(attackerRolls.length, defenderRolls.length);
    let attackerLosses = 0;
    let defenderLosses = 0;

    for (let i = 0; i < minRolls; i++) {
        if (attackerRolls[i] > defenderRolls[i]) {
            defenderLosses++;
        } else {
            attackerLosses++;
        }
    }

    return { attackerLosses, defenderLosses };
};

export const assignTerritoryBonus = async (playerId: ObjectId, cardTerritories: string[]) => {
    const db = await connectToDb();
    const territoriesCollection = db?.collection('EssosTerritories');
    const playersCollection = db?.collection('Players');
    const gamesCollection = db?.collection('Games');

    if (!territoriesCollection || !playersCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

    if (!ongoingGame) {
        throw new Error("No ongoing game found");
    }

    const player = await playersCollection.findOne<Player>({ _id: playerId, game_id: ongoingGame._id });
    if (!player) {
        throw new Error("Player not found");
    }

    const ownedTerritories = await territoriesCollection.find<Territory>({ owner_id: player.house, game_id: ongoingGame, name: { $in: cardTerritories } }).toArray();

    for (const territory of ownedTerritories) {
        await territoriesCollection.updateOne(
            { _id: territory._id, game_id: ongoingGame._id },
            { $inc: { number_of_armies: 2 } }
        );
        const updatedTerritory = await territoriesCollection.findOne<Territory>({ _id: territory._id, game_id: ongoingGame._id });
        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    action: 'territory-updated',
                    data: { territory: updatedTerritory }
                }));
            }
        });
    }
}

export const calculateScores = async () => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const territoriesCollection = db?.collection('EssosTerritories');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !territoriesCollection || !gamesCollection) {
            throw new Error('Collections not found');
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const players = await playersCollection.find<Player>({ game_id: ongoingGame._id }).toArray();
        const scores: any[] = [];

        for (const player of players) {
            const territories = await territoriesCollection.find<Territory>({ owner_id: player.house, game_id: ongoingGame._id }).toArray();
            let score = 0;

            score += territories.length;

            territories.forEach(territory => {
                if (territory.fortress === 1) score++;
                if (territory.port === 1) score++;
            });

            scores.push({ player, score });
        }

        const winner = scores.reduce((prev, current) => (prev.score > current.score ? prev : current));

        await gamesCollection.updateOne(
            { state: "ongoing" },
            { $set: { state: `${winner.player.house} won` } }
        );

        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    action: 'game-over',
                    data: {
                        winner: winner.player.house,
                        scores: scores.map(s => ({ player: s.player.house, score: s.score }))
                    }
                }));
            }
        });

        return true;
    } catch (error) {
        console.error('Error calculating scores: ', error);
    }
};

export default generateShuffledNumbers;