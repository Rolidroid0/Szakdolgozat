import { connectToDb } from '../config/db';
import csv from 'csv-parser';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import generateShuffledNumbers from '../utils/functions';
import { ObjectId } from 'mongodb';


export const shuffle = async (wss: WebSocketServer) => {
    try {
        const db = await connectToDb();
        const essosCards = db?.collection('EssosCards');

        if (!essosCards) {
            console.error('EssosCards collection not found');
            return;
        }

        const cardCount = await essosCards.countDocuments();
        const shuffledNumbers = generateShuffledNumbers(cardCount);

        const cardsCursor = essosCards.find({});
        let index = 0;
        while (await cardsCursor.hasNext()) {
            const card = await cardsCursor.next();
            if (card) {
                await essosCards.updateOne(
                    { _id: card._id },
                    { $set: { sequence_number: shuffledNumbers[index] } }
                );
                index++;
            }
        }
        
        const shuffledCards = await essosCards.find({}).toArray();

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'shuffle-cards', cards: shuffledCards }));
            }
        });

        console.log('Shuffle complete');
    } catch (error) {
        console.error('An error occured when shuffling the cards:', error);
    }
};

export const getPlayerCardsService = async (playerId: string) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const cardsCollection = db?.collection('EssosCards');

    if (!playersCollection || !cardsCollection) {
        throw new Error("Collections not found");
    }

    const player = await playersCollection.findOne({ _id: new ObjectId(playerId) });
    if (!player) {
        throw new Error("Player not found");
    }

    const playerCards = await cardsCollection.find({ owner_id: player.house }).toArray();

    return playerCards;
}

export const tradeCardsForArmies = async (playerId: ObjectId, cardIds: ObjectId[]) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const cardsCollection = db?.collection('EssosCards');

    if (!playersCollection || !cardsCollection) {
        throw new Error("Collections not found");
    }

    const player = await playersCollection.findOne({ _id: playerId });
    if (!player) {
        throw new Error("Player not found");
    }

    const selectedCards = await cardsCollection.find({ _id: { $in: cardIds }, owner_id: player.house }).toArray();

    if (selectedCards.length !== 3) {
        throw new Error("You must trade exactly 3 cards");
    }

    const additionalArmies = 5; //Ide ki kell számolni, hogy mennyi lesz + ha a terület a játékosé, akkor arra a területre +2 sereg
    await playersCollection.updateOne(
        { _id: playerId },
        { $inc: { plus_armies: additionalArmies } }
    );

    await cardsCollection.updateMany({ _id: { $in: cardIds } }, { owner_id: "usedThisGame"});

    return additionalArmies;
};

export default shuffle;