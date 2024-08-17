import { ObjectId } from "mongodb";
import { connectToDb } from "../config/db";

function generateShuffledNumbers(n: number) {
    const numbers = Array.from({ length: n}, (_, i) => i);
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
}

export const handleDisconnect = async (playerId: string) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Játékosok');

        await playersCollection?.updateOne(
            { _id: new ObjectId(playerId) },
            { $set: { isLoggedIn: false } }
        );
    } catch (error) {
        console.error('Error during player disconnect:', error);
    }
};

export default generateShuffledNumbers;