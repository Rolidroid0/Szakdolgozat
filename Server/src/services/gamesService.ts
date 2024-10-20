import { WebSocketServer } from "ws";
import { connectToDb } from "../config/db";
import { calculatePlusArmies, calculateScores, validateManeuver } from "../utils/functions";
import { ObjectId } from "mongodb";
import { WebSocket } from 'ws';
import { getWebSocketServer } from "../config/websocket";
import { Game } from "../models/gamesModel";
import { drawCard } from "./cardsService";
import { Symbol } from "../models/enums";

export const getOngoingGame = async () => {
    try {
        const db = await connectToDb();
        const gamesCollection = db?.collection('Games');

        if (!gamesCollection) {
            throw new Error("Games collection not found");
        }

        const game = await gamesCollection.findOne({ state: "ongoing" });
        if (!game) {
            throw new Error("No ongoing game found");
        }
        
        return game;
    } catch (error) {
        console.error('Error getting game: ', error);
        throw error;
    }
};

export const getCurrentRound = async () => {
    const db = await connectToDb();
    const gamesCollection = db?.collection('Games');

    if (!gamesCollection) {
        throw new Error("Games collection not found");
    }

    const ongoingGame = await gamesCollection.findOne({ state: "ongoing" });

    if (!ongoingGame) {
        return { message: "No ongoing game found" };
    }

    const { round, currentPlayer, roundState } = ongoingGame;

    return { round, currentPlayer, roundState };
};

export const applyAdditionalArmies = async (playerId: ObjectId) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');

    if (!playersCollection) {
        throw new Error("Players collection not found");
    }

    const additionalArmies = await calculatePlusArmies(playerId);

    await playersCollection.updateOne(
        { _id: playerId },
        { $inc: { plus_armies: additionalArmies } }
    );
};

export const endTurn = async (wss: WebSocketServer, data: any) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const gamesCollection = db?.collection('Games');

    if (!playersCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const ongoingGame = await gamesCollection.findOne({ state: "ongoing" });

    if (!ongoingGame) {
        throw new Error("No ongoing game found");
    }

    const currentPlayer = ongoingGame.currentPlayer;
    const currentPlayerDoc = await playersCollection.findOne({ _id: new ObjectId(data.playerId) });

    if (!currentPlayerDoc || currentPlayerDoc.house !== currentPlayer) {
        throw new Error("It's not your turn!");
    }

    if (currentPlayerDoc.plus_armies > 0 && ongoingGame.roundState === "reinforcement") {
        throw new Error("You still have armies to place");
    }

    if (currentPlayerDoc.conquered) {
        await drawCard(currentPlayerDoc._id);
        currentPlayerDoc.conquered = false;
        await playersCollection.updateOne(
            { _id: currentPlayerDoc._id },
            { $set: { conquered: false } }
        );

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    action: 'cards-updated',
                    data: { playerId: currentPlayerDoc._id }
                }));
            }
        });
    }

    const gameEnded = await checkGameEnd();
    if (gameEnded) {
        return;
    }

    const players = await playersCollection.find({}).toArray();
    const currentPlayerIndex = players.findIndex(player => player._id.equals(data.playerId));
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    let currentRound = ongoingGame.round;
    if (nextPlayerIndex === 0) {
        currentRound += 1;
    }

    const nextPlayer = players[nextPlayerIndex];

    if (nextPlayer) {
        await applyAdditionalArmies(nextPlayer._id);

        const nextRoundState = "reinforcement";

        await gamesCollection.updateOne(
            { state: "ongoing" },
            { $set: { currentPlayer: nextPlayer.house, round: currentRound, roundState: nextRoundState } }
        );

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'round-updated', data: { currentRound: currentRound, currentHouse: nextPlayer.house, roundState: nextRoundState } }));
            }
        });
    } else {
        console.error('No next player found');
    }
};

