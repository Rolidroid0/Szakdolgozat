import { connectToDb } from '../config/db';
import csv from 'csv-parser';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import generateShuffledNumbers from '../utils/functions';


export const shuffle = async (wss: WebSocketServer) => {
    try {
        const db = await connectToDb();
        const essosCards = db?.collection('EssosKártyák');

        //törölni innen
        const kártyák = await essosCards?.find({}).sort({ sorszám: 1 }).toArray();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ message: kártyák }));
            }
        });
        console.log(kártyák);
        //idáig

        /*await essosCards?.deleteMany({});

        const shuffledNumbers = generateShuffledNumbers(35);
        let index = 0;

        fs.createReadStream('Adatbázis/EssosKártyák.csv', { encoding: 'utf8' })
            .pipe(csv())
            .on('data', async (row) => {
                const kártya = {
                    név: row.név,
                    szimbólum: row.szimbólum,
                    birtokos: null,
                    sorszám: shuffledNumbers[index++]
                };
                await essosCards?.insertOne(kártya);
            })
            .on('end', async () => {
                console.log('Kártyák sikeresen betöltve az adatbázisba.');

                // WebSocket értesítés küldése a klienseknek
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ message: 'Kártyák sikeresen betöltve az adatbázisba.' }));
                    }
                });

                // Az adatbázisban lévő kártyák kiíratása (opcionális)
                const kártyák = await essosCards?.find({}).sort({ sorszám: 1 }).toArray();
                console.log('Essos kártyák:', kártyák);
            });*/
    } catch (error) {
        console.error('An error occured when shuffling the cards:', error);
    }
};

export default shuffle;