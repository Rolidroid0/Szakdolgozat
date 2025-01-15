import { ObjectId } from "mongodb";
import { Territory } from "./territoriesModel";

export interface GameState {
    _id: ObjectId;
    current_player: string;
    current_player_id: ObjectId;
    players: string[];
    state: string;
    round: number;
    round_state: string;
    territories: Territory[];
}

export interface AttackDecision {
    fromTerritoryId: ObjectId;
    toTerritoryId: ObjectId;
    armies: number;
}