import { connectToDb } from "../config/db"

export const getTerritories = async () => {
    const db = await connectToDb();
    const territoriesCollection = db?.collection('EssosTerritories');

    if (!territoriesCollection) {
        throw new Error("Territories collection not found");
    }

    const territories = await territoriesCollection.find({}).toArray();
    return territories;
};

export const allocateTerritories = async () => {
  try {
    const db = await connectToDb();
    const territoriesCollection = db?.collection('EssosTerritories');
    const playersCollection = db?.collection('Players');

    if (!territoriesCollection || !playersCollection) {
      throw new Error("Required collections not found");
    }

    const territories = await territoriesCollection.find({}).toArray();
    territories.sort(() => Math.random() - 0.5);
    const players = await playersCollection.find({}).toArray();

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
}

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