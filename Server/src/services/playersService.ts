import { connectToDb } from "../config/db"
import { ObjectId } from "mongodb";
import { Player } from "../models/playersModel";
import { Game } from "../models/gamesModel";

export const getPlayers = async () => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');

    if (!playersCollection) {
        throw new Error("Players collection not found");
    }

    const players = await playersCollection.find<Player>({}).toArray();
    return players;
};

export const getPlayerById = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');

        if (!playersCollection) {
            throw new Error("Players collection not found");
        }

        const player = await playersCollection.findOne<Player>({ _id: new ObjectId(playerId) });
        if (!player) {
            throw new Error("Player not found");
        }
        
        return player;
    } catch (error) {
        console.error('Error getting player: ', error);
        throw error;
    }
};

export const generatePlayers = async (numberOfPlayers: number) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');

        if (!playersCollection) {
            throw new Error("Players collection not found");
        }

        await playersCollection.deleteMany({});

        const defaultPlayers = [
            { house: 'Targaryen', plus_armies: 0, conquered: false, is_logged_in: false},
            { house: 'Ghiscari', plus_armies: 0, conquered: false, is_logged_in: false}
        ]

        const players = defaultPlayers.slice(0, numberOfPlayers);

        await playersCollection.insertMany(players);

    } catch (error) {
        console.error('Error during generating players: ', error);
        throw error;
    }
};

export const loginPlayer = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !gamesCollection) {
            throw new Error('Collections not found');
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            return { success: false, message: 'No ongoing game found, start a new one' };
        }

        const player = await playersCollection.findOne<Player>({ _id: playerId });

        if (player?.is_logged_in) {
            return { success: false, message: 'This house is already occupied' };
        }

        await playersCollection.updateOne(
            { _id: playerId },
            { $set: { is_logged_in: true } }
        );

        return { success: true, message: 'Login successful' };
    } catch (error) {
        console.error('Error during player login: ', error);
        throw error;
    }
};

export const logoutPlayer = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');

        if (!playersCollection) {
            throw new Error('Collection not found');
        }

        await playersCollection.updateOne(
            { _id: playerId },
            { $set: { is_logged_in: false } }
        );
    } catch (error) {
        console.error('Error during player logout: ', error);
        throw error;
    }
}