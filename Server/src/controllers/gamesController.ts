import { Request, Response } from "express";
import { getCurrentRound } from "../services/gamesService";

export const getCurrentRoundController = async (req: Request, res: Response) => {
    try {
        const currentRound = await getCurrentRound();
        res.status(200).json(currentRound);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rounds' });
    }
};