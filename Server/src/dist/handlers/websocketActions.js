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
var cardsService_1 = require("../services/cardsService");
var startGameService_1 = require("../services/startGameService");
var gamesService_1 = require("../services/gamesService");
var mongodb_1 = require("mongodb");
var territoriesService_1 = require("../services/territoriesService");
var battlesService_1 = require("../services/battlesService");
var actions = {
    'shuffle-cards': function (ws, data) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, cardsService_1.shuffle)()];
                case 1:
                    _a.sent();
                    console.log('Shuffle complete');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error during shuffle: ', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    'start-game': function (ws, data) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, startGameService_1.startGameService)()];
                case 1:
                    _a.sent();
                    console.log('Game started successfully');
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.log('Error during game start: ', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    'set-player-id': function (ws, data) {
        ws.playerId = data.playerId;
        console.log("Player ID set for WebSocket: ".concat(ws.playerId));
    },
    'end-of-player-turn': function (ws, data) { return __awaiter(void 0, void 0, void 0, function () {
        var playerId, error_3, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    playerId = data.playerId;
                    return [4 /*yield*/, (0, gamesService_1.endTurn)(new mongodb_1.ObjectId(playerId))];
                case 1:
                    _a.sent();
                    console.log('Players turn ended');
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.log('Error during ending players turn: ', error_3);
                    if (error_3 instanceof Error) {
                        errorMessage = error_3.message;
                        ws.send(JSON.stringify({ action: 'error', errorMessage: errorMessage }));
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    'trade-cards': function (ws, data) { return __awaiter(void 0, void 0, void 0, function () {
        var playerId, cardIds, additionalArmies, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    playerId = data.playerId, cardIds = data.cardIds;
                    return [4 /*yield*/, (0, cardsService_1.tradeCardsForArmies)(new mongodb_1.ObjectId(playerId), cardIds)];
                case 1:
                    additionalArmies = _a.sent();
                    ws.send(JSON.stringify({ action: 'cards-traded', data: { success: true, additionalArmies: additionalArmies } }));
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    ws.send(JSON.stringify({ action: 'cards-traded', data: { success: false, message: error_4 } }));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    'reinforce-territory': function (ws, data) { return __awaiter(void 0, void 0, void 0, function () {
        var playerId, territoryId, armies, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    playerId = data.playerId, territoryId = data.territoryId, armies = data.armies;
                    return [4 /*yield*/, (0, territoriesService_1.reinforceTerritory)(new mongodb_1.ObjectId(playerId), new mongodb_1.ObjectId(territoryId), armies)];
                case 1:
                    _a.sent();
                    ws.send(JSON.stringify({ action: 'territory-reinforced', data: { success: true } }));
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    ws.send(JSON.stringify({ action: 'territory-reinforced', data: { success: false, message: error_5 } }));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    'maneuver': function (ws, data) { return __awaiter(void 0, void 0, void 0, function () {
        var playerId, fromTerritoryId, toTerritoryId, armies, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    playerId = data.playerId, fromTerritoryId = data.fromTerritoryId, toTerritoryId = data.toTerritoryId, armies = data.armies;
                    return [4 /*yield*/, (0, gamesService_1.applyManeuver)(new mongodb_1.ObjectId(playerId), new mongodb_1.ObjectId(fromTerritoryId), new mongodb_1.ObjectId(toTerritoryId), armies)];
                case 1:
                    _a.sent();
                    ws.send(JSON.stringify({ action: 'maneuver-done', data: { success: true } }));
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    ws.send(JSON.stringify({ action: 'maneuver-done', data: { success: false, message: error_6 } }));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    'start-battle': function (ws, data) { return __awaiter(void 0, void 0, void 0, function () {
        var playerId, fromTerritoryId, toTerritoryId, armies, error_7, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    playerId = data.playerId, fromTerritoryId = data.fromTerritoryId, toTerritoryId = data.toTerritoryId, armies = data.armies;
                    return [4 /*yield*/, (0, battlesService_1.startBattle)(new mongodb_1.ObjectId(playerId), new mongodb_1.ObjectId(fromTerritoryId), new mongodb_1.ObjectId(toTerritoryId), armies)];
                case 1:
                    _a.sent();
                    ws.send(JSON.stringify({ action: 'attack-started', data: { success: true } }));
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    errorMessage = error_7 instanceof Error ? error_7.message : 'Unknown error';
                    ws.send(JSON.stringify({ action: 'attack-failed', data: { success: false, message: errorMessage } }));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
};
exports.default = actions;
