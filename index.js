const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const express = require('express');
const cors = require('cors');
const { query } = require('express');
const app = express();
const port = process.env.PORT || 5000;


/// Middle ware
app.use(cors());
app.use(express.json());

/// Mongodb Info
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.nqqpx5x.mongodb.net/?retryWrites=true&w=majority`;
const clientDB = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyjwt(req, res, next) {
    const authheader = req.authheader.authorization;
    if (!authheader) {
        res.status(401).send({message: 'UNauthorization'})
    }
    const token = authheader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(401).send({message: 'UNauthorization Access'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {

        const userCollection = clientDB.db('assignment').collection('users');
        const reviewCollection = clientDB.db('reviewCustomer').collection('reviews');

        //// JWT Token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            })
            res.send({ token })
        });

        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query)
            const userdatas = await cursor.toArray();
            res.send(userdatas);
        });

        // Only Three Data for UI
        app.get('/threedata', async (req, res) => {
            const threes = {}
            const querydata = userCollection.find(threes);
            const three = await querydata.limit(3).toArray();
            res.send(three);
        });

        // Specific id Display
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const singlepost = await userCollection.findOne(query);
            res.send(singlepost);
        });

        // Recived Service Data from Add New Form
        app.post('/users', async (req, res) => {
            const service = req.body;
            const addService = await userCollection.insertOne(service);
            res.send(addService)
        });

        ///////////////////////////////////// Review Method ////////////////////////////////////

        // Insert the review from the ui customer
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const addreview = await reviewCollection.insertOne(review);
            res.send(addreview);

        });

        // Get the review info
        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const reviewCursor = reviewCollection.find(query);
            const reviewResult = await reviewCursor.toArray();
            res.send(reviewResult);
        });

        /// Get The reviews ID 
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const singlepost = await reviewCollection.findOne(query);
            res.send(singlepost);
        });

        // Review update
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const reviewUdate = req.body;
            const option = { upsert: true };
            const updateReview = {
                $set: {
                    name: reviewUdate.name,
                    email: reviewUdate.email,
                    description: reviewUdate.description,
                    image: reviewUdate.image,
                }
            }
            const result = await reviewCollection.updateOne(filter, updateReview, option)
            res.send(result);
        });

        /// Delete The Review Items
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const querydelete = { _id: ObjectId(id) };
            const resultdelete = await reviewCollection.deleteOne(querydelete);
            res.send(resultdelete);
        });



    }
    finally {

    }
}
run().catch(error => console.log(error))



///InPoint Port Running
app.get('/', (req, res) => {
    res.send('This a Donation Server Point')
});
app.listen(port, (req, res) => {
    console.log(`Server Port ${port}`);
});