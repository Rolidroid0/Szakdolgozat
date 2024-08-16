import { connectToDb } from "../config/db"


export const getPlayers = async () => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Játékosok');

    if (!playersCollection) {
        throw new Error("Players collection not found");
    }

    const players = await playersCollection.find({}).toArray();
    return players;
}