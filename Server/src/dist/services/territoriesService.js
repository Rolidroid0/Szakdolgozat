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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reinforceTerritory = exports.findAttackableTerritories = exports.findConnectedTerritories = exports.allocateTerritories = exports.getTerritoryById = exports.getTerritories = void 0;
var mongodb_1 = require("mongodb");
var db_1 = require("../config/db");
var websocket_1 = require("../config/websocket");
var WebSocket = require("ws");
var gamesService_1 = require("./gamesService");
var getTerritories = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, territoriesCollection, gamesCollection, ongoingGame, territories;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!territoriesCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, territoriesCollection.find({ game_id: ongoingGame._id }).toArray()];
            case 3:
                territories = _a.sent();
                return [2 /*return*/, territories];
        }
    });
}); };
exports.getTerritories = getTerritories;
var getTerritoryById = function (territoryId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, territoriesCollection, gamesCollection, ongoingGame, territory, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!territoriesCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, territoriesCollection.findOne({ _id: new mongodb_1.ObjectId(territoryId), game_id: ongoingGame._id })];
            case 3:
                territory = _a.sent();
                if (!territory) {
                    throw new Error("Territory not found");
                }
                return [2 /*return*/, territory];
            case 4:
                error_1 = _a.sent();
                console.error('Error getting territory: ', error_1);
                throw error_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getTerritoryById = getTerritoryById;
var allocateTerritories = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, territoriesCollection_1, playersCollection, gamesCollection, ongoingGame_1, territories, players, player1_1, player2_1, player1Territories, player2Territories, neutralTerritories, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                territoriesCollection_1 = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!territoriesCollection_1 || !playersCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame_1 = _a.sent();
                if (!ongoingGame_1) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, territoriesCollection_1.find({ game_id: ongoingGame_1._id }).toArray()];
            case 3:
                territories = _a.sent();
                territories.sort(function () { return Math.random() - 0.5; });
                return [4 /*yield*/, playersCollection.find({ game_id: ongoingGame_1._id }).toArray()];
            case 4:
                players = _a.sent();
                if (players.length < 2) {
                    throw new Error("There are not enough players");
                }
                player1_1 = players[0].house;
                player2_1 = players[1].house;
                player1Territories = territories.slice(0, 12);
                player2Territories = territories.slice(12, 24);
                neutralTerritories = territories.slice(24);
                return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray(__spreadArray([], player1Territories.map(function (territory) {
                        return territoriesCollection_1.updateOne({ _id: territory._id, game_id: ongoingGame_1._id }, { $set: { owner_id: player1_1, last_attacked_from: 0, number_of_armies: 2 } });
                    }), true), player2Territories.map(function (territory) {
                        return territoriesCollection_1.updateOne({ _id: territory._id, game_id: ongoingGame_1._id }, { $set: { owner_id: player2_1, last_attacked_from: 0, number_of_armies: 2 } });
                    }), true), neutralTerritories.map(function (territory) {
                        return territoriesCollection_1.updateOne({ _id: territory._id, game_id: ongoingGame_1._id }, { $set: { owner_id: 'neutral', last_attacked_from: 0, number_of_armies: 2 } });
                    }), true))];
            case 5:
                _a.sent();
                console.log("Territories have been successfully allocated to players");
                return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                console.error('Error in allocateTerritories: ', error_2);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.allocateTerritories = allocateTerritories;
