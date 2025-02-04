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
exports.calculateScores = exports.assignTerritoryBonus = exports.compareRolls = exports.rollDice = exports.validateManeuver = exports.calculatePlusArmies = exports.handleDisconnect = void 0;
var mongodb_1 = require("mongodb");
var db_1 = require("../config/db");
var territoriesService_1 = require("../services/territoriesService");
var enums_1 = require("../models/enums");
var websocket_1 = require("../config/websocket");
var WebSocket = require("ws");
function generateShuffledNumbers(n) {
    var _a;
    var numbers = Array.from({ length: n }, function (_, i) { return i; });
    for (var i = numbers.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [numbers[j], numbers[i]], numbers[i] = _a[0], numbers[j] = _a[1];
    }
    return numbers;
}
;
var handleDisconnect = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, gamesCollection, ongoingGame, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
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
                return [4 /*yield*/, playersCollection.updateOne({ _id: new mongodb_1.ObjectId(playerId),
                        game_id: ongoingGame._id
                    }, { $set: { is_logged_in: false } })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('Error during player disconnect:', error_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.handleDisconnect = handleDisconnect;
var calculatePlusArmies = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, territoriesCollection, regionsCollection, gamesCollection, ongoingGame, player, territories, territoryCount, fortressCount, additionalArmies, regions, _loop_1, _i, regions_1, region;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                regionsCollection = db === null || db === void 0 ? void 0 : db.collection('Regions');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !territoriesCollection || !regionsCollection || !gamesCollection) {
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
                    throw new Error("No player found");
                }
                return [4 /*yield*/, territoriesCollection.find({ owner_id: player.house, game_id: ongoingGame._id }).toArray()];
            case 4:
                territories = _a.sent();
                territoryCount = territories.length;
                fortressCount = territories.filter(function (territory) { return territory.fortress === 1; }).length;
                additionalArmies = Math.floor((territoryCount + fortressCount) / 3);
                if (additionalArmies < 3)
                    additionalArmies = 3;
                return [4 /*yield*/, regionsCollection.find({}).toArray()];
            case 5:
                regions = _a.sent();
                _loop_1 = function (region) {
                    var ownedTerritoriesInRegion = territories.filter(function (territory) { return territory.region === region.name; });
                    if (ownedTerritoriesInRegion.length === region.territory_count) {
                        additionalArmies += region.region_bonus;
                    }
                };
                for (_i = 0, regions_1 = regions; _i < regions_1.length; _i++) {
                    region = regions_1[_i];
                    _loop_1(region);
                }
                return [2 /*return*/, additionalArmies];
        }
    });
}); };
exports.calculatePlusArmies = calculatePlusArmies;
var validateManeuver = function (fromTerritoryId, toTerritoryId, playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var connectedTerritories, isConnected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, territoriesService_1.findConnectedTerritories)(fromTerritoryId, playerId)];
            case 1:
                connectedTerritories = _a.sent();
                isConnected = connectedTerritories.some(function (t) { return t._id.equals(toTerritoryId); });
                if (!isConnected) {
                    throw new Error("The target territory is not connected to the starting territory");
                }
                return [2 /*return*/, true];
        }
    });
}); };
exports.validateManeuver = validateManeuver;
var rollDice = function (armies, role) { return __awaiter(void 0, void 0, void 0, function () {
    var maxDice, rolls, i;
    return __generator(this, function (_a) {
        maxDice = role === enums_1.Role.Attacker ? 3 : 2;
        rolls = [];
        for (i = 0; i < Math.min(maxDice, armies); i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }
        return [2 /*return*/, rolls.sort(function (a, b) { return b - a; })];
    });
}); };
exports.rollDice = rollDice;
var compareRolls = function (attackerRolls, defenderRolls) { return __awaiter(void 0, void 0, void 0, function () {
    var minRolls, attackerLosses, defenderLosses, i;
    return __generator(this, function (_a) {
        minRolls = Math.min(attackerRolls.length, defenderRolls.length);
        attackerLosses = 0;
        defenderLosses = 0;
        for (i = 0; i < minRolls; i++) {
            if (attackerRolls[i] > defenderRolls[i]) {
                defenderLosses++;
            }
            else {
                attackerLosses++;
            }
        }
        return [2 /*return*/, { attackerLosses: attackerLosses, defenderLosses: defenderLosses }];
    });
}); };
exports.compareRolls = compareRolls;
var assignTerritoryBonus = function (playerId, cardTerritories) { return __awaiter(void 0, void 0, void 0, function () {
    var db, territoriesCollection, playersCollection, gamesCollection, ongoingGame, player, ownedTerritories, _loop_2, _i, ownedTerritories_1, territory;
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
                return [4 /*yield*/, territoriesCollection.find({ owner_id: player.house, game_id: ongoingGame, name: { $in: cardTerritories } }).toArray()];
            case 4:
                ownedTerritories = _a.sent();
                _loop_2 = function (territory) {
                    var updatedTerritory, wss;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, territoriesCollection.updateOne({ _id: territory._id, game_id: ongoingGame._id }, { $inc: { number_of_armies: 2 } })];
                            case 1:
                                _b.sent();
                                return [4 /*yield*/, territoriesCollection.findOne({ _id: territory._id, game_id: ongoingGame._id })];
                            case 2:
                                updatedTerritory = _b.sent();
                                wss = (0, websocket_1.getWebSocketServer)();
                                wss.clients.forEach(function (client) {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify({
                                            action: 'territory-updated',
                                            data: { territory: updatedTerritory }
                                        }));
                                    }
                                });
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, ownedTerritories_1 = ownedTerritories;
                _a.label = 5;
            case 5:
                if (!(_i < ownedTerritories_1.length)) return [3 /*break*/, 8];
                territory = ownedTerritories_1[_i];
                return [5 /*yield**/, _loop_2(territory)];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 5];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.assignTerritoryBonus = assignTerritoryBonus;
