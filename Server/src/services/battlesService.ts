import { ObjectId } from "mongodb";
import { WebSocket } from 'ws';
import { getWebSocketServer } from "../config/websocket";
import { connectToDb } from "../config/db";
import { Battle } from "../models/battlesModel";
import { error } from "console";
import { compareRolls, rollDice } from "../utils/functions";
import { broadcastBattleEnd, broadcastBattleUpdate, broadcastRollResult } from "./broadcastService";
import { Role, RoundState } from "../models/enums";
import { Player } from "../models/playersModel";
import { Territory } from "../models/territoriesModel";
import { Game } from "../models/gamesModel";

export const getOngoingBattle = async () => {
    try {
        const db = await connectToDb();
        const battlesCollection = db?.collection('Battles');
        const gamesCollection = db?.collection('Games');

        if (!battlesCollection  || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error('No ongoing game found');
        }

        const battle = await battlesCollection.findOne<Battle>({ state: "ongoing", game_id: ongoingGame._id });
        if (!battle) {
            return null;
        }
        
        return battle;
    } catch (error) {
        console.error('Error getting battle: ', error);
        throw error;
    }
};

export const startBattle = async (playerId: ObjectId, fromTerritoryId: ObjectId, toTerritoryId: ObjectId, armies: number) => {
    try {
        const db = await connectToDb();
        const gamesCollection = db?.collection('Games');
        const battlesCollection = db?.collection('Battles');
        const territoriesCollection = db?.collection('EssosTerritories');
        const playersCollection = db?.collection('Players');

        if (!gamesCollection || !battlesCollection || !territoriesCollection || !playersCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        
        if (!ongoingGame) {
            throw new Error('No ongoing game found');
        }

        const ongoingBattle = await battlesCollection.findOne<Battle>({ state: "ongoing", game_id: ongoingGame._id });
        
        if (ongoingBattle) {
            throw new Error("There is already a battle running");
        }

        const player = await playersCollection.findOne<Player>({ _id: playerId, game_id: ongoingGame._id });
        const fromTerritory = await territoriesCollection.findOne<Territory>({ _id: fromTerritoryId, game_id: ongoingGame._id });
        const toTerritory = await territoriesCollection.findOne<Territory>({ _id: toTerritoryId, game_id: ongoingGame._id });

        if (!player) {
            throw new Error("Player not found");
        }

        if (!fromTerritory || !toTerritory) {
            throw new Error("Territories not found");
        }

        if (ongoingGame.current_player !== player.house || ongoingGame.round_state !== RoundState.Invasion) {
            throw new Error("You can not start a battle now");
        }

        if (fromTerritory.owner_id !== player.house || toTerritory.owner_id === player.house) {
            throw new Error("Invalid attack");
        }

        if (fromTerritory.last_attacked_from === ongoingGame.round) {
            throw new Error("You have already attacked from this territory this round");
        }

        if (fromTerritory.number_of_armies <= armies) {
            throw new Error("Not enough armies");
        }

        const battle = await createBattle(fromTerritoryId, toTerritoryId, armies);

        const wss = getWebSocketServer();
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'battle-started', data: { battle } }));
            }
        });
    } catch (error) {
        console.error("Error starting battle: ", error);
        throw error;
    }
};

export const createBattle = async (attackerTerritoryId: ObjectId, defenderTerritoryId: ObjectId, attackerArmies: number) => {
    try {
        const db = await connectToDb();
        const battlesCollection = db?.collection('Battles');
        const gamesCollection = db?.collection('Games');
        const territoriesCollection = db?.collection('EssosTerritories');

        if (!battlesCollection || !gamesCollection || !territoriesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });

        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const defenderTerritory = await territoriesCollection.findOne<Territory>({ _id: defenderTerritoryId });
        const attackerTerritory = await territoriesCollection.findOne<Territory>({ _id: attackerTerritoryId });

        if (!defenderTerritory || !attackerTerritory) {
            throw new Error("Territories not found");
        }

        await battlesCollection.insertOne({
            game_id: ongoingGame._id,
            state: "ongoing",
            attacker_id: attackerTerritory.owner_id,
            defender_id: defenderTerritory.owner_id,
            attacker_territory_id: attackerTerritoryId.toString(),
            defender_territory_id: defenderTerritoryId.toString(),
            attacker_armies: attackerArmies,
            defender_armies: defenderTerritory.number_of_armies,
            current_attacker_armies: attackerArmies,
            current_defender_armies: defenderTerritory.number_of_armies,
            battle_log: [],
            round_number: ongoingGame.round,
            attacker_rolls: [],
            defender_rolls: [],
            attacker_has_rolled: false,
            defender_has_rolled: false,
        });

        await territoriesCollection.updateOne(
            { _id: attackerTerritoryId, game_id: ongoingGame._id },
            { $inc: { number_of_armies: -attackerArmies },
              $set: { last_attacked_from: ongoingGame.round } },
        );

        const insertedBattle = await battlesCollection.findOne<Battle>({ state: "ongoing", game_id: ongoingGame._id });

        if (!insertedBattle) {
            throw new Error("Failed to retrieve the inserted battle");
        }

        return insertedBattle;
    } catch (error) {
        console.error("Error creating battle: ", error);
        throw error;
    }
};

