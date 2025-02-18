"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebSocketServer = exports.initializeWebSocket = void 0;
var ws_1 = require("ws");
var websocketActions_1 = require("../handlers/websocketActions");
var functions_1 = require("../utils/functions");
var wss;
var initializeWebSocket = function (server) {
    wss = new ws_1.WebSocketServer({ server: server });
    console.log("WebSocket server initialized");
    wss.on('connection', function (ws) {
        console.log('New client connected');
        ws.on('message', function (message) {
            try {
                var parsedMessage = JSON.parse(message.toString());
                console.log('Received message:', parsedMessage);
                if (parsedMessage.playerId) {
                    ws.playerId = parsedMessage.playerId;
                }
                var action = websocketActions_1.default[parsedMessage.action];
                if (action) {
                    action(ws, parsedMessage.data);
                }
                else {
                    console.error('Unknown action:', parsedMessage.action);
                }
            }
            catch (error) {
                console.error('Failed to parse message:', error);
            }
        });
        ws.on('close', function () {
            if (ws.playerId) {
                console.log("Client disconnected: Player ID ".concat(ws.playerId));
                (0, functions_1.handleDisconnect)(ws.playerId);
            }
            else {
                console.log('Client disconnected');
            }
        });
    });
    return wss;
};
exports.initializeWebSocket = initializeWebSocket;
var getWebSocketServer = function () {
    if (!wss) {
        throw new Error('WebSocket server is not initialized');
    }
    return wss;
};
exports.getWebSocketServer = getWebSocketServer;
