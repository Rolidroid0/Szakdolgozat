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
exports.startGameService = void 0;
var ws_1 = require("ws");
var db_1 = require("../config/db");
var websocket_1 = require("../config/websocket");
var cardsService_1 = require("./cardsService");
var territoriesService_1 = require("./territoriesService");
var playersService_1 = require("./playersService");
var gamesService_1 = require("./gamesService");
var enums_1 = require("../models/enums");
var seedEssosCards_1 = require("../db-seed/seedEssosCards");
var seedEssosTerritories_1 = require("../db-seed/seedEssosTerritories");
var startGameService = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, gamesCollection, playersCollection, battlesCollection, cardsCollection, ongoingGame, newGame, gameResult_1, defaultPlayers_1, wss, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 14, , 15]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                battlesCollection = db === null || db === void 0 ? void 0 : db.collection('Battles');
                cardsCollection = db === null || db === void 0 ? void 0 : db.collection('EssosCards');
                if (!gamesCollection || !playersCollection || !battlesCollection || !cardsCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) return [3 /*break*/, 4];
                return [4 /*yield*/, gamesCollection.updateOne({ _id: ongoingGame._id }, { $set: { state: "terminated" } })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                newGame = {
                    round: 1,
                    current_player: "",
                    players: [],
                    state: "ongoing",
                    round_state: enums_1.RoundState.Reinforcement
                };
                return [4 /*yield*/, gamesCollection.insertOne(newGame)];
            case 5:
                gameResult_1 = _a.sent();
                return [4 /*yield*/, (0, seedEssosCards_1.seedEssosCards)()];
            case 6:
                _a.sent();
                //await cardsCollection.updateMany({}, { $set: { owner_id: "in deck" } });
                return [4 /*yield*/, (0, cardsService_1.default)()];
            case 7:
                //await cardsCollection.updateMany({}, { $set: { owner_id: "in deck" } });
                _a.sent();
                return [4 /*yield*/, (0, playersService_1.generatePlayers)(2)];
            case 8:
                _a.sent();
                return [4 /*yield*/, playersCollection.find({ game_id: gameResult_1.insertedId }).toArray()];
            case 9:
                defaultPlayers_1 = _a.sent();
                return [4 /*yield*/, gamesCollection.updateOne({ _id: gameResult_1.insertedId }, { $set: {
                            current_player: defaultPlayers_1[0].house,
                            players: defaultPlayers_1.map(function (p) { return p.house; })
                        } })];
            case 10:
                _a.sent();
                return [4 /*yield*/, (0, seedEssosTerritories_1.seedEssosTerritories)()];
            case 11:
                _a.sent();
                return [4 /*yield*/, (0, territoriesService_1.allocateTerritories)()];
            case 12:
                _a.sent();
                return [4 /*yield*/, (0, gamesService_1.applyAdditionalArmies)(defaultPlayers_1[0]._id)];
            case 13:
                _a.sent();
                wss = (0, websocket_1.getWebSocketServer)();
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            action: 'start-game',
                            success: true,
                            data: {
                                gameId: gameResult_1.insertedId,
                                players: defaultPlayers_1
                            }
                        }));
                    }
                });
                return [2 /*return*/, gameResult_1];
            case 14:
                error_1 = _a.sent();
                console.error('Error during game start:', error_1);
                throw error_1;
            case 15: return [2 /*return*/];
        }
    });
}); };
exports.startGameService = startGameService;
