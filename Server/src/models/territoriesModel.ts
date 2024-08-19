import { Table } from "./enums";

export interface Territory {
    table: Table;
    name: string;
    fortress: number;
    port: number;
    region: string;
    neighbors: Territory[];
    owner_id: string;
    last_attacked_from: number;
}