import { Táblák } from "../Típusok/Típusok";

/*import connectToDb from "./AdatbázisCsatlakozás";
import fs from "fs";
import csv from "csv-parser";*/

async function TerületekLétrehozása(táblák: Táblák[]): Promise<any> {
    try {
        console.log(táblák);
    } catch (err) {
        console.error('Hiba a területek létrehozása közben', err);
    }
}

export default TerületekLétrehozása;