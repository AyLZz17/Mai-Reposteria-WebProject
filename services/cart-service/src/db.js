const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'mai_reposteria';

const client = new MongoClient(MONGODB_URI);
let database;

async function connectToDatabase() {
  await client.connect();
  database = client.db(MONGODB_DATABASE);
  console.log(`[+] Connected to MongoDB database: ${MONGODB_DATABASE}`);
  return database;
}

function getDatabase() {
  if (!database) {
    throw new Error('[x] MongoDB is not connected');
  }

  return database;
}

module.exports = {
  connectToDatabase,
  getDatabase,
};
