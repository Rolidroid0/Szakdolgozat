import { ObjectId } from "mongodb";
import { connectToDb } from "../config/db"
import { getWebSocketServer } from "../config/websocket";
import WebSocket from "ws";
import { endPhase } from "./gamesService";
import { Territory } from "../models/territoriesModel";
import { Player } from "../models/playersModel";
import { Game } from "../models/gamesModel";

export const getTerritories = async () => {
    const db = await connectToDb();
    const territoriesCollection = db?.collection('EssosTerritories');

    if (!territoriesCollection) {
        throw new Error("Territories collection not found");
    }

    const territories = await territoriesCollection.find<Territory>({}).toArray();
    return territories;
};

export const getTerritoryById = async (territoryId: ObjectId) => {
  try {
      const db = await connectToDb();
      const territoriesCollection = db?.collection('EssosTerritories');

      if (!territoriesCollection) {
          throw new Error("Territories collection not found");
      }

      const territory = await territoriesCollection.findOne<Territory>({ _id: new ObjectId(territoryId) });
      if (!territory) {
          throw new Error("Territory not found");
      }
      
      return territory;
  } catch (error) {
      console.error('Error getting territory: ', error);
      throw error;
  }
};

export const allocateTerritories = async () => {
  try {
    const db = await connectToDb();
    const territoriesCollection = db?.collection('EssosTerritories');
    const playersCollection = db?.collection('Players');

    if (!territoriesCollection || !playersCollection) {
      throw new Error("Required collections not found");
    }

    const territories = await territoriesCollection.find<Territory>({}).toArray();
    territories.sort(() => Math.random() - 0.5);
    const players = await playersCollection.find<Player>({}).toArray();

    if (players.length < 2) {
      throw new Error("There are not enough players");
    }

    const player1 = players[0].house;
    const player2 = players[1].house;

    const player1Territories = territories.slice(0, 12);
    const player2Territories = territories.slice(12, 24);
    const neutralTerritories = territories.slice(24);

    await Promise.all([
      ...player1Territories.map(territory =>
          territoriesCollection.updateOne(
              { _id: territory._id },
              { $set: { owner_id: player1, last_attacked_from : 0, number_of_armies : 2 } }
          )
      ),
      ...player2Territories.map(territory =>
          territoriesCollection.updateOne(
              { _id: territory._id },
              { $set: { owner_id: player2, last_attacked_from : 0, number_of_armies : 2 } }
          )
      ),
      ...neutralTerritories.map(territory =>
          territoriesCollection.updateOne(
              { _id: territory._id },
              { $set: { owner_id: 'neutral', last_attacked_from : 0, number_of_armies : 2 } }
          )
      ),
    ]);

    console.log("Territories have been successfully allocated to players");

  } catch (error) {
    console.error('Error in allocateTerritories: ', error);
  }
};

export const findConnectedTerritories = async (startingTerritoryId: ObjectId, playerId: ObjectId) => {
  const db = await connectToDb();
  const territoriesCollection = db?.collection('EssosTerritories');
  const playersCollection = db?.collection('Players');

  if (!territoriesCollection || !playersCollection) {
    throw new Error("Collections not found");
  }

  const player = await playersCollection.findOne<Player>({ _id: new ObjectId(playerId) });
  if (!player) {
    throw new Error("Player not found");
  }

  const startingTerritory = await territoriesCollection.findOne<Territory>({ _id: startingTerritoryId });

  if (!startingTerritory || startingTerritory.owner_id !== player.house) {
    throw new Error("Invalid starting territory or you do not own it");
  }

  const visited = new Set<string>();
  const queue = [startingTerritoryId];
  const connectedTerritories = [];

  visited.add(startingTerritoryId.toString());

  while (queue.length > 0) {
    const currentTerritoryId = queue.shift()!;
    const currentTerritory = await territoriesCollection.findOne<Territory>({ _id: currentTerritoryId });

    if (!currentTerritory) continue;

    if (currentTerritory.owner_id === player.house) {
      connectedTerritories.push(currentTerritory);
    }

    for (const neighborId of currentTerritory.neighbors) {
      const neighborIdStr = neighborId.toString();

      if (!visited.has(neighborIdStr)) {
        const neighborTerritory = await territoriesCollection.findOne<Territory>({ _id: neighborId });
        if (neighborTerritory?.owner_id === player.house) {
          visited.add(neighborIdStr);
          queue.push(neighborId);
        }
      }
    }

    if (currentTerritory.port === 1) {
      const portTerritories = await territoriesCollection.find<Territory>({ port: 1, owner_id: player.house }).toArray();

      for (const portTerritory of portTerritories) {
        const portTerritoryIdStr = portTerritory._id.toString();

        if (!visited.has(portTerritoryIdStr) && portTerritoryIdStr !== currentTerritoryId.toString()) {
          visited.add(portTerritoryIdStr);
          queue.push(portTerritory._id);
        }
      }
    }
  }

  return connectedTerritories.filter(t => t._id.toString() !== startingTerritoryId.toString());
};

