import { connectToDb } from '../config/db';
import csv from 'csv-parser';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import generateShuffledNumbers, { assignTerritoryBonus } from '../utils/functions';
import { ObjectId } from 'mongodb';
import { RoundState, Symbol } from '../models/enums';


export const shuffle = async (wss: WebSocketServer) => {
    try {
        const db = await connectToDb();
        const essosCards = db?.collection('EssosCards');

        if (!essosCards) {
            console.error('EssosCards collection not found');
            return;
        }

        const cardsCursor = essosCards.find({});

        const cardCount = await essosCards.countDocuments({});
        const shuffledNumbers = generateShuffledNumbers(cardCount);

        let index = 0;
        while (await cardsCursor.hasNext()) {
            const card = await cardsCursor.next();
            if (card) {
                await essosCards.updateOne(
                    { _id: card._id },
                    { $set: { sequence_number: shuffledNumbers[index] } }
                );
                index++;
            }
        }

        const endCard = await essosCards.findOne({ symbol: Symbol.End });

        const minPosition = Math.floor(cardCount / 2);
        const maxPosition = cardCount - 1;
        const newEndPosition = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;

        const otherCard = await essosCards.findOne({ sequence_number: newEndPosition });

        if (!endCard || !otherCard) {
            console.error('Cards not found');
            return;
        }

        await essosCards.updateOne(
            { _id: endCard._id },
            { $set: { sequence_number: newEndPosition } }
        );

        await essosCards.updateOne(
            { _id: otherCard._id },
            { $set: { sequence_number: endCard.sequence_number } }
        );
        
        const shuffledCards = await essosCards.find({}).toArray();

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'shuffle-cards', cards: shuffledCards }));
            }
        });

        console.log('Shuffle complete');
    } catch (error) {
        console.error('An error occured when shuffling the cards:', error);
    }
};

export const getPlayerCardsService = async (playerId: string) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const cardsCollection = db?.collection('EssosCards');

    if (!playersCollection || !cardsCollection) {
        throw new Error("Collections not found");
    }

    const player = await playersCollection.findOne({ _id: new ObjectId(playerId) });
    if (!player) {
        throw new Error("Player not found");
    }

    const playerCards = await cardsCollection.find({ owner_id: player.house }).toArray();

    return playerCards;
}

export const tradeCardsForArmies = async (playerId: ObjectId, cardIds: ObjectId[]) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const cardsCollection = db?.collection('EssosCards');
    const gamesCollection = db?.collection('Games');

    if (!playersCollection || !cardsCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const player = await playersCollection.findOne({ _id: playerId });
    if (!player) {
        throw new Error("Player not found");
    }

    const ongoingGame = await gamesCollection.findOne({ state: "ongoing" });
    if (!ongoingGame || ongoingGame.currentPlayer !== player.house || ongoingGame.roundState !== RoundState.Reinforcement) {
        throw new Error("You can only trade cards during your reinforcement phase");
    }

    const selectedCards = await cardsCollection.find({ _id: { $in: cardIds }, owner_id: player.house }).toArray();
    if (selectedCards.length !== 3) {
        throw new Error("You must trade exactly 3 cards");
    }

    const symbols = selectedCards.map(card => card.symbol);
    const territories = selectedCards.map(card => card.name);

    const symbolSet = new Set(symbols);
    let additionalArmies = 0;

    if (symbolSet.size === 1) {
        switch (symbols[0]) {
            case Symbol.Knight:
                additionalArmies = 4;
                break;
            case Symbol.SiegeEngine:
                additionalArmies = 5;
                break;
            case Symbol.Fortress:
                additionalArmies = 6;
                break;
        }
    } else if (symbolSet.size === 3) {
        additionalArmies = 7;
    } else {
        throw new Error("Invalid combination of card symbols");
    }

    await playersCollection.updateOne(
        { _id: playerId },
        { $inc: { plus_armies: additionalArmies } }
    );

    await cardsCollection.updateMany({ _id: { $in: cardIds } }, { $set: { owner_id: "usedThisGame" } });

    await assignTerritoryBonus(playerId, territories);

    return additionalArmies;
};

export const drawCard = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const cardsCollection = db?.collection('EssosCards');

        if (!playersCollection || !cardsCollection) {
            throw new Error("Collections not found");
        }

        const player = await playersCollection.findOne({ _id: playerId });
        if (!player) {
            throw new Error("Player not found");
        }

        if (player.conquered) {
            const topCard = await cardsCollection.findOne({ owner_id: "in deck" }, { sort: { sequence_number: 1 } });

            if (!topCard) {
                throw new Error('No cards left in deck');
            }

            await cardsCollection.updateOne({ _id: topCard._id }, { $set: { owner_id: player.house } });

            return topCard;
        } else {
            throw new Error('Player has not conquered a territory');
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error drawing card');
    }
};

export default shuffle;