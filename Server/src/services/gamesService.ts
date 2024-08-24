import { WebSocketServer } from "ws";
import { connectToDb } from "../config/db";

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

export const endTurn = async (wss: WebSocketServer) => {

    //end turn logikája ide

    const currentRound = null;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ action: 'round-updated', currentRound: currentRound }));
        }
    });
};