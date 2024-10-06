import { getWebSocketServer } from "../config/websocket"

export const broadcastRollResult = async (playerRole: string, rollResult: number[], battle: any) => {
    const wss = getWebSocketServer();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            action: 'roll-result',
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
            action: 'battle-update',
            type: 'battleUpdate',
            data: {
            battle: battle,
            roundResult
            },
        }));
    });
};

export const broadcastBattleEnd = async (battle: any) => {
    const wss = getWebSocketServer();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            action: 'battle-end',
            type: 'battleEnd',
            data: {
            battleId: battle._id,
            winner: battle.state === "attacker-won" ? 'attacker' : 'defender'
        },
        }));
    });
};