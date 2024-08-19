import fs from 'fs';
import path from "path";
import csvParser from 'csv-parser';
import { connectToDb } from "../config/db";
import { Card } from '../models/cardsModel';
import { Table } from '../models/enums';
import { exit } from 'process';


export const seedEssosCards = async () => {
    try {
        const db = await connectToDb();
        const essosCardsCollection = db?.collection('EssosCards');

        if (!essosCardsCollection) {
            throw new Error("EssosCards collection not found");
        }

        const filePath = path.join(__dirname, 'EssosCards.csv');
        const essosCards: Card[] = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                essosCards.push({
                    table: Table.Essos,
                    name: row.name,
                    symbol: row.symbol,
                    sequence_number: null,
                    owner_id: null,
                });
            })
            .on('end', async () => {
                try {
                    await essosCardsCollection.deleteMany({});

                    await essosCardsCollection.insertMany(essosCards);
                    console.log('Essos cards seeded successfully.');
                    exit(0);
                } catch (error) {
                    console.error('Error inserting Essos cards');
                }
            });
    } catch (error) {
        console.log('Error during seeding Essos cards: ', error);
        throw error;
    }
};

seedEssosCards();
//npx ts-node .\src\db-seed\seedEssosCards.ts