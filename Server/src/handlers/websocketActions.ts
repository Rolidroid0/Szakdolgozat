import { WebSocketServer, WebSocket } from 'ws';
import { shuffle, tradeCardsForArmies } from '../services/cardsService';
import { startGameService } from '../services/startGameService';
import { CustomWebSocket } from '../config/websocket';
import { applyManeuver, endTurn } from '../services/gamesService';
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
            const { playerId, fromTerritoryId, toTerritoryId, armies } = data;
            await startBattle(new ObjectId(playerId), new ObjectId(fromTerritoryId), new ObjectId(toTerritoryId), armies);
            ws.send(JSON.stringify({ action: 'attack-started', data: { success: true } }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            ws.send(JSON.stringify({ action: 'attack-failed', data: { success: false, message: errorMessage } }));
        }
    },
};

export default actions;