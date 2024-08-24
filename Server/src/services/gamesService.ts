import { WebSocketServer } from "ws";
import { connectToDb } from "../config/db";
import { calculatePlusArmies } from "../utils/functions";
import { ObjectId } from "mongodb";

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

    const { round, currentPlayer } = ongoingGame;

    return { round, currentPlayer };
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

    const players = await playersCollection.find({}).sort({ _id: 1 }).toArray();

    const currentPlayerIndex = players.findIndex(player => player._id.equals(data.currentPlayerId));

    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    const ongoingGame = await gamesCollection.findOne({ state: "ongoing" });

    if (!ongoingGame) {
        throw new Error("No ongoing game found");
    }
    
    let currentRound = ongoingGame.round;
    if (nextPlayerIndex === 0) {
        currentRound += 1;
    }

    const nextPlayer = players[nextPlayerIndex];

    if (nextPlayer) {
        await applyAdditionalArmies(nextPlayer._id);

        await gamesCollection.updateOne(
            { state: "ongoing" },
            { $set: { currentPlayer: nextPlayer.hosue, round: currentRound } }
        );

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'round-updated', currentRound: currentRound }));
            }
        });
    } else {
        console.error('No next player found');
    }
};