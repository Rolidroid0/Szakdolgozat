import { ObjectId } from "mongodb";
import { RoundState } from "./enums";

export interface Game {
    _id: ObjectId;
    round: number;
    currentPlayer: string;
    players: string[];
    state: string;
    roundState: RoundState;
}