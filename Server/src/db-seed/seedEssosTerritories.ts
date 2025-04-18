import fs from 'fs';
import path from "path";
import csvParser from 'csv-parser';
import { connectToDb } from "../config/db";
import { Table } from '../models/enums';
import { exit } from 'process';
import { Territory } from '../models/territoriesModel';


export const seedEssosTerritories = async () => {
    try {
        const db = await connectToDb();
        const essosTerritoriesCollection = db?.collection('EssosTerritories');

        if (!essosTerritoriesCollection) {
            throw new Error("EssosTerritories collection not found");
        }

        const filePath = path.join(__dirname, 'EssosTerritories.csv');
        const essosTerritories: Territory[] = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                essosTerritories.push({
                    table: Table.Essos,
                    name: row.name,
                    fortress: parseInt(row.fortress),
                    port: parseInt(row.port),
                    region: row.region,
                    neighbors: row.neighbors ? row.neighbors.split(',').map((neighbor: string) => neighbor.trim()) : [],
                    owner_id: row.owner_id,
                    number_of_armies: 2,
                    last_attacked_from: parseInt(row.last_attacked_from),
                });
            })
            .on('end', async () => {
                try {
                    await essosTerritoriesCollection.deleteMany({});

                    await essosTerritoriesCollection.insertMany(essosTerritories);

                    for (const territory of essosTerritories) {
                        const neighborTerritories = await essosTerritoriesCollection.find({
                            name: { $in: territory.neighbors }
                        }).toArray();

                        await essosTerritoriesCollection.updateOne(
                            { name: territory.name },
                            { $set: { neighbors: neighborTerritories.map(t => t._id) } }
                        );
                    }

                    console.log('Essos territories seeded successfully.');
                    exit(0);
                } catch (error) {
                    console.error('Error inserting Essos territories');
                }
            });
    } catch (error) {
        console.log('Error during seeding Essos territories: ', error);
        throw error;
    }
};

seedEssosTerritories();
//npx ts-node .\src\db-seed\seedEssosTerritories.ts