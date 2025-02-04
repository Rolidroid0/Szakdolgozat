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
exports.getOngoingGameState = exports.checkGameEnd = exports.applyManeuver = exports.endPhase = exports.endTurn = exports.applyAdditionalArmies = exports.getCurrentRound = exports.getOngoingGame = void 0;
var db_1 = require("../config/db");
var functions_1 = require("../utils/functions");
var mongodb_1 = require("mongodb");
var ws_1 = require("ws");
var websocket_1 = require("../config/websocket");
var cardsService_1 = require("./cardsService");
var enums_1 = require("../models/enums");
var getOngoingGame = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, gamesCollection, game, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!gamesCollection) {
                    throw new Error("Games collection not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                game = _a.sent();
                if (!game) {
                    throw new Error("No ongoing game found");
                }
                return [2 /*return*/, game];
            case 3:
                error_1 = _a.sent();
                console.error('Error getting game: ', error_1);
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getOngoingGame = getOngoingGame;
var getCurrentRound = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, gamesCollection, ongoingGame, round, current_player, round_state;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!gamesCollection) {
                    throw new Error("Games collection not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    return [2 /*return*/, { message: "No ongoing game found" }];
                }
                round = ongoingGame.round, current_player = ongoingGame.current_player, round_state = ongoingGame.round_state;
                return [2 /*return*/, { round: round, current_player: current_player, round_state: round_state }];
        }
    });
}); };
exports.getCurrentRound = getCurrentRound;
var applyAdditionalArmies = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, gamesCollection, ongoingGame, additionalArmies;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, (0, functions_1.calculatePlusArmies)(playerId)];
            case 3:
                additionalArmies = _a.sent();
                return [4 /*yield*/, playersCollection.updateOne({ _id: playerId, game_id: ongoingGame._id }, { $inc: { plus_armies: additionalArmies } })];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.applyAdditionalArmies = applyAdditionalArmies;
