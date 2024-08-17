import { Request, Response } from "express";
import { getPlayers, loginPlayer, logoutPlayer } from "../services/playersService";

export const getPlayersController = async (req: Request, res: Response) => {
    try {
        const players = await getPlayers();
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching players' });
    }
};

export const loginPlayerController = async (req: Request, res: Response) => {
    const { playerId } = req.body;
    try {
        const result = await loginPlayer(playerId);
        res.json({ success: result.success, message: result.message });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

export const logoutPlayerController = async (req: Request, res: Response) => {
    const { playerId } = req.body;
    try {
        await logoutPlayer(playerId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
};