export const rollDiceService = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const battlesCollection = db?.collection('Battles');
        const territoriesCollection = db?.collection('EssosTerritories');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !battlesCollection || !territoriesCollection || !gamesCollection) {
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

        const battle = await getOngoingBattle();

        if (!battle) {
            throw new Error("No ongoing battle found");
        }

        let playerRole;
        if (player.house === battle.attacker_id) {
            playerRole = Role.Attacker;
        } else if (player.house === battle.defender_id) {
            playerRole = Role.Defender;
        } else {
            throw new Error("Invalid player for this battle");
        }

        const enemyIsNeutral = battle.defender_id === 'neutral';

        if (enemyIsNeutral && !battle.defender_has_rolled) {
            const neutralRoll = await rollDice(battle.current_defender_armies, Role.Defender);
            battle.defender_rolls = neutralRoll;
            battle.defender_has_rolled = true;
            await broadcastRollResult(Role.Defender, neutralRoll, battle);
        }

        if (battle[`${playerRole}_has_rolled`]) {
            throw new Error("Player has already rolled this round");
        }

        const rollResult = await rollDice(playerRole === Role.Attacker ? battle.current_attacker_armies : battle.current_defender_armies, playerRole);

        battle[`${playerRole}_rolls`] = rollResult;
        battle[`${playerRole}_has_rolled`] = true;

        await broadcastRollResult(playerRole, rollResult, battle);

        if (battle.attacker_has_rolled && battle.defender_has_rolled) {
            const { attackerLosses, defenderLosses } = await compareRolls(battle.attacker_rolls, battle.defender_rolls);

            battle.attacker_has_rolled = false;
            battle.defender_has_rolled = false;

            battle.current_attacker_armies -= attackerLosses;
            battle.current_defender_armies -= defenderLosses;

            const roundResult = {
                attackerRolls: battle.attacker_rolls,
                defenderRolls: battle.defender_rolls,
                attackerLosses,
                defenderLosses,
                remainingAttackerArmies: battle.current_attacker_armies,
                remainingDefenderArmies: battle.current_defender_armies
            };

            battle.battle_log.push(JSON.stringify(roundResult));

            await battlesCollection.updateOne({ _id: battle._id, game_id: ongoingGame._id }, { $set: battle });

            await broadcastBattleUpdate(battle, roundResult);

            if (battle.current_attacker_armies <= 0 || battle.current_defender_armies <= 0) {
                battle.state = battle.current_attacker_armies > 0 ? "attacker-won" : "defender-won";

                if (battle.state === "attacker-won") {
                    await territoriesCollection.updateOne(
                        { _id: new ObjectId(battle.defender_territory_id), game_id: ongoingGame._id },
                        {
                            $set: {
                                owner_id: battle.attacker_id,
                                number_of_armies: battle.current_attacker_armies
                            }
                        }
                    );

                    await playersCollection.updateOne(
                        { house: battle.attacker_id, game_id: ongoingGame._id },
                        { $set: { conquered: true } }
                    );
                } else if (battle.state === "defender-won") {
                    await territoriesCollection.updateOne(
                        { _id: new ObjectId(battle.defender_territory_id), game_id: ongoingGame._id },
                        { $set: { number_of_armies: battle.current_defender_armies } }
                    );
                }

                await battlesCollection.updateOne({ _id: battle._id, game_id: ongoingGame._id }, { $set: battle });
                
                await broadcastBattleEnd(battle);
            }
        } else {
            await battlesCollection.updateOne({ _id: battle._id, game_id: ongoingGame._id }, { $set: battle });
        }

        return rollResult;
    } catch (error) {
        console.error("Error rolling dice: ", error);
        throw error;
    }
};