var calculateScores = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, territoriesCollection, gamesCollection, ongoingGame, players, scores_1, _loop_3, _i, players_1, player, winner_1, wss, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !territoriesCollection || !gamesCollection) {
                    throw new Error('Collections not found');
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, playersCollection.find({ game_id: ongoingGame._id }).toArray()];
            case 3:
                players = _a.sent();
                scores_1 = [];
                _loop_3 = function (player) {
                    var territories, score;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, territoriesCollection.find({ owner_id: player.house, game_id: ongoingGame._id }).toArray()];
                            case 1:
                                territories = _b.sent();
                                score = 0;
                                score += territories.length;
                                territories.forEach(function (territory) {
                                    if (territory.fortress === 1)
                                        score++;
                                    if (territory.port === 1)
                                        score++;
                                });
                                scores_1.push({ player: player, score: score });
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, players_1 = players;
                _a.label = 4;
            case 4:
                if (!(_i < players_1.length)) return [3 /*break*/, 7];
                player = players_1[_i];
                return [5 /*yield**/, _loop_3(player)];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7:
                winner_1 = scores_1.reduce(function (prev, current) { return (prev.score > current.score ? prev : current); });
                return [4 /*yield*/, gamesCollection.updateOne({ state: "ongoing" }, { $set: { state: "".concat(winner_1.player.house, " won") } })];
            case 8:
                _a.sent();
                wss = (0, websocket_1.getWebSocketServer)();
                wss.clients.forEach(function (client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            action: 'game-over',
                            data: {
                                winner: winner_1.player.house,
                                scores: scores_1.map(function (s) { return ({ player: s.player.house, score: s.score }); })
                            }
                        }));
                    }
                });
                return [2 /*return*/, true];
            case 9:
                error_2 = _a.sent();
                console.error('Error calculating scores: ', error_2);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.calculateScores = calculateScores;
exports.default = generateShuffledNumbers;
