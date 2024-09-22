import { Request, Response } from "express";
import { getOngoingBattle, rollDiceService } from "../services/battlesService";
import { ObjectId } from "mongodb";

export const getOngoingBattleController = async (req: Request, res: Response) => {
    try {
        const battle = await getOngoingBattle();

        if (!battle) {
            return res.status(200).json({ message: 'No ongoing battle' });
        }

        res.status(200).json(battle);
    } catch (error) {
        console.error('Error fetching battle details: ', error);
        res.status(500).json({ message: 'Failed to fetch battle details' });
    }
};

export const rollDiceController = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.body;

        const rollResult = rollDiceService(new ObjectId(playerId));

        res.json({ message: 'Roll successful', rollResult });
    } catch (error) {
        console.error('Error rolling dice: ', error);
        res.status(500).json({ message: 'Failed to roll dice' });
    }
};