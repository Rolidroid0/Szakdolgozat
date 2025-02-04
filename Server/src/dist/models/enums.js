"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundState = exports.Role = exports.Symbol = exports.Table = void 0;
var Table;
(function (Table) {
    Table["Westeros"] = "Westeros";
    Table["Essos"] = "Essos";
})(Table || (exports.Table = Table = {}));
var Symbol;
(function (Symbol) {
    Symbol["Fortress"] = "fortress";
    Symbol["Knight"] = "knight";
    Symbol["SiegeEngine"] = "siegeEngine";
    Symbol["End"] = "end";
})(Symbol || (exports.Symbol = Symbol = {}));
var Role;
(function (Role) {
    Role["Attacker"] = "attacker";
    Role["Defender"] = "defender";
})(Role || (exports.Role = Role = {}));
var RoundState;
(function (RoundState) {
    RoundState["Reinforcement"] = "reinforcement";
    RoundState["Invasion"] = "invasion";
    RoundState["Maneuver"] = "maneuver";
})(RoundState || (exports.RoundState = RoundState = {}));
