import fs from 'fs/promises';
import path from "path";
import csvParser from 'csv-parser';
import { connectToDb } from "../config/db";
import { Table } from '../models/enums';
import { exit } from 'process';
import { Territory } from '../models/territoriesModel';
import { Game } from '../models/gamesModel';


export const seedEssosTerritories = async () => {
    try {
        const db = await connectToDb();
        const essosTerritoriesCollection = db?.collection('EssosTerritories');
        const gamesCollection = db?.collection('Games');

        if (!essosTerritoriesCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const filePath = path.join(__dirname, 'EssosTerritories.csv');
        const fileContent = await fs.readFile(filePath, 'utf-8');

        const essosTerritories: any[] = fileContent
            .split('\n')
            .slice(1)
            .filter(line => line.trim())
            .map(line => {
                const [name, fortress, port, region, neighbors, owner_id, last_attacked_from] = line.split(',');

                return {
                    game_id: ongoingGame._id,
                    table: Table.Essos,
                    name: name.trim(),
                    fortress: parseInt(fortress.trim()),
                    port: parseInt(port.trim()),
                    region: region.trim(),
                    neighbors: neighbors ? neighbors.split(';').map(n => n.trim()) : [],
                    owner_id: owner_id.trim(),
                    number_of_armies: 2,
                    last_attacked_from: parseInt(last_attacked_from.trim()),
                };
            });

        await essosTerritoriesCollection.insertMany(essosTerritories);

        for (const territory of essosTerritories) {
            const neighborTerritories = await essosTerritoriesCollection.find<Territory>({
                name: { $in: territory.neighbors }
            }).toArray();

            await essosTerritoriesCollection.updateOne(
                { name: territory.name },
                { $set: { neighbors: neighborTerritories.map(t => t._id) } }
            );
        }

        console.log('Essos territories seeded successfully.');

        //const essosTerritories: any[] = [];
        /*fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                essosTerritories.push({
                    game_id: ongoingGame._id,
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
                    //await essosTerritoriesCollection.deleteMany({ game_id: ongoingGame._id });

                    await essosTerritoriesCollection.insertMany(essosTerritories);

                    for (const territory of essosTerritories) {
                        const neighborTerritories = await essosTerritoriesCollection.find<Territory>({
                            name: { $in: territory.neighbors }
                        }).toArray();

                        await essosTerritoriesCollection.updateOne(
                            { name: territory.name },
                            { $set: { neighbors: neighborTerritories.map(t => t._id) } }
                        );
                    }

                    console.log('Essos territories seeded successfully.');
                    //exit(0);
                } catch (error) {
                    console.error('Error inserting Essos territories');
                }
            });*/
    } catch (error) {
        console.log('Error during seeding Essos territories: ', error);
        throw error;
    }
};

//seedEssosTerritories();
//npx ts-node .\src\db-seed\seedEssosTerritories.ts