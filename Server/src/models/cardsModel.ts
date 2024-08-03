import { Symbol, Table } from "./enums";


export interface Card {
    table: Table;
    name: string;
    symbol: Symbol;
    owner: string;
    numberInDeck: number;
}