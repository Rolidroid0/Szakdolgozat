import { connectToDb } from "../config/db"
import { ObjectId } from "mongodb";

export const getPlayers = async () => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');

    if (!playersCollection) {
        throw new Error("Players collection not found");
    }

    const players = await playersCollection.find({}).toArray();
    return players;
};

export const loginPlayer = async (playerId: string) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');

        const player = await playersCollection?.findOne({ _id: new ObjectId(playerId) });

        if (player?.isLoggedIn) {
            return { success: false, message: 'This house is already occupied' };
        }

        await playersCollection?.updateOne(
            { _id: new ObjectId(playerId) },
            { $set: { isLoggedIn: true } }
        );

        return { success: true, message: 'Login successful' };
    } catch (error) {
        console.error('Error during player login: ', error);
        throw error;
    }
};

export const logoutPlayer = async (playerId: string) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');

        await playersCollection?.updateOne(
            { _id: new ObjectId(playerId) },
            { $set: { isLoggedIn: false } }
        );
    } catch (error) {
        console.error('Error during player logout: ', error);
        throw error;
    }
}