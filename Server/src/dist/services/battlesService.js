"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollDiceService = exports.createBattle = exports.startBattle = exports.getOngoingBattle = void 0;
var mongodb_1 = require("mongodb");
var ws_1 = require("ws");
var websocket_1 = require("../config/websocket");
var db_1 = require("../config/db");
var functions_1 = require("../utils/functions");
var broadcastService_1 = require("./broadcastService");
var enums_1 = require("../models/enums");
var getOngoingBattle = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, battlesCollection, gamesCollection, ongoingGame, battle, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                battlesCollection = db === null || db === void 0 ? void 0 : db.collection('Battles');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!battlesCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error('No ongoing game found');
                }
                return [4 /*yield*/, battlesCollection.findOne({ state: "ongoing", game_id: ongoingGame._id })];
            case 3:
                battle = _a.sent();
                if (!battle) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, battle];
            case 4:
                error_1 = _a.sent();
                console.error('Error getting battle: ', error_1);
                throw error_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getOngoingBattle = getOngoingBattle;
var startBattle = function (playerId, fromTerritoryId, toTerritoryId, armies) { return __awaiter(void 0, void 0, void 0, function () {
    var db, gamesCollection, battlesCollection, territoriesCollection, playersCollection, ongoingGame, ongoingBattle, player, fromTerritory, toTerritory, battle_1, wss, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                battlesCollection = db === null || db === void 0 ? void 0 : db.collection('Battles');
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                if (!gamesCollection || !battlesCollection || !territoriesCollection || !playersCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error('No ongoing game found');
                }
                return [4 /*yield*/, battlesCollection.findOne({ state: "ongoing", game_id: ongoingGame._id })];
            case 3:
                ongoingBattle = _a.sent();
                if (ongoingBattle) {
                    throw new Error("There is already a battle running");
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: playerId, game_id: ongoingGame._id })];
            case 4:
                player = _a.sent();
                return [4 /*yield*/, territoriesCollection.findOne({ _id: fromTerritoryId, game_id: ongoingGame._id })];
            case 5:
                fromTerritory = _a.sent();
                return [4 /*yield*/, territoriesCollection.findOne({ _id: toTerritoryId, game_id: ongoingGame._id })];
            case 6:
                toTerritory = _a.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                if (!fromTerritory || !toTerritory) {
                    throw new Error("Territories not found");
                }
                if (ongoingGame.current_player !== player.house || ongoingGame.round_state !== enums_1.RoundState.Invasion) {
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
                return [4 /*yield*/, (0, exports.createBattle)(fromTerritoryId, toTerritoryId, armies)];
            case 7:
                battle_1 = _a.sent();
                wss = (0, websocket_1.getWebSocketServer)();
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ action: 'battle-started', data: { battle: battle_1 } }));
                    }
                });
                return [3 /*break*/, 9];
            case 8:
                error_2 = _a.sent();
                console.error("Error starting battle: ", error_2);
                throw error_2;
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.startBattle = startBattle;
var createBattle = function (attackerTerritoryId, defenderTerritoryId, attackerArmies) { return __awaiter(void 0, void 0, void 0, function () {
    var db, battlesCollection, gamesCollection, territoriesCollection, ongoingGame, defenderTerritory, attackerTerritory, insertedBattle, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                battlesCollection = db === null || db === void 0 ? void 0 : db.collection('Battles');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                if (!battlesCollection || !gamesCollection || !territoriesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, territoriesCollection.findOne({ _id: defenderTerritoryId })];
            case 3:
                defenderTerritory = _a.sent();
                return [4 /*yield*/, territoriesCollection.findOne({ _id: attackerTerritoryId })];
            case 4:
                attackerTerritory = _a.sent();
                if (!defenderTerritory || !attackerTerritory) {
                    throw new Error("Territories not found");
                }
                return [4 /*yield*/, battlesCollection.insertOne({
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
                    })];
            case 5:
                _a.sent();
                return [4 /*yield*/, territoriesCollection.updateOne({ _id: attackerTerritoryId, game_id: ongoingGame._id }, { $inc: { number_of_armies: -attackerArmies },
                        $set: { last_attacked_from: ongoingGame.round } })];
            case 6:
                _a.sent();
                return [4 /*yield*/, battlesCollection.findOne({ state: "ongoing", game_id: ongoingGame._id })];
            case 7:
                insertedBattle = _a.sent();
                if (!insertedBattle) {
                    throw new Error("Failed to retrieve the inserted battle");
                }
                return [2 /*return*/, insertedBattle];
            case 8:
                error_3 = _a.sent();
                console.error("Error creating battle: ", error_3);
                throw error_3;
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.createBattle = createBattle;
var rollDiceService = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, battlesCollection, territoriesCollection, gamesCollection, ongoingGame, player, battle, playerRole, enemyIsNeutral, neutralRoll, rollResult, _a, attackerLosses, defenderLosses, roundResult, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 24, , 25]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _b.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                battlesCollection = db === null || db === void 0 ? void 0 : db.collection('Battles');
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !battlesCollection || !territoriesCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _b.sent();
                if (!ongoingGame) {
                    throw new Error('No ongoing game found');
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: playerId, game_id: ongoingGame._id })];
            case 3:
                player = _b.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                return [4 /*yield*/, (0, exports.getOngoingBattle)()];
            case 4:
                battle = _b.sent();
                if (!battle) {
                    throw new Error("No ongoing battle found");
                }
                playerRole = void 0;
                if (player.house === battle.attacker_id) {
                    playerRole = enums_1.Role.Attacker;
                }
                else if (player.house === battle.defender_id) {
                    playerRole = enums_1.Role.Defender;
                }
                else {
                    throw new Error("Invalid player for this battle");
                }
                enemyIsNeutral = battle.defender_id === 'neutral';
                if (!(enemyIsNeutral && !battle.defender_has_rolled)) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, functions_1.rollDice)(battle.current_defender_armies, enums_1.Role.Defender)];
            case 5:
                neutralRoll = _b.sent();
                battle.defender_rolls = neutralRoll;
                battle.defender_has_rolled = true;
                return [4 /*yield*/, (0, broadcastService_1.broadcastRollResult)(enums_1.Role.Defender, neutralRoll, battle)];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                if (battle["".concat(playerRole, "_has_rolled")]) {
                    throw new Error("Player has already rolled this round");
                }
                return [4 /*yield*/, (0, functions_1.rollDice)(playerRole === enums_1.Role.Attacker ? battle.current_attacker_armies : battle.current_defender_armies, playerRole)];
            case 8:
                rollResult = _b.sent();
                battle["".concat(playerRole, "_rolls")] = rollResult;
                battle["".concat(playerRole, "_has_rolled")] = true;
                return [4 /*yield*/, (0, broadcastService_1.broadcastRollResult)(playerRole, rollResult, battle)];
            case 9:
                _b.sent();
                if (!(battle.attacker_has_rolled && battle.defender_has_rolled)) return [3 /*break*/, 21];
                return [4 /*yield*/, (0, functions_1.compareRolls)(battle.attacker_rolls, battle.defender_rolls)];
            case 10:
                _a = _b.sent(), attackerLosses = _a.attackerLosses, defenderLosses = _a.defenderLosses;
                battle.attacker_has_rolled = false;
                battle.defender_has_rolled = false;
                battle.current_attacker_armies -= attackerLosses;
                battle.current_defender_armies -= defenderLosses;
                roundResult = {
                    attackerRolls: battle.attacker_rolls,
                    defenderRolls: battle.defender_rolls,
                    attackerLosses: attackerLosses,
                    defenderLosses: defenderLosses,
                    remainingAttackerArmies: battle.current_attacker_armies,
                    remainingDefenderArmies: battle.current_defender_armies
                };
                battle.battle_log.push(JSON.stringify(roundResult));
                return [4 /*yield*/, battlesCollection.updateOne({ _id: battle._id, game_id: ongoingGame._id }, { $set: battle })];
            case 11:
                _b.sent();
                return [4 /*yield*/, (0, broadcastService_1.broadcastBattleUpdate)(battle, roundResult)];
            case 12:
                _b.sent();
                if (!(battle.current_attacker_armies <= 0 || battle.current_defender_armies <= 0)) return [3 /*break*/, 20];
                battle.state = battle.current_attacker_armies > 0 ? "attacker-won" : "defender-won";
                if (!(battle.state === "attacker-won")) return [3 /*break*/, 15];
                return [4 /*yield*/, territoriesCollection.updateOne({ _id: new mongodb_1.ObjectId(battle.defender_territory_id), game_id: ongoingGame._id }, {
                        $set: {
                            owner_id: battle.attacker_id,
                            number_of_armies: battle.current_attacker_armies
                        }
                    })];
            case 13:
                _b.sent();
                return [4 /*yield*/, playersCollection.updateOne({ house: battle.attacker_id, game_id: ongoingGame._id }, { $set: { conquered: true } })];
            case 14:
                _b.sent();
                return [3 /*break*/, 17];
            case 15:
                if (!(battle.state === "defender-won")) return [3 /*break*/, 17];
                return [4 /*yield*/, territoriesCollection.updateOne({ _id: new mongodb_1.ObjectId(battle.defender_territory_id), game_id: ongoingGame._id }, { $set: { number_of_armies: battle.current_defender_armies } })];
            case 16:
                _b.sent();
                _b.label = 17;
            case 17: return [4 /*yield*/, battlesCollection.updateOne({ _id: battle._id, game_id: ongoingGame._id }, { $set: battle })];
            case 18:
                _b.sent();
                return [4 /*yield*/, (0, broadcastService_1.broadcastBattleEnd)(battle)];
            case 19:
                _b.sent();
                _b.label = 20;
            case 20: return [3 /*break*/, 23];
            case 21: return [4 /*yield*/, battlesCollection.updateOne({ _id: battle._id, game_id: ongoingGame._id }, { $set: battle })];
            case 22:
                _b.sent();
                _b.label = 23;
            case 23: return [2 /*return*/, rollResult];
            case 24:
                error_4 = _b.sent();
                console.error("Error rolling dice: ", error_4);
                throw error_4;
            case 25: return [2 /*return*/];
        }
    });
}); };
exports.rollDiceService = rollDiceService;
