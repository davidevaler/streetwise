/*
  File usato per caricare map.json sul DB

*/

const fs = require('fs');
const { MongoClient } = require('mongodb');

// CONFIG

MONGO_URI = 'mongodb+srv://admin:StreetWiseAdmin@cluster0.hsdbb5s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const FILE_PATH = './map.json'; //path file JSON da caricare
const DB_NAME = 'streetwise';

async function main() {
  const rawData = fs.readFileSync(FILE_PATH, 'utf-8');
  const jsonData = JSON.parse(rawData);
  const { strade } = jsonData.mantoStradale;    //Nome dict da caricare 

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  // Optional: Clean collections before import
  await db.collection('strade').deleteMany({});
  
  // Insert into collections
  await db.collection('strade').insertMany(strade);

  console.log('✅ Data imported successfully');
  await client.close();
}

main().catch(err => console.error('❌ Import failed:', err));
