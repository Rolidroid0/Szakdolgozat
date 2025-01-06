import { GameState } from "../models/typesForAI";
import { startBattle } from "../services/battlesService";
import { getOngoingGameState } from "../services/gamesService";
import { AttackDecisionMaker } from "./decisionMaker";

export const processAIAction = async () => {
    try {
        const gameState: GameState = await getOngoingGameState();
        const decision = AttackDecisionMaker.decideAttack(gameState);

        if (decision) {
            await startBattle(gameState.current_player_id, decision.fromTerritoryId, decision.toTerritoryId, decision.armies);
            console.log('Attack started from AI side');
        } else {
            console.log('No attack started from AI side');
        }
    } catch (error) {
        console.error('Error processing AI action: ', error);
    }
};