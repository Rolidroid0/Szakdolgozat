import { WebSocketServer } from "ws";
import { connectToDb } from "../config/db";
import { calculatePlusArmies, calculateReward, calculateScores, validateManeuver } from "../utils/functions";
import { ObjectId } from "mongodb";
import { WebSocket } from 'ws';
import { getWebSocketServer } from "../config/websocket";
import { Game } from "../models/gamesModel";
import { drawCard } from "./cardsService";
import { RoundState, Symbol } from "../models/enums";
import { Player } from "../models/playersModel";
import { Territory } from "../models/territoriesModel";
import { Card } from "../models/cardsModel";
import { getOngoingBattle, rollDiceService, startBattle } from "./battlesService";
import { getCurrentPlayer } from "./playersService";
import { reinforceTerritory } from "./territoriesService";
import { Battle } from "../models/battlesModel";

export const getOngoingGame = async () => {
    try {
        const db = await connectToDb();
        const gamesCollection = db?.collection('Games');

        if (!gamesCollection) {
            throw new Error("Games collection not found");
        }

        const game = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!game) {
            throw new Error("No ongoing game found");
        }
        
        return game;
    } catch (error) {
        console.error('Error getting game: ', error);
        throw error;
    }
};

export const getCurrentRound = async () => {
    const db = await connectToDb();
    const gamesCollection = db?.collection('Games');

    if (!gamesCollection) {
        throw new Error("Games collection not found");
    }

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

    if (!ongoingGame) {
        return { message: "No ongoing game found" };
    }

    const { round, current_player, round_state } = ongoingGame;

    return { round, current_player, round_state };
};

export const applyAdditionalArmies = async (playerId: ObjectId) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const gamesCollection = db?.collection('Games');

    if (!playersCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
    if (!ongoingGame) {
        throw new Error("No ongoing game found");
    }

    const additionalArmies = await calculatePlusArmies(playerId);

    await playersCollection.updateOne(
        { _id: playerId, game_id: ongoingGame._id },
        { $inc: { plus_armies: additionalArmies } }
    );
};

export const endTurn = async (playerId: ObjectId) => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const gamesCollection = db?.collection('Games');

    if (!playersCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

    if (!ongoingGame) {
        throw new Error("No ongoing game found");
    }

    const currentPlayer = ongoingGame.current_player;
    const currentPlayerDoc = await playersCollection.findOne<Player>({ _id: playerId, game_id: ongoingGame._id });

    if (!currentPlayerDoc || currentPlayerDoc.house !== currentPlayer) {
        throw new Error("It's not your turn!");
    }

    if (currentPlayerDoc.plus_armies > 0 && ongoingGame.round_state === "reinforcement") {
        throw new Error("You still have armies to place");
    }

    if (currentPlayerDoc.conquered) {
        await drawCard(currentPlayerDoc._id);
        currentPlayerDoc.conquered = false;
        await playersCollection.updateOne(
            { _id: currentPlayerDoc._id, game_id: ongoingGame._id },
            { $set: { conquered: false } }
        );

        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    action: 'cards-updated',
                    data: { playerId: currentPlayerDoc._id }
                }));
            }
        });
    }

    const gameEnded = await checkGameEnd();
    if (gameEnded) {
        return ongoingGame._id;
    }

    const players = await playersCollection.find<Player>({ game_id: ongoingGame._id }).toArray();
    const currentPlayerIndex = players.findIndex(player => player._id.equals(playerId));
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    let currentRound = ongoingGame.round;
    if (nextPlayerIndex === 0) {
        currentRound += 1;
    }

    const nextPlayer = players[nextPlayerIndex];

    if (nextPlayer) {
        await applyAdditionalArmies(nextPlayer._id);

        const nextRoundState = RoundState.Reinforcement;

        await gamesCollection.updateOne(
            { _id: ongoingGame._id },
            { $set: { current_player: nextPlayer.house, round: currentRound, round_state: nextRoundState } }
        );

        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'round-updated', data: { current_round: currentRound, currentHouse: nextPlayer.house, round_state: nextRoundState } }));
            }
        });
    } else {
        console.error('No next player found');
    }
};

export const endPhase = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const gamesCollection = db?.collection('Games');
        const playersCollection = db?.collection('Players');

        if (!gamesCollection || !playersCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const player = await playersCollection.findOne<Player>({ _id: new ObjectId(playerId), game_id: ongoingGame._id });

        if (!player) {
            throw new Error("No player found");
        }

        if (ongoingGame.current_player !== player.house) {
            throw new Error("Not your turn");
        }

        if (player.plus_armies > 0 && ongoingGame.round_state === "reinforcement") {
            throw new Error("You still have armies to place");
        }

        const phaseOrder = [RoundState.Reinforcement, RoundState.Invasion, RoundState.Maneuver];
        const currentPhaseIndex = phaseOrder.indexOf(ongoingGame.round_state);
        let nextRoundState;

        if (currentPhaseIndex === -1) {
            throw new Error("Invalid game phase");
        } else if (currentPhaseIndex < phaseOrder.length - 1) {
            nextRoundState = phaseOrder[currentPhaseIndex + 1];
        } else {
            await endTurn(playerId);
            return "endTurn";
        }

        await gamesCollection.updateOne(
            { _id: ongoingGame._id },
            { $set: { round_state: nextRoundState } }
        );

        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    action: 'round-state-updated',
                    data: { round_state: nextRoundState }
                }));
            }
        });

        return nextRoundState;
    } catch (error) {
        console.error("Error ending reinforcement phase: ", error);
    }
};