export const endPhase = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const gamesCollection = db?.collection('Games');
        const playersCollection = db?.collection('Players');

        if (!gamesCollection || !playersCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne({ state: "ongoing" });

        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const player = await playersCollection.findOne({ _id: new ObjectId(playerId) });

        if (!player) {
            throw new Error("No player found");
        }

        if (ongoingGame.currentPlayer !== player.house) {
            throw new Error("Not your turn");
        }

        if (player.plus_armies > 0 && ongoingGame.roundState === "reinforcement") {
            throw new Error("You still have armies to place");
        }

        const phaseOrder = ["reinforcement", "invasion", "maneuver"];
        const currentPhaseIndex = phaseOrder.indexOf(ongoingGame.roundState);
        let nextRoundState;

        if (currentPhaseIndex === -1) {
            throw new Error("Invalid game phase");
        } else if (currentPhaseIndex < phaseOrder.length - 1) {
            nextRoundState = phaseOrder[currentPhaseIndex + 1];
        } else {
            await endTurn(getWebSocketServer(), { playerId: playerId });
            return "endTurn";
        }

        await gamesCollection.updateOne(
            { _id: ongoingGame._id },
            { $set: { roundState: nextRoundState } }
        );

        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    action: 'round-state-updated',
                    data: { roundState: nextRoundState }
                }));
            }
        });

        return nextRoundState;
    } catch (error) {
        console.error("Error ending reinforcement phase: ", error);
    }
};

export const applyManeuver = async (playerId: ObjectId, fromTerritoryId: ObjectId, toTerritoryId: ObjectId, armies: number) => {
    const db = await connectToDb();
    const territoriesCollection = db?.collection('EssosTerritories');
    const playersCollection = db?.collection('Players');
    const gamesCollection = db?.collection('Games');

    if (!territoriesCollection || !playersCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const player = await playersCollection.findOne({ _id: playerId });

    if (!player) {
        throw new Error("Player not found");
    }

    const fromTerritory = await territoriesCollection.findOne({ _id: fromTerritoryId });
    const toTerritory = await territoriesCollection.findOne({ _id: toTerritoryId });

    if (!fromTerritory || !toTerritory) {
        throw new Error("Territories not found");
    }

    if (fromTerritory.owner_id !== player.house || toTerritory.owner_id !== player.house) {
        throw new Error("You can only maneuver armies between your own territories");
    }
    
    const validManeuver = validateManeuver(fromTerritoryId, toTerritoryId, playerId);
    if (!validManeuver) {
        throw new Error("Not a valid maneuver.");
    }

    if (fromTerritory.number_of_armies <= armies) {
        throw new Error("Not enough armies to maneuver.");
    }

    await territoriesCollection.updateOne(
        { _id: fromTerritoryId },
        { $inc: { number_of_armies: -armies } }
    );

    await territoriesCollection.updateOne(
        { _id: toTerritoryId },
        { $inc: { number_of_armies: armies } }
    );

    const wss = getWebSocketServer();
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                action: 'territories-updated',
                data: { fromTerritoryId, toTerritoryId }
            }));
        }
    });

    endPhase(playerId);
};

export const checkGameEnd = async () => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const territoriesCollection = db?.collection('EssosTerritories');
        const cardsCollection = db?.collection('EssosCards');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !territoriesCollection || !cardsCollection || !gamesCollection) {
            throw new Error('Collections not found');
        }

        const ongoingGame = await gamesCollection.findOne({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error('No ongoing game found');
        }

        const endCard = await cardsCollection.findOne({ symbol: Symbol.End, owner_id: { $ne: "in deck" } });
        if (endCard) {
            console.log(`Game (_id: ${ongoingGame._id}) ends because 'Valar Morghulis' card was drawn.`);
            return await calculateScores();
        }

        const players = await playersCollection.find({}).toArray();
        for (const player of players) {
            // if there are more than 2 players its bad, it should count if a players territories count equals with allTerritories count..
            const playerTerritories = await territoriesCollection.countDocuments({ owner_id: player.house });
            if (playerTerritories === 0) {
                console.log(`Game (_id: ${ongoingGame._id}) ends because ${player.house} has no territories.`);
                return await calculateScores();
            }
        }
    } catch (error) {
        console.error('Error checking game end: ', error);
    }
};