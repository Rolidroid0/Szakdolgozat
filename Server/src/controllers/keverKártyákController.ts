import { Request, Response } from "express";
import { keverés } from "../services/keverésService";
import { getWebSocketServer, initializeWebSocket } from "../config/websocket";
import { connectToDb } from "../config/db";

export const keverKártyák = async (req: Request, res: Response) => {
    try {
        const wss = getWebSocketServer();
        await keverés(wss);
        res.status(200).send('Kártyák sikeresen megkeverve');
    } catch (error) {
        res.status(500).send('Hiba történt a kártyák keverése során');
    }
};