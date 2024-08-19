import { Table } from "./enums";


export interface Region {
    table: Table;
    name: string;
    region_bonus: number;
    territory_count: number;
}