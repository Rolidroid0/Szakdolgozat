import { connectToDb } from '../config/db';
import * as csvParser from 'csv-parser';
import { promises as fs } from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import generateShuffledNumbers, { assignTerritoryBonus } from '../utils/functions';
import { ObjectId } from 'mongodb';
import { RoundState, Symbol } from '../models/enums';
import { Card } from '../models/cardsModel';
import { Player } from '../models/playersModel';
import { Game } from '../models/gamesModel';
import { getWebSocketServer } from '../config/websocket';


export const shuffle = async () => {
    try {
        const db = await connectToDb();
        const essosCards = db?.collection('EssosCards');
        const gamesCollection = db?.collection('Games');

        if (!essosCards || !gamesCollection) {
            throw new Error('Collections not found');
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error('No ongoing game found');
        }

        const cardsCursor = await essosCards.find<Card>({ game_id: ongoingGame._id });

        const cardCount = await essosCards.countDocuments({ game_id: ongoingGame._id });
        const shuffledNumbers = generateShuffledNumbers(cardCount);

        let index = 0;
        while (await cardsCursor.hasNext()) {
            const card = await cardsCursor.next();
            if (card) {
                await essosCards.updateOne(
                    { _id: card._id, game_id: ongoingGame._id },
                    { $set: { sequence_number: shuffledNumbers[index] } }
                );
                index++;
            }
        }

        const endCard = await essosCards.findOne<Card>({ symbol: Symbol.End, game_id: ongoingGame._id });

        const minPosition = Math.floor(cardCount / 2);
        const maxPosition = cardCount - 1;
        const newEndPosition = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;

        const otherCard = await essosCards.findOne<Card>({ sequence_number: newEndPosition, game_id: ongoingGame._id });

        if (!endCard || !otherCard) {
            console.error('Cards not found');
            return;
        }

        await essosCards.updateOne(
            { _id: endCard._id, game_id: ongoingGame._id },
            { $set: { sequence_number: newEndPosition } }
        );

        await essosCards.updateOne(
            { _id: otherCard._id, game_id: ongoingGame._id },
            { $set: { sequence_number: endCard.sequence_number } }
        );
        
        const shuffledCards = await essosCards.find<Card>({ game_id: ongoingGame._id }).toArray();

        const wss = getWebSocketServer();
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
    const gamesCollection = db?.collection('Games');

    if (!playersCollection || !cardsCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
    if (!ongoingGame) {
        throw new Error('No ongoing game found');
    }

    const player = await playersCollection.findOne<Player>({ _id: new ObjectId(playerId), game_id: ongoingGame._id });
    if (!player) {
        throw new Error("Player not found");
    }

    const playerCards = await cardsCollection.find({ owner_id: player.house, game_id: ongoingGame._id }).toArray();

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

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
    if (!ongoingGame) {
        throw new Error('No ongoing game found');
    }

    const player = await playersCollection.findOne<Player>({ _id: playerId, game_id: ongoingGame._id });
    if (!player) {
        throw new Error("Player not found");
    }

    if (ongoingGame.current_player !== player.house || ongoingGame.round_state !== RoundState.Reinforcement) {
        throw new Error("You can only trade cards during your reinforcement phase");
    }

    const selectedCards = await cardsCollection.find<Card>({ _id: { $in: cardIds }, owner_id: player.house, game_id: ongoingGame._id }).toArray();
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
        { _id: playerId, game_id: ongoingGame._id },
        { $inc: { plus_armies: additionalArmies } }
    );

    await cardsCollection.updateMany({ _id: { $in: cardIds }, game_id: ongoingGame._id }, { $set: { owner_id: "usedThisGame" } });

    await assignTerritoryBonus(playerId, territories);

    return additionalArmies;
};

export const drawCard = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const cardsCollection = db?.collection('EssosCards');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !cardsCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error('No ongoing game found');
        }

        const player = await playersCollection.findOne<Player>({ _id: playerId, game_id: ongoingGame._id });
        if (!player) {
            throw new Error("Player not found");
        }

        if (player.conquered) {
            const topCard = await cardsCollection.findOne<Card>({ owner_id: "in deck", game_id: ongoingGame._id }, { sort: { sequence_number: 1 } });

            if (!topCard) {
                throw new Error('No cards left in deck');
            }

            await cardsCollection.updateOne({ _id: topCard._id, game_id: ongoingGame._id }, { $set: { owner_id: player.house } });

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