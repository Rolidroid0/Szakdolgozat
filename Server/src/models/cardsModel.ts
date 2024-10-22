import { ObjectId } from "mongodb";
import { Symbol, Table } from "./enums";

export interface Card {
    _id: ObjectId;
    game_id: ObjectId;
    table: Table;
    name: string;
    symbol: Symbol;
    owner_id: string | null;
    sequence_number: number | null;
}