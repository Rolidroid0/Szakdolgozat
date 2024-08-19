import { Request, Response } from "express";
import { getTerritories } from "../services/territoriesService";

export const getTerritoriesController = async (req: Request, res: Response) => {
    try {
        const territories = await getTerritories();
        res.status(200).json(territories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching territories' });
    }
};