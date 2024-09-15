import { ObjectId } from "mongodb";
import { WebSocket } from 'ws';
import { getWebSocketServer } from "../config/websocket";
import { connectToDb } from "../config/db";
import { Battle } from "../models/battlesModel";

export const getOngoingBattle = async () => {
    try {
        const db = await connectToDb();
        const battlesCollection = db?.collection('Battles');

        if (!battlesCollection) {
            throw new Error("Battles collection not found");
        }

        const battle = await battlesCollection.findOne({ state: "ongoing" });
        if (!battle) {
            return null;
        }
        
        return battle;
    } catch (error) {
        console.error('Error getting battle: ', error);
        throw error;
    }
};

export const startBattle = async (playerId: ObjectId, fromTerritoryId: ObjectId, toTerritoryId: ObjectId, armies: number) => {
    try {
        const db = await connectToDb();
        const gamesCollection = db?.collection('Games');
        const battlesCollection = db?.collection('Battles');
        const territoriesCollection = db?.collection('EssosTerritories');
        const playersCollection = db?.collection('Players');

        if (!gamesCollection || !battlesCollection || !territoriesCollection || !playersCollection) {
            throw new Error("Collections not found");
        }

        const ongoingBattle = await battlesCollection.findOne({ state: "ongoing" });

        if (ongoingBattle) {
            throw new Error("There is already a battle running");
        }

        const player = await playersCollection.findOne({ _id: playerId });
        const fromTerritory = await territoriesCollection.findOne({ _id: fromTerritoryId });
        const toTerritory = await territoriesCollection.findOne({ _id: toTerritoryId });
        const ongoingGame = await gamesCollection.findOne({ state: "ongoing" });

        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        if (!player) {
            throw new Error("Player not found");
        }

        if (!fromTerritory || !toTerritory) {
            throw new Error("Territories not found");
        }

        if (ongoingGame.currentPlayer !== player.house || ongoingGame.roundState !== 'invasion') {
            throw new Error("You can not start a battle now");
        }

        if (fromTerritory.owner_id !== player.house || toTerritory.owner_id === player.house) {
            throw new Error("Invalid attack");
        }

        if (fromTerritory.last_attacked_from === ongoingGame.round) {
            throw new Error("You have already attacked from this territory this round");
        }

        if (fromTerritory.number_of_armies <= armies) {
            throw new Error("Not enough armies");
        }

        const battle = await createBattle(fromTerritoryId, toTerritoryId, armies);

        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'battle-started', data: { battle } }));
            }
        });
    } catch (error) {
        console.error("Error starting battle: ", error);
        throw error;
    }
};

export const createBattle = async (attackerTerritoryId: ObjectId, defenderTerritoryId: ObjectId, attackerArmies: number) => {
    try {
        const db = await connectToDb();
        const battlesCollection = db?.collection('Battles');
        const gamesCollection = db?.collection('Games');
        const territoriesCollection = db?.collection('EssosTerritories');

        if (!battlesCollection || !gamesCollection || !territoriesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne({ state: "ongoing" });

        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const defenderTerritory = await territoriesCollection.findOne({ _id: defenderTerritoryId });
        const attackerTerritory = await territoriesCollection.findOne({ _id: attackerTerritoryId });

        if (!defenderTerritory || !attackerTerritory) {
            throw new Error("Territories not found");
        }

        await battlesCollection.insertOne({
            state: "ongoing",
            attacker_id: attackerTerritory.owner_id,
            defender_id: defenderTerritory.owner_id,
            attacker_territory_id: attackerTerritoryId.toString(),
            defender_territory_id: defenderTerritoryId.toString(),
            attacker_armies: attackerArmies,
            defender_armies: defenderTerritory.number_of_armies,
            current_attacker_armies: attackerArmies,
            current_defender_armies: defenderTerritory.number_of_armies,
            battle_log: [],
            round_number: ongoingGame.round,
        });

        const insertedBattle = await battlesCollection.findOne({ state: "ongoing" });

        if (!insertedBattle) {
            throw new Error("Failed to retrieve the inserted battle");
        }

        return insertedBattle;
    } catch (error) {
        console.error("Error creating battle: ", error);
        throw error;
    }
};