var endTurn = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, gamesCollection, ongoingGame, currentPlayer, currentPlayerDoc, wss, gameEnded, players, currentPlayerIndex, nextPlayerIndex, currentRound, nextPlayer, nextRoundState_1, wss;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                currentPlayer = ongoingGame.current_player;
                return [4 /*yield*/, playersCollection.findOne({ _id: playerId, game_id: ongoingGame._id })];
            case 3:
                currentPlayerDoc = _a.sent();
                if (!currentPlayerDoc || currentPlayerDoc.house !== currentPlayer) {
                    throw new Error("It's not your turn!");
                }
                if (currentPlayerDoc.plus_armies > 0 && ongoingGame.round_state === "reinforcement") {
                    throw new Error("You still have armies to place");
                }
                if (!currentPlayerDoc.conquered) return [3 /*break*/, 6];
                return [4 /*yield*/, (0, cardsService_1.drawCard)(currentPlayerDoc._id)];
            case 4:
                _a.sent();
                currentPlayerDoc.conquered = false;
                return [4 /*yield*/, playersCollection.updateOne({ _id: currentPlayerDoc._id, game_id: ongoingGame._id }, { $set: { conquered: false } })];
            case 5:
                _a.sent();
                wss = (0, websocket_1.getWebSocketServer)();
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            action: 'cards-updated',
                            data: { playerId: currentPlayerDoc._id }
                        }));
                    }
                });
                _a.label = 6;
            case 6: return [4 /*yield*/, (0, exports.checkGameEnd)()];
            case 7:
                gameEnded = _a.sent();
                if (gameEnded) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, playersCollection.find({ game_id: ongoingGame._id }).toArray()];
            case 8:
                players = _a.sent();
                currentPlayerIndex = players.findIndex(function (player) { return player._id.equals(playerId); });
                nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
                currentRound = ongoingGame.round;
                if (nextPlayerIndex === 0) {
                    currentRound += 1;
                }
                nextPlayer = players[nextPlayerIndex];
                if (!nextPlayer) return [3 /*break*/, 11];
                return [4 /*yield*/, (0, exports.applyAdditionalArmies)(nextPlayer._id)];
            case 9:
                _a.sent();
                nextRoundState_1 = enums_1.RoundState.Reinforcement;
                return [4 /*yield*/, gamesCollection.updateOne({ _id: ongoingGame._id }, { $set: { current_player: nextPlayer.house, round: currentRound, round_state: nextRoundState_1 } })];
            case 10:
                _a.sent();
                wss = (0, websocket_1.getWebSocketServer)();
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ action: 'round-updated', data: { current_round: currentRound, currentHouse: nextPlayer.house, round_state: nextRoundState_1 } }));
                    }
                });
                return [3 /*break*/, 12];
            case 11:
                console.error('No next player found');
                _a.label = 12;
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.endTurn = endTurn;
var endPhase = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, gamesCollection, playersCollection, ongoingGame, player, phaseOrder, currentPhaseIndex, nextRoundState_2, wss, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                if (!gamesCollection || !playersCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: new mongodb_1.ObjectId(playerId), game_id: ongoingGame._id })];
            case 3:
                player = _a.sent();
                if (!player) {
                    throw new Error("No player found");
                }
                if (ongoingGame.current_player !== player.house) {
                    throw new Error("Not your turn");
                }
                if (player.plus_armies > 0 && ongoingGame.round_state === "reinforcement") {
                    throw new Error("You still have armies to place");
                }
                phaseOrder = [enums_1.RoundState.Reinforcement, enums_1.RoundState.Invasion, enums_1.RoundState.Maneuver];
                currentPhaseIndex = phaseOrder.indexOf(ongoingGame.round_state);
                if (!(currentPhaseIndex === -1)) return [3 /*break*/, 4];
                throw new Error("Invalid game phase");
            case 4:
                if (!(currentPhaseIndex < phaseOrder.length - 1)) return [3 /*break*/, 5];
                nextRoundState_2 = phaseOrder[currentPhaseIndex + 1];
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, (0, exports.endTurn)(playerId)];
            case 6:
                _a.sent();
                return [2 /*return*/, "endTurn"];
            case 7: return [4 /*yield*/, gamesCollection.updateOne({ _id: ongoingGame._id }, { $set: { round_state: nextRoundState_2 } })];
            case 8:
                _a.sent();
                wss = (0, websocket_1.getWebSocketServer)();
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            action: 'round-state-updated',
                            data: { round_state: nextRoundState_2 }
                        }));
                    }
                });
                return [2 /*return*/, nextRoundState_2];
            case 9:
                error_2 = _a.sent();
                console.error("Error ending reinforcement phase: ", error_2);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.endPhase = endPhase;
var applyManeuver = function (playerId, fromTerritoryId, toTerritoryId, armies) { return __awaiter(void 0, void 0, void 0, function () {
    var db, territoriesCollection, playersCollection, gamesCollection, ongoingGame, player, fromTerritory, toTerritory, validManeuver, wss;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!territoriesCollection || !playersCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: playerId, game_id: ongoingGame._id })];
            case 3:
                player = _a.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                return [4 /*yield*/, territoriesCollection.findOne({ _id: fromTerritoryId, game_id: ongoingGame._id })];
            case 4:
                fromTerritory = _a.sent();
                return [4 /*yield*/, territoriesCollection.findOne({ _id: toTerritoryId, game_id: ongoingGame._id })];
            case 5:
                toTerritory = _a.sent();
                if (!fromTerritory || !toTerritory) {
                    throw new Error("Territories not found");
                }
                if (fromTerritory.owner_id !== player.house || toTerritory.owner_id !== player.house) {
                    throw new Error("You can only maneuver armies between your own territories");
                }
                return [4 /*yield*/, (0, functions_1.validateManeuver)(fromTerritoryId, toTerritoryId, playerId)];
            case 6:
                validManeuver = _a.sent();
                if (!validManeuver) {
                    throw new Error("Not a valid maneuver.");
                }
                if (fromTerritory.number_of_armies <= armies) {
                    throw new Error("Not enough armies to maneuver.");
                }
                return [4 /*yield*/, territoriesCollection.updateOne({ _id: fromTerritoryId, game_id: ongoingGame._id }, { $inc: { number_of_armies: -armies } })];
            case 7:
                _a.sent();
                return [4 /*yield*/, territoriesCollection.updateOne({ _id: toTerritoryId, game_id: ongoingGame._id }, { $inc: { number_of_armies: armies } })];
            case 8:
                _a.sent();
                wss = (0, websocket_1.getWebSocketServer)();
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            action: 'territories-updated',
                            data: { fromTerritoryId: fromTerritoryId, toTerritoryId: toTerritoryId }
                        }));
                    }
                });
                return [4 /*yield*/, (0, exports.endPhase)(playerId)];
            case 9:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.applyManeuver = applyManeuver;
