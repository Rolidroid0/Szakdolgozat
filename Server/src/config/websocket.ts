import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import actions from '../handlers/websocketActions';

let wss: WebSocketServer;

export const initializeWebSocket = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        console.log('New client connected');

        ws.on('message', (message: string) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                console.log('Received message:', parsedMessage);

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
            console.log('Client disconnected');
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