import { Territory } from '../models/territoriesModel';
import { GameState, AttackDecision } from '../models/typesForAI';

export class AttackDecisionMaker {
    static decideAttack(gameState: GameState): AttackDecision | null {
        const territories = gameState.territories;

        const ownedTerritories = territories.filter(t => t.owner_id === gameState.current_player && t.number_of_armies > 1);

        let bestAttack: AttackDecision | null = null;
        let bestScore = 0;

        for (const territory of ownedTerritories) {
            const neighbors = territory.neighbors
                .map(name => territories.find(t => t.name === name))
                .filter(t => t && t.owner_id !== gameState.current_player) as Territory[];

            for (const neighbor of neighbors) {
                const attackableArmies = territory.number_of_armies - 1;
                const score = this.evaluateAttack(territory, neighbor, attackableArmies);

                if (score > bestScore) {
                    bestScore = score;
                    bestAttack = {
                        fromTerritoryId: territory._id,
                        toTerritoryId: neighbor._id,
                        armies: attackableArmies,
                    };
                }
            }
        }

        return bestScore > 0 ? bestAttack : null;
    }

    private static evaluateAttack(from: Territory, to: Territory, armies: number): number {
        const advantage = armies - to.number_of_armies;

        if (advantage <= 0) return 0;

        return advantage + (to.port ? 1 : 0) + (to.fortress ? 2 : 0) + (from.fortress ? -1 : 0);
    }
}
