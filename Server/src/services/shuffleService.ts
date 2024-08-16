import { connectToDb } from '../config/db';
import csv from 'csv-parser';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import generateShuffledNumbers from '../utils/functions';


export const shuffle = async (wss: WebSocketServer) => {
    try {
        const db = await connectToDb();
        const essosCards = db?.collection('EssosKártyák');

        if (!essosCards) {
            console.error('EssosKártyák collection not found');
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
                    { $set: { sorszám: shuffledNumbers[index] } }
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

export default shuffle;