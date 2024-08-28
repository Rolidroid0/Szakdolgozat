import { Request, Response } from "express";
import { getWebSocketServer } from "../config/websocket";
import shuffle, { getPlayerCardsService, tradeCardsForArmies } from "../services/cardsService";
import { ObjectId } from "mongodb";

export const shuffleCards = async (req: Request, res: Response) => {
    try {
        const wss = getWebSocketServer();
        await shuffle(wss);
        res.status(200).send('Cards shuffled successfully');
    } catch (error) {
        res.status(500).send('An error occurred while shuffling the cards');
    }
};

export const getPlayerCards = async (req: Request, res: Response) => {
    const { playerId } = req.params;

    try {
        const playerCards = await getPlayerCardsService(playerId);
        res.status(200).json(playerCards);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve player cards", error: error });
    }
};

export const tradeCards = async (req: Request, res: Response) => {
    const { playerId, cardIds } = req.body;

    try {
        const playerObjectId = new ObjectId(playerId);
        const cardObjectIds = cardIds.map((id: string) => new ObjectId(id));

        const additionalArmies = await tradeCardsForArmies(playerObjectId, cardObjectIds);

        return res.json({ success: true, additionalArmies });
    } catch (error) {
        return res.status(500).send('An error occurred while trading the cards');
    }
};