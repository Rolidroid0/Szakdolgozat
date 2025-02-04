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
exports.seedEssosTerritories = void 0;
var fs_1 = require("fs");
var path = require("path");
var db_1 = require("../config/db");
var enums_1 = require("../models/enums");
var seedEssosTerritories = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, essosTerritoriesCollection, gamesCollection, ongoingGame_1, filePath, fileContent, essosTerritories, _i, essosTerritories_1, territory, neighborTerritories, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 10, , 11]);
                return [4 /*yield*/, (0, db_1.connectToDb)()];
            case 1:
                db = _a.sent();
                essosTerritoriesCollection = db === null || db === void 0 ? void 0 : db.collection('EssosTerritories');
                gamesCollection = db === null || db === void 0 ? void 0 : db.collection('Games');
                if (!essosTerritoriesCollection || !gamesCollection) {
                    throw new Error("Collections not found");
                }
                return [4 /*yield*/, gamesCollection.findOne({ state: "ongoing" })];
            case 2:
                ongoingGame_1 = _a.sent();
                if (!ongoingGame_1) {
                    throw new Error("No ongoing game found");
                }
                filePath = path.join(__dirname, 'EssosTerritories.csv');
                return [4 /*yield*/, fs_1.promises.readFile(filePath, 'utf-8')];
            case 3:
                fileContent = _a.sent();
                essosTerritories = fileContent
                    .split('\n')
                    .slice(1)
                    .filter(function (line) { return line.trim(); })
                    .map(function (line) {
                    var _a = line.split(','), name = _a[0], fortress = _a[1], port = _a[2], region = _a[3], neighbors = _a[4], owner_id = _a[5], last_attacked_from = _a[6];
                    return {
                        game_id: ongoingGame_1._id,
                        table: enums_1.Table.Essos,
                        name: name.trim(),
                        fortress: parseInt(fortress.trim()),
                        port: parseInt(port.trim()),
                        region: region.trim(),
                        neighbors: neighbors ? neighbors.split(';').map(function (n) { return n.trim(); }) : [],
                        owner_id: owner_id.trim(),
                        number_of_armies: 2,
                        last_attacked_from: parseInt(last_attacked_from.trim()),
                    };
                });
                return [4 /*yield*/, essosTerritoriesCollection.insertMany(essosTerritories)];
            case 4:
                _a.sent();
                _i = 0, essosTerritories_1 = essosTerritories;
                _a.label = 5;
            case 5:
                if (!(_i < essosTerritories_1.length)) return [3 /*break*/, 9];
                territory = essosTerritories_1[_i];
                return [4 /*yield*/, essosTerritoriesCollection.find({
                        name: { $in: territory.neighbors }
                    }).toArray()];
            case 6:
                neighborTerritories = _a.sent();
                return [4 /*yield*/, essosTerritoriesCollection.updateOne({ name: territory.name }, { $set: { neighbors: neighborTerritories.map(function (t) { return t._id; }) } })];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 5];
            case 9:
                console.log('Essos territories seeded successfully.');
                return [3 /*break*/, 11];
            case 10:
                error_1 = _a.sent();
                console.log('Error during seeding Essos territories: ', error_1);
                throw error_1;
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.seedEssosTerritories = seedEssosTerritories;
//seedEssosTerritories();
//npx ts-node .\src\db-seed\seedEssosTerritories.ts
