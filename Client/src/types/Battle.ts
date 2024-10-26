export interface Battle {
    _id: string;
    game_id: string;
    state: string;
    attacker_id: string;
    defender_id: string;
    attacker_territory_id: string;
    defender_territory_id: string;
    attacker_armies: number;
    defender_armies: number;
    current_attacker_armies: number;
    current_defender_armies: number;
    battle_log: string[];
    round_number: number;
    attacker_rolls: number[];
    defender_rolls: number[];
    attacker_has_rolled: boolean;
    defender_has_rolled: boolean;
}