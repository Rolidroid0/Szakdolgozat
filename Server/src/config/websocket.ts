import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer;

export const initializeWebSocket = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        console.log('New client connected');

        ws.on('message', (message: string) => {
            console.log(`Received message: ${message}`);

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
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