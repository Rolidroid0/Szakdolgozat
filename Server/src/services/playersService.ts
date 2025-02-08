import { connectToDb } from "../config/db"
import { ObjectId } from "mongodb";
import { Player } from "../models/playersModel";
import { Game } from "../models/gamesModel";

export const getPlayers = async () => {
    const db = await connectToDb();
    const playersCollection = db?.collection('Players');
    const gamesCollection = db?.collection('Games');

    if (!playersCollection || !gamesCollection) {
        throw new Error("Collections not found");
    }

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
    if (!ongoingGame) {
      throw new Error("No ongoing game found");
    }

    const players = await playersCollection.find<Player>({ game_id: ongoingGame._id }).toArray();
    return players;
};

export const getPlayerById = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const player = await playersCollection.findOne<Player>({ _id: new ObjectId(playerId), game_id: ongoingGame._id });
        if (!player) {
            throw new Error("Player not found");
        }
        
        return player;
    } catch (error) {
        console.error('Error getting player: ', error);
        throw error;
    }
};

export const generatePlayers = async (numberOfPlayers: number) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        //await playersCollection.deleteMany({});

        const defaultPlayers = [
            { house: 'Targaryen', plus_armies: 0, conquered: false, is_logged_in: false, game_id: ongoingGame._id},
            { house: 'Ghiscari', plus_armies: 0, conquered: false, is_logged_in: false, game_id: ongoingGame._id}
        ]

        const players = defaultPlayers.slice(0, numberOfPlayers);

        await playersCollection.insertMany(players);

    } catch (error) {
        console.error('Error during generating players: ', error);
        throw error;
    }
};

export const loginPlayer = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !gamesCollection) {
            throw new Error('Collections not found');
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            return { success: false, message: 'No ongoing game found, start a new one' };
        }

        const player = await playersCollection.findOne<Player>({ _id: playerId, game_id: ongoingGame._id });

        if (player?.is_logged_in) {
            return { success: false, message: 'This house is already occupied' };
        }

        await playersCollection.updateOne(
            { _id: playerId, game_id: ongoingGame._id },
            { $set: { is_logged_in: true } }
        );

        return { success: true, message: 'Login successful' };
    } catch (error) {
        console.error('Error during player login: ', error);
        throw error;
    }
};

export const logoutPlayer = async (playerId: ObjectId) => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !gamesCollection) {
            throw new Error('Collections not found');
        }

        //Nem kell megnézni, a playerId egyedi, nem lesz több játékosnak is ez, viszont így játék végénél fixen kilépteti a klienst
        /*const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }*/

        await playersCollection.updateOne(
            { _id: playerId }, //, game_id: ongoingGame._id },
            { $set: { is_logged_in: false } }
        );
    } catch (error) {
        console.error('Error during player logout: ', error);
        throw error;
    }
};

export const getCurrentPlayer = async () => {
    try {
        const db = await connectToDb();
        const playersCollection = db?.collection('Players');
        const gamesCollection = db?.collection('Games');

        if (!playersCollection || !gamesCollection) {
            throw new Error("Collections not found");
        }

        const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
        if (!ongoingGame) {
            throw new Error("No ongoing game found");
        }

        const current_player = await playersCollection.findOne<Player>({ game_id: ongoingGame._id, house: ongoingGame.current_player });
        if (!current_player) {
            throw new Error("Player not found");
        }

        return current_player;
    } catch (error) {
        console.error('Error getting current player: ', error);
        throw error;
    }
}