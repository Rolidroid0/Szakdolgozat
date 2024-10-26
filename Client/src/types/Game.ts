export interface Game {
    _id: string;
    round: number;
    current_player: string;
    players: string[];
    state: string;
    round_state: string;
}