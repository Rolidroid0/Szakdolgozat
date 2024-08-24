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

export const calculatePlusArmies = async (playerId: ObjectId) => {
    /*// 1. Lekérdezzük a játékost és a hozzá tartozó területeket az adatbázisból
    const player = await playersCollection.findOne({ _id: playerId });
    const territories = await territoriesCollection.find({ owner_id: playerId }).toArray();
    
    // 2. Példa szabályok: Egy alap 3 sereg plusz, és minden 3 területért egy extra sereg
    let additionalArmies = 3; // Minimum seregszám minden kör elején

    // Számoljuk meg a játékos által birtokolt területek számát
    const territoryCount = territories.length;
    
    // Minden 3 területért adunk egy extra sereget
    additionalArmies += Math.floor(territoryCount / 3);

    // 3. Itt adhatunk bónuszokat (pl. kontinens birtoklása)
    // ... implementálható extra bónusz logika

    return additionalArmies;*/
    return 0;
}

export default generateShuffledNumbers;