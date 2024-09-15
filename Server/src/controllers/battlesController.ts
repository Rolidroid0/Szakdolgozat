import { Request, Response } from "express";
import { getOngoingBattle } from "../services/battlesService";

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