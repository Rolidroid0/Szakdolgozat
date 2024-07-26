const dotenv = require('dotenv')
dotenv.config()
const { MongoClient } = require('mongodb')

const TerületekLétrehozása = require('./Adatbázis/TerületekLétrehozása').default

/*MongoClient.connect(process.env.CONNECTIONSTRING, async function(err, client) {
    console.log("1")
    if (err) {
        console.error('Failed to connect to the database. Error:', err);
        return;
    }

    console.log("2")

    const db = client.db();
    try {
        console.log("3")
        const results = await db.collection("players").find().toArray();
        console.log(results);
    } catch (err) {
        console.error('Error querying the database. Error:', err);
    } finally {
        client.close();
    }
})*/

async function main() {
    TerületekLétrehozása("fss");
}    

main();