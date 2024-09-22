import { getWebSocketServer } from "../config/websocket"

export const broadcastRollResult = async (playerRole: string, rollResult: number[], battle: any) => {
    const wss = getWebSocketServer();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            type: 'rollResult',
            battleId: battle._id,
            playerRole,
            rollResult
        }));
    });
};

export const broadcastBattleUpdate = async (battle: any, roundResult: any) => {
    const wss = getWebSocketServer();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            type: 'battleUpdate',
            battleId: battle._id,
            roundResult,
        }));
    });
};

export const broadcastBattleEnd = async (battle: any) => {
    const wss = getWebSocketServer();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            type: 'battleEnd',
            battleId: battle._id,
            winner: battle.state === "attacker-won" ? 'attacker' : 'defender',
        }));
    });
};