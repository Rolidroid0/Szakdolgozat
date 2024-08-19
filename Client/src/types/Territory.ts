export interface Territory {
    _id: string;
    name: string;
    fortress: number;
    port: number;
    region: string;
    neighbors: string[];
    owner_id: string;
    last_attacked_from: number;
}