var findConnectedTerritories = function (startingTerritoryId, playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, territoriesCollection, playersCollection, gamesCollection, ongoingGame, player, startingTerritory, visited, queue, connectedTerritories, currentTerritoryId, currentTerritory, _i, _a, neighborId, neighborIdStr, neighborTerritory, portTerritories, _b, portTerritories_1, portTerritory, portTerritoryIdStr;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _c.sent();
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!territoriesCollection || !playersCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _c.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: new mongodb_1.ObjectId(playerId), game_id: ongoingGame._id })];
            case 3:
                player = _c.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                return [4 /*yield*/, territoriesCollection.findOne({ _id: startingTerritoryId, game_id: ongoingGame._id })];
            case 4:
                startingTerritory = _c.sent();
                if (!startingTerritory || startingTerritory.owner_id !== player.house) {
                    throw new Error("Invalid starting territory or you do not own it");
                }
                visited = new Set();
                queue = [startingTerritory.name];
                connectedTerritories = [];
                visited.add(startingTerritory.name);
                _c.label = 5;
            case 5:
                if (!(queue.length > 0)) return [3 /*break*/, 13];
                currentTerritoryId = queue.shift();
                return [4 /*yield*/, territoriesCollection.findOne({ name: currentTerritoryId, game_id: ongoingGame._id })];
            case 6:
                currentTerritory = _c.sent();
                if (!currentTerritory)
                    return [3 /*break*/, 5];
                if (currentTerritory.owner_id === player.house) {
                    connectedTerritories.push(currentTerritory);
                }
                _i = 0, _a = currentTerritory.neighbors;
                _c.label = 7;
            case 7:
                if (!(_i < _a.length)) return [3 /*break*/, 10];
                neighborId = _a[_i];
                neighborIdStr = neighborId.toString();
                if (!!visited.has(neighborIdStr)) return [3 /*break*/, 9];
                return [4 /*yield*/, territoriesCollection.findOne({ name: neighborId, game_id: ongoingGame._id })];
            case 8:
                neighborTerritory = _c.sent();
                if ((neighborTerritory === null || neighborTerritory === void 0 ? void 0 : neighborTerritory.owner_id) === player.house) {
                    visited.add(neighborIdStr);
                    queue.push(neighborIdStr);
                }
                _c.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 7];
            case 10:
                if (!(currentTerritory.port === 1)) return [3 /*break*/, 12];
                return [4 /*yield*/, territoriesCollection.find({ port: 1, owner_id: player.house, game_id: ongoingGame._id }).toArray()];
            case 11:
                portTerritories = _c.sent();
                for (_b = 0, portTerritories_1 = portTerritories; _b < portTerritories_1.length; _b++) {
                    portTerritory = portTerritories_1[_b];
                    portTerritoryIdStr = portTerritory._id.toString();
                    if (!visited.has(portTerritoryIdStr) && portTerritoryIdStr !== currentTerritoryId.toString()) {
                        visited.add(portTerritoryIdStr);
                        queue.push(portTerritory.name);
                    }
                }
                _c.label = 12;
            case 12: return [3 /*break*/, 5];
            case 13: return [2 /*return*/, connectedTerritories.filter(function (t) { return t._id.toString() !== startingTerritoryId.toString(); })];
        }
    });
}); };
exports.findConnectedTerritories = findConnectedTerritories;
var findAttackableTerritories = function (startingTerritoryId, playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, territoriesCollection, playersCollection, gamesCollection, ongoingGame, player, startingTerritory, attackableTerritories, _i, _a, neighborId, attackableTerritory, portTerritories, _loop_1, _b, portTerritories_2, portTerritory;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _c.sent();
                territoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!territoriesCollection || !playersCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _c.sent();
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: playerId, game_id: ongoingGame._id })];
            case 3:
                player = _c.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                return [4 /*yield*/, territoriesCollection.findOne({ _id: startingTerritoryId, game_id: ongoingGame._id })];
            case 4:
                startingTerritory = _c.sent();
                if (!startingTerritory || startingTerritory.owner_id !== player.house) {
                    throw new Error("Invalid starting territory or you do not own it");
                }
                attackableTerritories = [];
                _i = 0, _a = startingTerritory.neighbors;
                _c.label = 5;
            case 5:
                if (!(_i < _a.length)) return [3 /*break*/, 8];
                neighborId = _a[_i];
                return [4 /*yield*/, territoriesCollection.findOne({ name: neighborId, game_id: ongoingGame._id })];
            case 6:
                attackableTerritory = _c.sent();
                if (attackableTerritory && attackableTerritory.owner_id !== player.house) {
                    attackableTerritories.push(attackableTerritory);
                }
                _c.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 5];
            case 8:
                if (!(startingTerritory.port === 1)) return [3 /*break*/, 10];
                return [4 /*yield*/, territoriesCollection.find({ port: 1, owner_id: { $ne: player.house }, game_id: ongoingGame._id }).toArray()];
            case 9:
                portTerritories = _c.sent();
                _loop_1 = function (portTerritory) {
                    var isAlreadyIncluded = attackableTerritories.some(function (t) { return t._id.equals(portTerritory._id); });
                    if (!isAlreadyIncluded) {
                        attackableTerritories.push(portTerritory);
                    }
                };
                for (_b = 0, portTerritories_2 = portTerritories; _b < portTerritories_2.length; _b++) {
                    portTerritory = portTerritories_2[_b];
                    _loop_1(portTerritory);
                }
                _c.label = 10;
            case 10: return [2 /*return*/, attackableTerritories];
        }
    });
}); };
exports.findAttackableTerritories = findAttackableTerritories;
var reinforceTerritory = function (playerId, territoryId, armies) { return __awaiter(void 0, void 0, void 0, function () {
    var db, gamesCollection, territoriesCollection, playersCollection, ongoingGame, player, territory_1, wss, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
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
                return [4 /*yield*/, playersCollection.findOne({ _id: new mongodb_1.ObjectId(playerId), game_id: ongoingGame._id })];
            case 3:
                player = _a.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                return [4 /*yield*/, territoriesCollection.findOne({ _id: new mongodb_1.ObjectId(territoryId), game_id: ongoingGame._id })];
            case 4:
                territory_1 = _a.sent();
                if (!territory_1) {
                    throw new Error("Territory not found");
                }
                if (territory_1.owner_id !== player.house) {
                    throw new Error("You do not own this territory");
                }
                if (ongoingGame.round_state !== "reinforcement") {
                    throw new Error("Reinforcement phase is not active");
                }
                if (armies > player.plus_armies) {
                    throw new Error("You do not have enough armies");
                }
                if (armies < 0) {
                    throw new Error("Armies can not be negative");
                }
                return [4 /*yield*/, territoriesCollection.updateOne({ _id: territory_1._id, game_id: ongoingGame._id }, { $inc: { number_of_armies: armies } })];
            case 5:
                _a.sent();
                return [4 /*yield*/, playersCollection.updateOne({ _id: player._id, game_id: ongoingGame._id }, { $inc: { plus_armies: -armies } })];
            case 6:
                _a.sent();
                wss = (0, websocket_1.getWebSocketServer)();
                wss.clients.forEach(function (client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            action: 'territory-updated',
                            data: { territory: territory_1 }
                        }));
                    }
                });
                if (!(player.plus_armies - armies === 0)) return [3 /*break*/, 8];
                return [4 /*yield*/, (0, gamesService_1.endPhase)(playerId)];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                error_3 = _a.sent();
                console.error("Error reinforcing territory: ", error_3);
                throw error_3;
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.reinforceTerritory = reinforceTerritory;
/*ha már lesz changeTerritory data vagy valami:
function broadcastTerritoryUpdate(territory) {
  const data = {
    action: 'territory-updated',
    territory
  };
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}*/ 
