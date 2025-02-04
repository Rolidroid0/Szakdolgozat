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
exports.logoutPlayer = exports.loginPlayer = exports.generatePlayers = exports.getPlayerById = exports.getPlayers = void 0;
var db_1 = require("../config/db");
var mongodb_1 = require("mongodb");
var getPlayers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, gamesCollection, ongoingGame, players;
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
                return [4 /*yield*/, playersCollection.find({ game_id: ongoingGame._id }).toArray()];
            case 3:
                players = _a.sent();
                return [2 /*return*/, players];
        }
    });
}); };
exports.getPlayers = getPlayers;
var getPlayerById = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, gamesCollection, ongoingGame, player, error_1;
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
                return [4 /*yield*/, playersCollection.findOne({ _id: new mongodb_1.ObjectId(playerId), game_id: ongoingGame._id })];
            case 3:
                player = _a.sent();
                if (!player) {
                    throw new Error("Player not found");
                }
                return [2 /*return*/, player];
            case 4:
                error_1 = _a.sent();
                console.error('Error getting player: ', error_1);
                throw error_1;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getPlayerById = getPlayerById;
var generatePlayers = function (numberOfPlayers) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, gamesCollection, ongoingGame, defaultPlayers, players, error_2;
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
                defaultPlayers = [
                    { house: 'Targaryen', plus_armies: 0, conquered: false, is_logged_in: false, game_id: ongoingGame._id },
                    { house: 'Ghiscari', plus_armies: 0, conquered: false, is_logged_in: false, game_id: ongoingGame._id }
                ];
                players = defaultPlayers.slice(0, numberOfPlayers);
                return [4 /*yield*/, playersCollection.insertMany(players)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.error('Error during generating players: ', error_2);
                throw error_2;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.generatePlayers = generatePlayers;
var loginPlayer = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, gamesCollection, ongoingGame, player, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !gamesCollection) {
                    throw new Error('Collections not found');
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame = _a.sent();
                if (!ongoingGame) {
                    return [2 /*return*/, { success: false, message: 'No ongoing game found, start a new one' }];
                }
                return [4 /*yield*/, playersCollection.findOne({ _id: playerId, game_id: ongoingGame._id })];
            case 3:
                player = _a.sent();
                if (player === null || player === void 0 ? void 0 : player.is_logged_in) {
                    return [2 /*return*/, { success: false, message: 'This house is already occupied' }];
                }
                return [4 /*yield*/, playersCollection.updateOne({ _id: playerId, game_id: ongoingGame._id }, { $set: { is_logged_in: true } })];
            case 4:
                _a.sent();
                return [2 /*return*/, { success: true, message: 'Login successful' }];
            case 5:
                error_3 = _a.sent();
                console.error('Error during player login: ', error_3);
                throw error_3;
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.loginPlayer = loginPlayer;
var logoutPlayer = function (playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var db, playersCollection, gamesCollection, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                playersCollection = db === null || db === void 0 ? void 0 : db.collection('Players');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!playersCollection || !gamesCollection) {
                    throw new Error('Collections not found');
                }
                //Nem kell megnézni, a playerId egyedi, nem lesz több játékosnak is ez, viszont így játék végénél fixen kilépteti a klienst
                /*const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }*/
                return [4 /*yield*/, playersCollection.updateOne({ _id: playerId }, //, game_id: ongoingGame._id },
                    { $set: { is_logged_in: false } })];
            case 2:
                //Nem kell megnézni, a playerId egyedi, nem lesz több játékosnak is ez, viszont így játék végénél fixen kilépteti a klienst
                /*const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
                if (!ongoingGame) {
                    throw new Error("No ongoing game found");
                }*/
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error('Error during player logout: ', error_4);
                throw error_4;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.logoutPlayer = logoutPlayer;
