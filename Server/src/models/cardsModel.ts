import { Symbol, Table } from "./enums";


export interface Card {
    table: Table;
    name: string;
    symbol: Symbol;
    owner_id: string | null;
    sequence_number: number | null;
}