export const applyManeuver = async (playerId: ObjectId, fromTerritoryId: ObjectId, toTerritoryId: ObjectId, armies: number) => {
    const db = await connectToDb();
    const territoriesCollection = db?.collection('EssosTerritories');
    const playersCollection = db?.collection('Players');
    const gamesCollection = db?.collection('Games');

    if (!territoriesCollection || !playersCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

    if (!ongoingGame) {
        throw new Error("No ongoing game found");
    }

    const player = await playersCollection.findOne<Player>({ _id: playerId, game_id: ongoingGame._id });

    if (!player) {
        throw new Error("Player not found");
    }

    const fromTerritory = await territoriesCollection.findOne<Territory>({ _id: fromTerritoryId, game_id: ongoingGame._id });
    const toTerritory = await territoriesCollection.findOne<Territory>({ _id: toTerritoryId, game_id: ongoingGame._id });

    if (!fromTerritory || !toTerritory) {
        throw new Error("Territories not found");
    }

    if (fromTerritory.owner_id !== player.house || toTerritory.owner_id !== player.house) {
        throw new Error("You can only maneuver armies between your own territories");
    }
    
    const validManeuver = await validateManeuver(fromTerritoryId, toTerritoryId, playerId);
    if (!validManeuver) {
        throw new Error("Not a valid maneuver.");
    }

    if (fromTerritory.number_of_armies <= armies) {
        throw new Error("Not enough armies to maneuver.");
    }

    await territoriesCollection.updateOne(
        { _id: fromTerritoryId, game_id: ongoingGame._id },
        { $inc: { number_of_armies: -armies } }
    );

    await territoriesCollection.updateOne(
        { _id: toTerritoryId, game_id: ongoingGame._id },
        { $inc: { number_of_armies: armies } }
    );

    const wss = getWebSocketServer();
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                action: 'territories-updated',
                data: { fromTerritoryId, toTerritoryId }
            }));
        }
    });

    await endPhase(playerId);
};

export const checkGameEnd = async () => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const territoriesCollection = db?.collection('EssosTerritories');
        const cardsCollection = db?.collection('EssosCards');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !territoriesCollection || !cardsCollection || !gamesCollection) {
            throw new Error('Collections not found');
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error('No ongoing game found');
        }

        const endCard = await cardsCollection.findOne<Card>({ game_id: ongoingGame._id, symbol: Symbol.End, owner_id: { $ne: "in deck" } });
        if (endCard) {
            console.log(`Game (_id: ${ongoingGame._id}) ends because 'Valar Morghulis' card was drawn.`);
            return await calculateScores();
        }

        const players = await playersCollection.find({ game_id: ongoingGame._id }).toArray();
        for (const player of players) {
            // if there are more than 2 players its bad, it should count if a players territories count equals with allTerritories count..
            const playerTerritories = await territoriesCollection.countDocuments({ owner_id: player.house, game_id: ongoingGame._id });
            if (playerTerritories === 0) {
                console.log(`Game (_id: ${ongoingGame._id}) ends because ${player.house} has no territories.`);
                return await calculateScores();
            }
        }
    } catch (error) {
        console.error('Error checking game end: ', error);
    }
};

// FOR THE AI

