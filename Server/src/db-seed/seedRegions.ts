import fs from 'fs';
import path from "path";
import csvParser from 'csv-parser';
import { connectToDb } from "../config/db";
import { exit } from 'process';
import { Region } from '../models/regionsModel';


export const seedRegions = async () => {
    try {
        const db = await connectToDb();
        const regionsCollection = db?.collection('Regions');

        if (!regionsCollection) {
            throw new Error("Regions collection not found");
        }

        const filePath = path.join(__dirname, 'Regions.csv');
        const regions: any[] = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                regions.push({
                    table: row.table,
                    name: row.name,
                    region_bonus: parseInt(row.region_bonus),
                    territory_count: parseInt(row.territory_count),
                });
            })
            .on('end', async () => {
                try {
                    await regionsCollection.deleteMany({});

                    await regionsCollection.insertMany(regions);
                    console.log('Regions seeded successfully.');
                    exit(0);
                } catch (error) {
                    console.error('Error inserting regions');
                }
            });
    } catch (error) {
        console.log('Error during seeding regions: ', error);
        throw error;
    }
};

seedRegions();
//npx ts-node .\src\db-seed\seedRegions.ts