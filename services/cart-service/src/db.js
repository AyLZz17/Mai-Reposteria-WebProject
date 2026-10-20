const { MongoClient } = require('mongodb');
const logger = require('./logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'mai_reposteria';

const client = new MongoClient(MONGODB_URI);
let database;

async function connectToDatabase() {
  await client.connect();
  database = client.db(MONGODB_DATABASE);
  logger.success(`Conectado a MongoDB: ${MONGODB_DATABASE}`);
  return database;
}

function getDatabase() {
  if (!database) {
    throw new Error('MongoDB no está conectado');
  }

  return database;
}

module.exports = {
  connectToDatabase,
  getDatabase,
};
