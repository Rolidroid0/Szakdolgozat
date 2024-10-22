import { ObjectId } from "mongodb";
import { Table } from "./enums";

export interface Territory {
    _id: ObjectId;
    game_id: ObjectId;
    table: Table;
    name: string;
    fortress: number;
    port: number;
    region: string;
    neighbors: ObjectId[];
    owner_id: string;
    number_of_armies: number;
    last_attacked_from: number;
}