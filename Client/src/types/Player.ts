export interface Player {
    _id: string;
    house: string;
    plus_armies: number;
    conquered: boolean;
    is_logged_in: boolean;
}