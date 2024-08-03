import { WebSocketServer, WebSocket } from 'ws';
import { shuffle } from '../services/shuffleService';

const actions: Record<string, (wss: WebSocketServer, ws: WebSocket, data: any) => void> = {
    'shuffle-cards': async (wss, ws, data) => {
        try {
            await shuffle(wss);
            console.log('Shuffle complete');
        } catch (error) {
            console.error('Error during shuffle:', error);
        }
    },
    // Add other actions here
};

export default actions;