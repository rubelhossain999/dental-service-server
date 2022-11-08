const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


/// Middle ware
app.use(cors());
app.use(express.json());

/// Mongodb Info
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.nqqpx5x.mongodb.net/?retryWrites=true&w=majority`;
const clientDB = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{

        const userCollection = clientDB.db('assignment').collection('users')

        app.get('/users', async(req, res) => {
            const query = {};
            const cursor = userCollection.find(query)
            const userdatas = await cursor.toArray();
            res.send(userdatas);
        });

        // Only Three Data for UI
        app.get('/threedata', async(req, res) => {
            const threes = {}
            const querydata = userCollection.find(threes);
            const three = await querydata.limit(3).toArray();
            res.send(three);
        }); 


    }
    finally{

    }
}
run().catch( error => console.log(error))



///InPoint Port Running
app.get('/', (req, res) => {
    res.send('This a Donation Server Point')
});
app.listen(port, (req, res) => {
    console.log(`Server Port ${port}`);
});