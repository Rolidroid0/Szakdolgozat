import { Request, Response } from "express";
import { getWebSocketServer } from "../config/websocket";
import shuffle from "../services/shuffleService";

export const shuffleCards = async (req: Request, res: Response) => {
    try {
        const wss = getWebSocketServer();
        await shuffle(wss);
        res.status(200).send('Cards shuffled successfully');
    } catch (error) {
        res.status(500).send('An error occurred while shuffling the cards');
    }
};