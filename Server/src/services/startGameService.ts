import { WebSocketServer, WebSocket } from 'ws';
import { connectToDb } from "../config/db";
import { getWebSocketServer } from "../config/websocket";


export const startGameService = async () => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Játékosok');

        if (!playersCollection) {
            throw new Error("Players collection not found");
        }

        await playersCollection.deleteMany({});

        const defaultPlayers = [
            { house: 'Targaryen', plusArmies: 0, conquered: false, isLoggedIn: false},
            { house: 'Ghiscari', plusArmies: 0, conquered: false, isLoggedIn: false}
        ]

        const result = await playersCollection.insertMany(defaultPlayers);

        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'start-game', success: true, players: result }));
            }
        });

        return result;

    } catch (error) {
        console.error('Error during game start:', error);
        throw error;
    }
};