export const getOngoingGameState = async () => {
    try {
        const db = await connectToDb();
        const gamesCollection = db?.collection('Games');
        const territoriesCollection = db?.collection('EssosTerritories');
        const playersCollection = db?.collection('Players');

        if (!gamesCollection || !territoriesCollection || !playersCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const current_player = await playersCollection.findOne<Player>({ game_id: ongoingGame._id, house: ongoingGame.current_player });
        if (!current_player) {
            throw new Error("Player not found");
        }

        const territories = await territoriesCollection.find<Territory>({ game_id: ongoingGame._id }).toArray();
        return {
            _id: ongoingGame._id,
            current_player: ongoingGame.current_player,
            current_player_id: current_player._id,
            players: ongoingGame.players,
            state: ongoingGame.state,
            round: ongoingGame.round,
            round_state: ongoingGame.round_state,
            territories: territories
        }
    } catch (error) {
        console.error('Error getting game state: ', error);
        throw error;
    }
};

export const automataBattle = async () => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const battlesCollection = db?.collection('Battles');
        const territoriesCollection = db?.collection('EssosTerritories');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !battlesCollection || !territoriesCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        let battle = await getOngoingBattle();
        if (!battle) {
            throw new Error("No ongoing battle to automate");
        }
        const battleId = battle._id;

        while (battle) {
            const attacker = await playersCollection.findOne<Player>({ game_id: battle.game_id, house: battle.attacker_id });
            if (!attacker) {
                throw new Error("Attacker not found");
            }
            if (!battle.attacker_has_rolled) {
                await rollDiceService(attacker._id);
            }
            

            if (battle.defender_id !== "neutral") {
                const defender = await playersCollection.findOne<Player>({ game_id: battle.game_id, house: battle.defender_id });
                if (!defender) {
                    throw new Error("Defender not found");
                }
                if (!battle.defender_has_rolled) {
                    await rollDiceService(defender._id);
                }
            }

            battle = await getOngoingBattle();
        }

        return await calculateReward(battleId);
    } catch (error) {
        console.error("Error in automataBattle: ", error);
        throw error;
    }
};

export const automataTurn = async () => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const currentPlayer = await getCurrentPlayer();
        if (!currentPlayer) {
            throw new Error("No active player found");
        }
        const gameEnded = await endTurn(currentPlayer._id);
        if (gameEnded) {
            const game = await gamesCollection.findOne<Game>({ _id: gameEnded });
            if (!game) {
                throw new Error("No game found");
            }
            return game.state.includes("Ghiscari") ? 50 : -50; // FELTÉTELEZVE, HOGY GHISCARI AZ AI! 
        }

        let reward = { attackerPoints: 0, defenderPoints: 0 };

        const nextPlayer = await getCurrentPlayer();
        if (!nextPlayer) {
            throw new Error("No next player found");
        }

        await automataAllocateTerritories();

        const botAttacked = await botAttack();
        if (botAttacked) {
            reward = await automataBattle();
        }

        const gameEnded2 = await endTurn(nextPlayer._id);
        if (gameEnded2) {
            const game = await gamesCollection.findOne<Game>({ _id: gameEnded2 });
            if (!game) {
                throw new Error("No game found");
            }
            return game.state.includes("Ghiscari") ? reward.defenderPoints + 50 : reward.defenderPoints - 50; // FELTÉTELEZVE, HOGY GHISCARI AZ AI!
        }

        await automataAllocateTerritories();

        console.log("Automata turn finished successfully.");
        return reward.defenderPoints;
    } catch (error) {
        console.error("Error in automataTurn: ", error);
        throw error;
    }
};

export const automataAllocateTerritories = async () => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const territoriesCollection = db?.collection('EssosTerritories');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !territoriesCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const player = await getCurrentPlayer();
        if (!player) {
            throw new Error("No next player found");
        }

        if (player.plus_armies > 0) {
            const territories = await territoriesCollection.find<Territory>({ game_id: ongoingGame._id, owner_id: player.house }).toArray();
            if (territories.length === 0) {
                throw new Error("No owned territores found for reinforcement");
            }

            let remainingArmies = player.plus_armies;
            while (remainingArmies > 0) {
                territories.sort((a, b) => a.number_of_armies - b.number_of_armies);
                const territory = territories[0];
                await reinforceTerritory(player._id, territory._id, 1);
                territories[0].number_of_armies++;
                remainingArmies--;
            }
        }

    } catch (error) {
        console.error("Error in automataAllocateTerritories: ", error);
        throw error;
    }
};

export const botAttack = async () => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const territoriesCollection = db?.collection('EssosTerritories');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !territoriesCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const player = await getCurrentPlayer();
        if (!player) {
            throw new Error("No next player found");
        }

        const territores = await territoriesCollection.find<Territory>({ game_id: ongoingGame._id, owner_id: player.house }).toArray();

        for (const territory of territores) {
            const enemyNeighbors = await territoriesCollection.find<Territory>({
                name: { $in: territory.neighbors },
                owner_id: { $ne: player.house }
            }).toArray();

            for (const enemy of enemyNeighbors) {
                const attackerArmies = territory.number_of_armies;
                const defenderArmies = enemy.number_of_armies;

                if (attackerArmies >= 3 && attackerArmies >= 2 * defenderArmies) {
                    const maxSafeAttackers = Math.floor(attackerArmies / 2);
                    const armiesToAttack = Math.max(2, Math.min(maxSafeAttackers, attackerArmies - 1));

                    if (armiesToAttack > defenderArmies) {
                        console.log(`Bot attacking from ${territory.name} to ${enemy.name} with ${armiesToAttack} armies.`);
                        await startBattle(player._id, territory._id, enemy._id, armiesToAttack);
                        return true;
                    }
                }
            }
        }

        console.log("Bot did not find a safe attack.");
        return false;

    } catch (error) {
        console.error("Error in botAttack: ", error);
        throw error;
    }
};