const dotenv = require('dotenv')
dotenv.config()
const { MongoClient } = require('mongodb')

let dbInstance = null

async function connectToDb() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        const client = await MongoClient.connect(process.env.CONNECTIONSTRING);
        dbInstance = client.db();
        console.log('Csatlakozva a MongoDB adatbázishoz');
        return dbInstance;
    } catch (err) {
        console.error('Nem sikerült csatlakozni a MongoDB adatbázishoz', err);
        throw err;
    }
}

module.exports = connectToDb;
