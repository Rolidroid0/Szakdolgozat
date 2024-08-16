import { Request, Response } from "express";
import { getPlayers } from "../services/playersService";

export const getPlayersController = async (req: Request, res: Response) => {
    try {
        const players = await getPlayers();
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching players' });
    }
};