var checkGameEnd = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, territoriesCollection, cardsCollection, gamesCollection, ongoingGame, endCard, players, _i, players_1, player, playerTerritories, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 12, , 13]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                cardsCollection = db === null || db === void 0 ? void 0 : db.collection('EssosCards');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !territoriesCollection || !cardsCollection || !gamesCollection) {
                    throw new Error('Collections not found');
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error('No ongoing game found');
                }
                return [4 /*yield*/, cardsCollection.findOne({ game_id: ongoingGame._id, symbol: enums_1.Symbol.End, owner_id: { $ne: "in deck" } })];
            case 3:
                endCard = _a.sent();
                if (!endCard) return [3 /*break*/, 5];
                console.log("Game (_id: ".concat(ongoingGame._id, ") ends because 'Valar Morghulis' card was drawn."));
                return [4 /*yield*/, (0, functions_1.calculateScores)()];
            case 4: return [2 /*return*/, _a.sent()];
            case 5: return [4 /*yield*/, playersCollection.find({ game_id: ongoingGame._id }).toArray()];
            case 6:
                players = _a.sent();
                _i = 0, players_1 = players;
                _a.label = 7;
            case 7:
                if (!(_i < players_1.length)) return [3 /*break*/, 11];
                player = players_1[_i];
                return [4 /*yield*/, territoriesCollection.countDocuments({ owner_id: player.house, game_id: ongoingGame._id })];
            case 8:
                playerTerritories = _a.sent();
                if (!(playerTerritories === 0)) return [3 /*break*/, 10];
                console.log("Game (_id: ".concat(ongoingGame._id, ") ends because ").concat(player.house, " has no territories."));
                return [4 /*yield*/, (0, functions_1.calculateScores)()];
            case 9: return [2 /*return*/, _a.sent()];
            case 10:
                _i++;
                return [3 /*break*/, 7];
            case 11: return [3 /*break*/, 13];
            case 12:
                error_3 = _a.sent();
                console.error('Error checking game end: ', error_3);
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); };
exports.checkGameEnd = checkGameEnd;
// FOR THE AI
var getOngoingGameState = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, gamesCollection, territoriesCollection, playersCollection, ongoingGame, current_player, territories, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                if (!gamesCollection || !territoriesCollection || !playersCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, playersCollection.findOne({ game_id: ongoingGame._id, house: ongoingGame.current_player })];
            case 3:
                current_player = _a.sent();
                if (!current_player) {
                    throw new Error("Player not found");
                }
                return [4 /*yield*/, territoriesCollection.find({ game_id: ongoingGame._id }).toArray()];
            case 4:
                territories = _a.sent();
                return [2 /*return*/, {
                        _id: ongoingGame._id,
                        current_player: ongoingGame.current_player,
                        current_player_id: current_player._id,
                        players: ongoingGame.players,
                        state: ongoingGame.state,
                        round: ongoingGame.round,
                        round_state: ongoingGame.round_state,
                        territories: territories
                    }];
            case 5:
                error_4 = _a.sent();
                console.error('Error getting game state: ', error_4);
                throw error_4;
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getOngoingGameState = getOngoingGameState;
