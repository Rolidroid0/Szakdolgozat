import { WebSocketServer, WebSocket } from 'ws';
import { shuffle } from '../services/shuffleService';
import { startGameService } from '../services/startGameService';
import { CustomWebSocket } from '../config/websocket';
import { endTurn } from '../services/gamesService';

const actions: Record<string, (wss: WebSocketServer, ws: CustomWebSocket, data: any) => void> = {
    'shuffle-cards': async (wss, ws, data) => {
        try {
            await shuffle(wss);
            console.log('Shuffle complete');
        } catch (error) {
            console.error('Error during shuffle: ', error);
        }
    },
    'start-game': async (wss, ws, data) => {
        try {
            await startGameService();
            console.log('Game started successfully');
        } catch (error) {
            console.log('Error during game start: ', error);
        }
    },
    'set-player-id': (wss, ws, data) => {
        ws.playerId = data.playerId;
        console.log(`Player ID set for WebSocket: ${ws.playerId}`);
    },
    'end-of-player-turn': async (wss, ws, data) => {
        try {
            await endTurn(wss, data);
            console.log('Players turn ended');
        } catch (error) {
            console.log('Error during ending players turn: ', error);
        }
    }
};

export default actions;