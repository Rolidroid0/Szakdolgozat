import { Szimbólum, Tábla } from "./Enums";

export interface Kártya {
    tábla: Tábla;
    név: string;
    szimbólum: Szimbólum;
    birtokos: string;
    sorszám: number;
}