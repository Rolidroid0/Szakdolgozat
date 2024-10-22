import { ObjectId } from "mongodb";
import { Table } from "./enums";


export interface Region {
    _id: ObjectId;
    table: Table;
    name: string;
    region_bonus: number;
    territory_count: number;
}