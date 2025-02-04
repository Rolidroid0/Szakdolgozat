import { promises as fs } from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';
import { connectToDb } from "../config/db";
import { Card } from '../models/cardsModel';
import { Table } from '../models/enums';
import { exit } from 'process';
import { Game } from '../models/gamesModel';


export const seedEssosCards = async () => {
    try {
        const db = await connectToDb();
        const essosCardsCollection = db?.collection('EssosCards');
        const gamesCollection = db?.collection('Games');

        if (!essosCardsCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const filePath = path.join(__dirname, 'EssosCards.csv');
        const fileContent = await fs.readFile(filePath, 'utf-8');

        const essosCards: any[] = [];

        fileContent.split('\n').forEach((line, index) => {
            if (index === 0) return;
            const [name, symbol] = line.split(',');
            essosCards.push({
                game_id: ongoingGame._id,
                table: Table.Essos,
                name: name.trim(),
                symbol: symbol.trim(),
                sequence_number: null,
                owner_id: "in deck",
            });
        });

        await essosCardsCollection.insertMany(essosCards);
        console.log('Essos cards seeded successfully.');

        /*fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                essosCards.push({
                    game_id: ongoingGame._id,
                    table: Table.Essos,
                    name: row.name,
                    symbol: row.symbol,
                    sequence_number: null,
                    owner_id: "in deck",
                });
            })
            .on('end', async () => {
                try {
                    //await essosCardsCollection.deleteMany({ game_id: ongoingGame._id });

                    await essosCardsCollection.insertMany(essosCards);
                    console.log('Essos cards seeded successfully.');
                    //exit(0);
                } catch (error) {
                    console.error('Error inserting Essos cards');
                }
            });*/
    } catch (error) {
        console.log('Error during seeding Essos cards: ', error);
        throw error;
    }
};

//seedEssosCards();
//npx ts-node .\src\db-seed\seedEssosCards.ts