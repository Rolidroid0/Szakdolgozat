import { getWebSocketServer } from "../config/websocket"
import { Battle } from "../models/battlesModel";

export const broadcastRollResult = async (playerRole: string, rollResult: number[], battle: Battle) => {
    const wss = getWebSocketServer();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            action: 'roll-result',
            battleId: battle._id,
            playerRole,
            rollResult
        }));
    });
};

export const broadcastBattleUpdate = async (battle: Battle, roundResult: any) => {
    const wss = getWebSocketServer();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            action: 'battle-update',
            data: {
            battle: battle,
            roundResult
            },
        }));
    });
};

export const broadcastBattleEnd = async (battle: Battle) => {
    const wss = getWebSocketServer();
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            action: 'battle-end',
            data: {
            battleId: battle._id,
            winner: battle.state === "attacker-won" ? 'attacker' : 'defender'
        },
        }));
    });
};