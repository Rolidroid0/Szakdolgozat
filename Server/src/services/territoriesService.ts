import { connectToDb } from "../config/db"

export const getTerritories = async () => {
    const db = await connectToDb();
    const territoriesCollection = db?.collection('EssosTerritories');

    if (!territoriesCollection) {
        throw new Error("Territories collection not found");
    }

    const territories = await territoriesCollection.find({}).toArray();
    return territories;
};