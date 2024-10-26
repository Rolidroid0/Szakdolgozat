import { ObjectId } from "mongodb";
import { RoundState } from "./enums";

export interface Game {
    _id: ObjectId;
    round: number;
    current_player: string;
    players: string[];
    state: string;
    round_state: RoundState;
}