import { WebSocketServer, WebSocket } from 'ws';
import { shuffle, tradeCardsForArmies } from '../services/cardsService';
import { startGameService } from '../services/startGameService';
import { CustomWebSocket } from '../config/websocket';
import { applyManeuver, automataBattle, automataTurn, endTurn, getGameStateById, getOngoingGameState, startNewGame } from '../services/gamesService';
import { ObjectId } from 'mongodb';
import { reinforceTerritory } from '../services/territoriesService';
import { startBattle } from '../services/battlesService';

const actions: Record<string, (ws: CustomWebSocket, data: any) => void> = {
    'shuffle-cards': async (ws, data) => {
        try {
            await shuffle();
            console.log('Shuffle complete');
        } catch (error) {
            console.error('Error during shuffle: ', error);
        }
    },
    'start-game': async (ws, data) => {
        try {
            await startGameService();
            console.log('Game started successfully');
        } catch (error) {
            console.log('Error during game start: ', error);
        }
    },
    'set-player-id': (ws, data) => {
        ws.playerId = data.playerId;
        console.log(`Player ID set for WebSocket: ${ws.playerId}`);
    },
    'end-of-player-turn': async (ws, data) => {
        try {
            const playerId = data.playerId;
            await endTurn(new ObjectId(playerId));
            console.log('Players turn ended');
        } catch (error) {
            console.log('Error during ending players turn: ', error);
            if (error instanceof Error) {
                const errorMessage = error.message;
                ws.send(JSON.stringify({ action: 'error', errorMessage }));
            }
        }
    },
    'trade-cards': async (ws, data) => {
        try {
            const { playerId, cardIds } = data;
            const additionalArmies = await tradeCardsForArmies(new ObjectId(playerId), cardIds);

            ws.send(JSON.stringify({ action: 'cards-traded', data: { success: true, additionalArmies } }));
        } catch (error) {
            ws.send(JSON.stringify({ action: 'cards-traded', data: { success: false, message: error } }));
        }
    },
    'reinforce-territory': async (ws, data) => {
        try {
            const { playerId, territoryId, armies } = data;
            await reinforceTerritory(new ObjectId(playerId), new ObjectId(territoryId), armies);

            ws.send(JSON.stringify({ action: 'territory-reinforced', data: { success: true } }));
        } catch (error) {
            ws.send(JSON.stringify({ action: 'territory-reinforced', data: { success: false, message: error } }));
        }
    },
    'maneuver': async (ws, data) => {
        try {
            const { playerId, fromTerritoryId, toTerritoryId, armies } = data;
            await applyManeuver(new ObjectId(playerId), new ObjectId(fromTerritoryId), new ObjectId(toTerritoryId), armies);

            ws.send(JSON.stringify({ action: 'maneuver-done', data: { success: true } }));
        } catch (error) {
            ws.send(JSON.stringify({ action: 'maneuver-done', data: { success: false, message: error } }));
        }
    },
    'start-battle': async (ws, data) => {
        try {
            const { playerId, fromTerritoryId, toTerritoryId, armies, requestId } = data;
            await startBattle(new ObjectId(playerId), new ObjectId(fromTerritoryId), new ObjectId(toTerritoryId), armies);
            ws.send(JSON.stringify({ action: 'attack-started', data: { success: true }, request_id: requestId }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            ws.send(JSON.stringify({ action: 'attack-failed', data: { success: false, message: errorMessage }, request_id: data.requestId }));
        }
    },
    //Python actions
    'start-new-game': async (ws, data) => {
        try {
            const { requestId } = data;
            await startNewGame();
            ws.send(JSON.stringify({ action: 'new-game-started', data: { success: true }, request_id: requestId }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            ws.send(JSON.stringify({ action: 'new-game-failed-to-start', data: { success: false, message: errorMessage }, request_id: data.requestId }));
        }
    },
    'get-game-state': async (ws, data) => {
        try {
            const { requestId } = data;
            const response = await getOngoingGameState();
            ws.send(JSON.stringify({ action: 'received-game-state', data: { success: true, raw_state: response }, request_id: requestId }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            ws.send(JSON.stringify({ action: 'failed-to-receice-game-state', data: { success: false, message: errorMessage }, request_id: data.requestId }));
        }
    },
    'automata-battle': async (ws, data) => {
        try {
            const { requestId } = data;
            const response = await automataBattle();
            ws.send(JSON.stringify({ action: 'done-automata-battle', data: { success: true, reward: response }, request_id: requestId }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            ws.send(JSON.stringify({ action: 'failed-to-do-automata-battle', data: { success: false, message: errorMessage }, request_id: data.requestId }));
        }
    },
    'automata-turn': async (ws, data) => {
        try {
            const { requestId } = data;
            const response = await automataTurn();
            ws.send(JSON.stringify({ action: 'done-automata-turn', data: { success: true, reward: response }, request_id: requestId }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            ws.send(JSON.stringify({ action: 'failed-to-do-automata-turn', data: { success: false, message: errorMessage }, request_id: data.requestId }));
        }
    },
    'get-game-state-by-id': async (ws, data) => {
        try {
            const { gameId, requestId } = data;
            const response = await getGameStateById(new ObjectId(gameId));
            ws.send(JSON.stringify({ action: 'received-game-state-by-id', data: { success: true, raw_state: response }, request_id: requestId }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            ws.send(JSON.stringify({ action: 'failed-to-receice-game-state-by-id', data: { success: false, message: errorMessage }, request_id: data.requestId }));
        }
    },
};

export default actions;