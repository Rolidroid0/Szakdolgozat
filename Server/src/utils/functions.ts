import { ObjectId } from "mongodb";
import { connectToDb } from "../config/db";
import { findConnectedTerritories } from "../services/territoriesService";

function generateShuffledNumbers(n: number) {
    const numbers = Array.from({ length: n}, (_, i) => i);
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
};

export const handleDisconnect = async (playerId: string) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');

        if (!playersCollection) {
            throw new Error("Players collection not found");
        }

        await playersCollection.updateOne(
            { _id: new ObjectId(playerId) },
            { $set: { is_logged_in: false } }
        );
    } catch (error) {
        console.error('Error during player disconnect:', error);
    }
};

export const calculatePlusArmies = async (playerId: ObjectId) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const territoriesCollection = db?.collection('EssosTerritories');
    const regionsCollection = db?.collection('Regions');

    if (!playersCollection || !territoriesCollection || !regionsCollection) {
        throw new Error("Collections not found");
    }
    
    const player = await playersCollection.findOne({ _id: playerId });

    if (!player) {
        throw new Error("No player found");
    }

    const territories = await territoriesCollection.find({ owner_id: player.house }).toArray();

    const territoryCount = territories.length;
    const fortressCount = territories.filter(territory => territory.fortress === 1).length;
    
    let additionalArmies = Math.floor((territoryCount + fortressCount) / 3);

    if (additionalArmies < 3) additionalArmies = 3;

    const regions = await regionsCollection.find({}).toArray();
    for (const region of regions) {
        const ownedTerritoriesInRegion = territories.filter(territory => territory.region === region.name);
        if (ownedTerritoriesInRegion.length === region.territory_count) {
            additionalArmies += region.region_bonus;
        }
    }

    return additionalArmies;
};

export const validateManeuver = async (fromTerritoryId: ObjectId, toTerritoryId: ObjectId, playerId: ObjectId) => {
    const connectedTerritories = await findConnectedTerritories(fromTerritoryId, playerId);
    const isConnected = connectedTerritories.some(t => t._id.equals(toTerritoryId));

    if (!isConnected) {
        throw new Error("The target territory is not connected to the starting territory");
    }

    return true;
};

export const rollDice = async (armies: number) => {
    const rolls = [];
    for (let i = 0; i < Math.min(3, armies); i++) {
        rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    return rolls.sort((a, b) => b - a);
};

export const compareRolls = async (attackerRolls: number[], defenderRolls: number[]) => {
    const minRolls = Math.min(attackerRolls.length, defenderRolls.length);
    let attackerLosses = 0;
    let defenderLosses = 0;

    for (let i = 0; i < minRolls; i++) {
        if (attackerRolls[i] > defenderRolls[i]) {
            defenderLosses++;
        } else {
            attackerLosses++;
        }
    }

    return { attackerLosses, defenderLosses };
};

export default generateShuffledNumbers;