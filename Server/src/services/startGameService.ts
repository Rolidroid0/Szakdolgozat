import { WebSocketServer, WebSocket } from 'ws';
import { connectToDb } from "../config/db";
import { getWebSocketServer } from "../config/websocket";


export const startGameService = async () => {
    try {
        const db = await connectToDb();
        const gamesCollection = db?.collection('Games');
        const playersCollection = db?.collection('Players');
        const battlesCollection = db?.collection('Battles');
        const cardsCollection = db?.collection('EssosCards');

        if (!gamesCollection || !playersCollection || !battlesCollection || !cardsCollection) {
            throw new Error("Required collections not found");
        }

        const ongoingGame = await gamesCollection.findOne({ state: "ongoing" });

        if (ongoingGame) {
            await gamesCollection.updateOne(
                { _id: ongoingGame._id },
                { $set: { state: "terminated" } }
            );
        }

        await battlesCollection.deleteMany({});
        await cardsCollection.updateMany({}, { $set: { owner_id: null } });
        await playersCollection.deleteMany({});

        const defaultPlayers = [
            { house: 'Targaryen', plusArmies: 0, conquered: false, isLoggedIn: false},
            { house: 'Ghiscari', plusArmies: 0, conquered: false, isLoggedIn: false}
        ]

        await playersCollection.insertMany(defaultPlayers);

        const newGame = {
            round: 1,
            currentPlayer: defaultPlayers[0].house,
            players: defaultPlayers.map(p => p.house),
            state: "ongoing"
        }

        const gameResult = await gamesCollection.insertOne(newGame);
        
        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ 
                    action: 'start-game',
                    success: true,
                    gameId: gameResult.insertedId,
                    players: defaultPlayers
                }));
            }
        });

        return gameResult;

    } catch (error) {
        console.error('Error during game start:', error);
        throw error;
    }
};