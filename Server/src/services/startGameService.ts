import { WebSocketServer, WebSocket } from 'ws';
import { connectToDb } from "../config/db";
import { getWebSocketServer } from "../config/websocket";
import shuffle from './cardsService';
import { allocateTerritories } from './territoriesService';
import { generatePlayers } from './playersService';
import { applyAdditionalArmies } from './gamesService';


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
        await shuffle(getWebSocketServer());

        await generatePlayers(2);

        const defaultPlayers = await playersCollection.find({}).toArray();

        await allocateTerritories();

        await applyAdditionalArmies(defaultPlayers[0]._id);

        const newGame = {
            round: 1,
            currentPlayer: defaultPlayers[0].house,
            players: defaultPlayers.map(p => p.house),
            state: "ongoing",
            roundState: "reinforcement"
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