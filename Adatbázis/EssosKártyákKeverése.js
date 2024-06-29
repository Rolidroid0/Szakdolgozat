const connectToDb = require('./AdatbázisCsatlakozás');
const fs = require('fs');
const csv = require('csv-parser');

const kevertSzámokGenerálása = require('./KevertSzámokGenerálása')

async function EssosKártyákKeverése() {
    try {
        const db = await connectToDb();
        const essosKártyák = db.collection('EssosKártyák')

        await essosKártyák.deleteMany({})

        const kevertSzámok = kevertSzámokGenerálása(35)
        let index = 0

        fs.createReadStream('Adatbázis/EssosKártyák.csv', { encoding: 'utf8' })
            .pipe(csv())
            .on('data', async (row) => {
                const kártya = {
                    név: row.név,
                    szimbólum: row.szimbólum,
                    birtokos: null,
                    sorszám: kevertSzámok[index++]
                };
                await essosKártyák.insertOne(kártya);
            })
            .on('end', async () => {
                console.log('Kártyák sikeresen betöltve az adatbázisba.');

                /*const kártyák = await essosKártyák.find({}).sort({ sorszám: 1 }).toArray();
                console.log('Essos kártyák:', kártyák);*/
            });

    } catch (err) {
        console.error('Hiba a kártyák keverése közben', err);
    }
}

EssosKártyákKeverése();
