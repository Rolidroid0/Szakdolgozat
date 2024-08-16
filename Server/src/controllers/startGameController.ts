import { Request, Response } from "express";
import { startGameService } from "../services/startGameService";

export const startGame = async (req: Request, res: Response) => {
    try {
        const result = await startGameService();
        res.status(200).send({ success: true, message: 'Game started successfully', data: result });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Failed to start game', error });
    }
};