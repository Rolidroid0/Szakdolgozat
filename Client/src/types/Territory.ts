export interface Territory {
    _id: string;
    name: string;
    fortress: number;
    port: number;
    region: string;
    neighbors: string[];
    owner_id: string;
    number_of_armies: number;
    last_attacked_from: number;
}