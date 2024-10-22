import { ObjectId } from "mongodb";

export interface Player {
    _id: ObjectId;
    game_id: ObjectId;
    house: string;
    plus_armies: number;
    conquered: boolean;
    is_logged_in: boolean;
}