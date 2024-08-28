import { Request, Response } from "express";
import { endPhase, getCurrentRound } from "../services/gamesService";

export const getCurrentRoundController = async (req: Request, res: Response) => {
    try {
        const currentRound = await getCurrentRound();
        res.status(200).json(currentRound);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rounds' });
    }
};

export const endPhaseController = async (req: Request, res: Response) => {
    const { playerId } = req.body;

    try {
        const result = await endPhase(playerId);
        if (!result) {
            throw new Error("Error ending phase");
        }
        if (result === "endTurn") {
            res.status(200).json({ message: "Turn ended" });
        } else {
            res.status(200).json({ message: "Phase ended", nextRoundState: result});
        }
    } catch (error) {
        res.status(500).json({ message: 'Error ending phase' });
    }
};