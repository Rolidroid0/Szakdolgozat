import { Request, Response } from "express";
import { getTerritories, getTerritoryById, reinforceTerritory } from "../services/territoriesService";
import { ObjectId } from "mongodb";

export const getTerritoriesController = async (req: Request, res: Response) => {
    try {
        const territories = await getTerritories();
        res.status(200).json(territories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching territories' });
    }
};

export const getTerritoryController = async (req: Request, res: Response) => {
    const { territoryId } = req.params;

    try {
        const territory = await getTerritoryById(new ObjectId(territoryId));
        res.status(200).json(territory);
    } catch (error) {
        console.error('Error fetching territory details: ', error);
        res.status(500).json({ message: 'Failed to fetch territory details' });
    }
};

export const reinforceTerritoryController = async (req: Request, res: Response) => {
    const { playerId, territoryId, armies } = req.body;

    try {
        await reinforceTerritory(new ObjectId(playerId), new ObjectId(territoryId), armies);
        res.status(200).json({ message: "Territory reinforced" });
    } catch (error) {
        res.status(500).json({ message: "Error reinforcing territory", error });
    }
};