import { WebSocketServer, WebSocket } from 'ws';
import { connectToDb } from "../config/db";
import { getWebSocketServer } from "../config/websocket";
import shuffle from './cardsService';
import { allocateTerritories } from './territoriesService';
import { generatePlayers } from './playersService';
import { applyAdditionalArmies } from './gamesService';
import { Game } from '../models/gamesModel';
import { Player } from '../models/playersModel';
import { RoundState } from '../models/enums';
import { seedEssosCards } from '../db-seed/seedEssosCards';
import { seedEssosTerritories } from '../db-seed/seedEssosTerritories';


export const startGameService = async () => {
    try {
        const db = await connectToDb();
        const gamesCollection = db?.collection('Games');
        const playersCollection = db?.collection('Players');
        const battlesCollection = db?.collection('Battles');
        const cardsCollection = db?.collection('EssosCards');

        if (!gamesCollection || !playersCollection || !battlesCollection || !cardsCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

        if (ongoingGame) {
            await gamesCollection.updateOne(
                { _id: ongoingGame._id },
                { $set: { state: "terminated" } }
            );
        }

        const newGame = {
            round: 1,
            current_player: "",
            players: [],
            state: "ongoing",
            round_state: RoundState.Reinforcement
        }

        const gameResult = await gamesCollection.insertOne(newGame);

        await seedEssosCards();
        //await cardsCollection.updateMany({}, { $set: { owner_id: "in deck" } });
        await shuffle();

        await generatePlayers(2);

        const defaultPlayers = await playersCollection.find<Player>({ game_id: gameResult.insertedId }).toArray();

        await gamesCollection.updateOne(
            { _id: gameResult.insertedId },
            { $set: { 
                current_player: defaultPlayers[0].house,
                players: defaultPlayers.map(p => p.house) } }
        );

        await seedEssosTerritories();
        await allocateTerritories();

        await applyAdditionalArmies(defaultPlayers[0]._id);
        
        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ 
                    action: 'start-game',
                    success: true,
                    data: {
                    gameId: gameResult.insertedId,
                    players: defaultPlayers
                    }
                }));
            }
        });

        return gameResult;

    } catch (error) {
        console.error('Error during game start:', error);
        throw error;
    }
};