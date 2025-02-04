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
exports.drawCard = exports.tradeCardsForArmies = exports.getPlayerCardsService = exports.shuffle = void 0;
var db_1 = require("../config/db");
var ws_1 = require("ws");
var functions_1 = require("../utils/functions");
var mongodb_1 = require("mongodb");
var enums_1 = require("../models/enums");
var websocket_1 = require("../config/websocket");
var shuffle = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, essosCards, gamesCollection, ongoingGame, cardsCursor, cardCount, shuffledNumbers, index, card, endCard, minPosition, maxPosition, newEndPosition, otherCard, shuffledCards_1, wss, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 16, , 17]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                essosCards = db === null || db === void 0 ? void 0 : db.collection('EssosCards');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!essosCards || !gamesCollection) {
                    throw new Error('Collections not found');
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error('No ongoing game found');
                }
                return [4 /*yield*/, essosCards.find({ game_id: ongoingGame._id })];
            case 3:
                cardsCursor = _a.sent();
                return [4 /*yield*/, essosCards.countDocuments({ game_id: ongoingGame._id })];
            case 4:
                cardCount = _a.sent();
                shuffledNumbers = (0, functions_1.default)(cardCount);
                index = 0;
                _a.label = 5;
            case 5: return [4 /*yield*/, cardsCursor.hasNext()];
            case 6:
                if (!_a.sent()) return [3 /*break*/, 10];
                return [4 /*yield*/, cardsCursor.next()];
            case 7:
                card = _a.sent();
                if (!card) return [3 /*break*/, 9];
                return [4 /*yield*/, essosCards.updateOne({ _id: card._id, game_id: ongoingGame._id }, { $set: { sequence_number: shuffledNumbers[index] } })];
            case 8:
                _a.sent();
                index++;
                _a.label = 9;
            case 9: return [3 /*break*/, 5];
            case 10: return [4 /*yield*/, essosCards.findOne({ symbol: enums_1.Symbol.End, game_id: ongoingGame._id })];
            case 11:
                endCard = _a.sent();
                minPosition = Math.floor(cardCount / 2);
                maxPosition = cardCount - 1;
                newEndPosition = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;
                return [4 /*yield*/, essosCards.findOne({ sequence_number: newEndPosition, game_id: ongoingGame._id })];
            case 12:
                otherCard = _a.sent();
                if (!endCard || !otherCard) {
                    console.error('Cards not found');
                    return [2 /*return*/];
                }
                return [4 /*yield*/, essosCards.updateOne({ _id: endCard._id, game_id: ongoingGame._id }, { $set: { sequence_number: newEndPosition } })];
            case 13:
                _a.sent();
                return [4 /*yield*/, essosCards.updateOne({ _id: otherCard._id, game_id: ongoingGame._id }, { $set: { sequence_number: endCard.sequence_number } })];
            case 14:
                _a.sent();
                return [4 /*yield*/, essosCards.find({ game_id: ongoingGame._id }).toArray()];
            case 15:
                shuffledCards_1 = _a.sent();
                wss = (0, websocket_1.getWebSocketServer)();
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({ action: 'shuffle-cards', cards: shuffledCards_1 }));
                    }
                });
                console.log('Shuffle complete');
                return [3 /*break*/, 17];
            case 16:
                error_1 = _a.sent();
                console.error('An error occured when shuffling the cards:', error_1);
                return [3 /*break*/, 17];
            case 17: return [2 /*return*/];
        }
    });
}); };
exports.shuffle = shuffle;
var getPlayerCardsService = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, cardsCollection, gamesCollection, ongoingGame, player, playerCards;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                cardsCollection = db === null || db === void 0 ? void 0 : db.collection('EssosCards');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !cardsCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error('No ongoing game found');
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: new mongodb_1.ObjectId(playerId), game_id: ongoingGame._id })];
            case 3:
                player = _a.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                return [4 /*yield*/, cardsCollection.find({ owner_id: player.house, game_id: ongoingGame._id }).toArray()];
            case 4:
                playerCards = _a.sent();
                return [2 /*return*/, playerCards];
        }
    });
}); };
exports.getPlayerCardsService = getPlayerCardsService;
var tradeCardsForArmies = function (playerId, cardIds) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, cardsCollection, gamesCollection, ongoingGame, player, selectedCards, symbols, territories, symbolSet, additionalArmies;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                cardsCollection = db === null || db === void 0 ? void 0 : db.collection('EssosCards');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !cardsCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error('No ongoing game found');
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: playerId, game_id: ongoingGame._id })];
            case 3:
                player = _a.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                if (ongoingGame.current_player !== player.house || ongoingGame.round_state !== enums_1.RoundState.Reinforcement) {
                    throw new Error("You can only trade cards during your reinforcement phase");
                }
                return [4 /*yield*/, cardsCollection.find({ _id: { $in: cardIds }, owner_id: player.house, game_id: ongoingGame._id }).toArray()];
            case 4:
                selectedCards = _a.sent();
                if (selectedCards.length !== 3) {
                    throw new Error("You must trade exactly 3 cards");
                }
                symbols = selectedCards.map(function (card) { return card.symbol; });
                territories = selectedCards.map(function (card) { return card.name; });
                symbolSet = new Set(symbols);
                additionalArmies = 0;
                if (symbolSet.size === 1) {
                    switch (symbols[0]) {
                        case enums_1.Symbol.Knight:
                            additionalArmies = 4;
                            break;
                        case enums_1.Symbol.SiegeEngine:
                            additionalArmies = 5;
                            break;
                        case enums_1.Symbol.Fortress:
                            additionalArmies = 6;
                            break;
                    }
                }
                else if (symbolSet.size === 3) {
                    additionalArmies = 7;
                }
                else {
                    throw new Error("Invalid combination of card symbols");
                }
                return [4 /*yield*/, playersCollection.updateOne({ _id: playerId, game_id: ongoingGame._id }, { $inc: { plus_armies: additionalArmies } })];
            case 5:
                _a.sent();
                return [4 /*yield*/, cardsCollection.updateMany({ _id: { $in: cardIds }, game_id: ongoingGame._id }, { $set: { owner_id: "usedThisGame" } })];
            case 6:
                _a.sent();
                return [4 /*yield*/, (0, functions_1.assignTerritoryBonus)(playerId, territories)];
            case 7:
                _a.sent();
                return [2 /*return*/, additionalArmies];
        }
    });
}); };
exports.tradeCardsForArmies = tradeCardsForArmies;
var drawCard = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, cardsCollection, gamesCollection, ongoingGame, player, topCard, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                cardsCollection = db === null || db === void 0 ? void 0 : db.collection('EssosCards');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !cardsCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    throw new Error('No ongoing game found');
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: playerId, game_id: ongoingGame._id })];
            case 3:
                player = _a.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                if (!player.conquered) return [3 /*break*/, 6];
                return [4 /*yield*/, cardsCollection.findOne({ owner_id: "in deck", game_id: ongoingGame._id }, { sort: { sequence_number: 1 } })];
            case 4:
                topCard = _a.sent();
                if (!topCard) {
                    throw new Error('No cards left in deck');
                }
                return [4 /*yield*/, cardsCollection.updateOne({ _id: topCard._id, game_id: ongoingGame._id }, { $set: { owner_id: player.house } })];
            case 5:
                _a.sent();
                return [2 /*return*/, topCard];
            case 6: throw new Error('Player has not conquered a territory');
            case 7: return [3 /*break*/, 9];
            case 8:
                error_2 = _a.sent();
                console.error(error_2);
                throw new Error('Error drawing card');
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.drawCard = drawCard;
exports.default = exports.shuffle;
