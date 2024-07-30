import { connectToDb } from '../config/db';
import csv from 'csv-parser';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import kevertSzámokGenerálása from '../utils/függvények';


export const keverés = async (wss: WebSocketServer) => {
    try {
        const db = await connectToDb();
        const essosKártyák = db?.collection('EssosKártyák');
        
        await essosKártyák?.deleteMany({});
        
        const kevertSzámok = kevertSzámokGenerálása(35);
        let index = 0;
        
        fs.createReadStream('Adatbázis/EssosKártyák.csv', { encoding: 'utf8' })
            .pipe(csv())
            .on('data', async (row) => {
                const kártya = {
                    név: row.név,
                    szimbólum: row.szimbólum,
                    birtokos: null,
                    sorszám: kevertSzámok[index++]
                };
                await essosKártyák?.insertOne(kártya);
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
                const kártyák = await essosKártyák?.find({}).sort({ sorszám: 1 }).toArray();
                console.log('Essos kártyák:', kártyák);
            });
    } catch (error) {
        console.error('Hiba történt a kártyák keverése során:', error);
    }
};

export default keverés;