export const findAttackableTerritories = async (startingTerritoryId: ObjectId, playerId: ObjectId) => {
  const db = await connectToDb();
  const territoriesCollection = db?.collection('EssosTerritories');
  const playersCollection = db?.collection('Players');

  if (!territoriesCollection || !playersCollection) {
    throw new Error("Collections not found");
  }

  const player = await playersCollection.findOne<Player>({ _id: playerId });
  if (!player) {
    throw new Error("Player not found");
  }

  const startingTerritory = await territoriesCollection.findOne<Territory>({ _id: startingTerritoryId });
  if (!startingTerritory || startingTerritory.owner_id !== player.house) {
    throw new Error("Invalid starting territory or you do not own it");
  }

  const attackableTerritories: Territory[] = [];

  for (const neighborId of startingTerritory.neighbors) {
    const attackableTerritory = await territoriesCollection.findOne<Territory>({ _id: neighborId });
    if (attackableTerritory && attackableTerritory.owner_id !== player.house) {
      attackableTerritories.push(attackableTerritory);
    }
  }

  if (startingTerritory.port === 1) {
    const portTerritories = await territoriesCollection.find<Territory>({ port: 1, owner_id: { $ne: player.house } }).toArray();

    for (const portTerritory of portTerritories) {
      const isAlreadyIncluded = attackableTerritories.some(t => t._id.equals(portTerritory._id));
      if (!isAlreadyIncluded) {
        attackableTerritories.push(portTerritory);
      }
    }
  }

  return attackableTerritories;
};

export const reinforceTerritory = async (playerId: ObjectId, territoryId: ObjectId, armies: number) => {
  try {
    const db = await connectToDb();
    const gamesCollection = db?.collection('Games');
    const territoriesCollection = db?.collection('EssosTerritories');
    const playersCollection = db?.collection('Players');

    if (!gamesCollection || !territoriesCollection || !playersCollection) {
      throw new Error("Collections not found");
    }

    const ongoingGame = await gamesCollection.findOne<Game>({ state: "ongoing" });
    if (!ongoingGame) {
      throw new Error("No ongoing game found");
    }

    const player = await playersCollection.findOne<Player>({ _id: new ObjectId(playerId) });
    if (!player) {
      throw new Error("Player not found");
    }

    const territory = await territoriesCollection.findOne<Territory>({ _id: new ObjectId(territoryId) });
    if (!territory) {
      throw new Error("Territory not found");
    }

    if (territory.owner_id !== player.house) {
      throw new Error("You do not own this territory");
    }

    if (ongoingGame.roundState !== "reinforcement") {
      throw new Error("Reinforcement phase is not active");
    }

    if (armies > player.plus_armies) {
      throw new Error("You do not have enough armies");
    }
    if (armies < 0) {
      throw new Error("Armies can not be negative");
    }

    await territoriesCollection.updateOne(
      { _id: territory._id },
      { $inc: { number_of_armies: armies } }
    );

    await playersCollection.updateOne(
      { _id: player._id },
      { $inc: { plus_armies: -armies } }
    );

    const wss = getWebSocketServer();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          action: 'territory-updated',
          data: { territory }
        }));
      }
    });

    if (player.plus_armies - armies === 0) {
      await endPhase(playerId);
    }

  } catch (error) {
    console.error("Error reinforcing territory: ", error);
    throw error;
  }
};
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