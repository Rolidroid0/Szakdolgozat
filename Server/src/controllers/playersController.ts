import { Request, Response } from "express";
import { getPlayerById, getPlayers, loginPlayer, logoutPlayer } from "../services/playersService";
import { ObjectId } from "mongodb";

export const getPlayersController = async (req: Request, res: Response) => {
    try {
        const players = await getPlayers();
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching players' });
    }
};

export const getPlayerController = async (req: Request, res: Response) => {
    const { playerId } = req.params;

    try {
        const player = await getPlayerById(new ObjectId(playerId));
        res.status(200).json(player);
    } catch (error) {
        console.error('Error fetching player details: ', error);
        res.status(500).json({ message: 'Failed to fetch player details' });
    }
};

export const loginPlayerController = async (req: Request, res: Response) => {
    const { playerId } = req.body;
    try {
        const result = await loginPlayer(new ObjectId(playerId));
        res.json({ success: result.success, message: result.message });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

export const logoutPlayerController = async (req: Request, res: Response) => {
    const { playerId } = req.body;
    try {
        await logoutPlayer(new ObjectId(playerId));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
};