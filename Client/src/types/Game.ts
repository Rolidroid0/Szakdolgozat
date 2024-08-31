export interface Game {
    _id: string;
    round: number;
    currentPlayer: string;
    players: string[];
    state: string;
    roundState: string;
}