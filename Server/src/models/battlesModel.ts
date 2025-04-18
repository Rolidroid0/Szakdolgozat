export interface Battle {
    _id: string;
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
    attackerRolls: number[];
    defenderRolls: number[];
    hasAttackerRolled: boolean;
    hasDefenderRolled: boolean;
}