import { WebSocketServer, WebSocket } from 'ws';
import { shuffle } from '../services/shuffleService';
import { startGameService } from '../services/startGameService';

const actions: Record<string, (wss: WebSocketServer, ws: WebSocket, data: any) => void> = {
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
    // Add other actions here
};

export default actions;