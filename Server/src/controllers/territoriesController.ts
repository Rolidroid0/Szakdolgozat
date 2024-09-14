import { Request, Response } from "express";
import { findAttackableTerritories, findConnectedTerritories, getTerritories, getTerritoryById, reinforceTerritory } from "../services/territoriesService";
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

export const getManeuverableTerritoriesController = async (req: Request, res: Response) => {
    const { playerId, territoryId } = req.query;
    
    try {
        if (typeof playerId !== 'string' || typeof territoryId !== 'string') {
            return res.status(400).json({ message: 'Invalid playerId or territoryId' });
        }

        const maneuverableTerritories = await findConnectedTerritories(new ObjectId(territoryId), new ObjectId(playerId));
        res.status(200).json(maneuverableTerritories);
    } catch (error) {
        console.error('Error fetching maneuverable territories: ', error);
        res.status(500).json({ message: 'Failed to fetch maneuverable territories' });
    }
};

export const getAttackableTerritoriesController = async (req: Request, res: Response) => {
    const { playerId, territoryId } = req.query;

    try {
        if (typeof playerId !== 'string' || typeof territoryId !== 'string') {
            return res.status(400).json({ message: 'Invalid playerId or territoryId' });
        }

        const attackableTerritories = await findAttackableTerritories(new ObjectId(territoryId), new ObjectId(playerId));
        res.status(200).json(attackableTerritories);
    } catch (error) {
        console.error('Error fetching attackable territories: ', error);
        res.status(500).json({ message: 'Failed to fetch maneuverable territories' });
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