import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import actions from '../handlers/websocketActions';
import { handleDisconnect } from '../utils/functions';

export interface CustomWebSocket extends WebSocket {
    playerId?: string;
}

let wss: WebSocketServer;

export const initializeWebSocket = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: CustomWebSocket) => {
        console.log('New client connected');

        ws.on('message', (message: string) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                console.log('Received message:', parsedMessage);

                if (parsedMessage.playerId) {
                    ws.playerId = parsedMessage.playerId;
                }

                const action = actions[parsedMessage.action];
                if (action) {
                    action(wss, ws, parsedMessage.data);
                } else {
                    console.error('Unknown action:', parsedMessage.action);
                }
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        });

        ws.on('close', () => {
            if (ws.playerId) {
                console.log(`Client disconnected: Player ID ${ws.playerId}`);
                handleDisconnect(ws.playerId);
            } else {
                console.log('Client disconnected');
            }
        });
    });

    return wss;
};

export const getWebSocketServer = () => {
    if (!wss) {
        throw new Error('WebSocket server is not initialized');
    }
    return wss;
};