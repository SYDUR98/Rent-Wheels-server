const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('server working!')
})



const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;


const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.chduhq7.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const db = client.db("rent-wheelsdb"); 
    const userCollection = db.collection('users') // user collection 
    const carstCollection = db.collection("cars");

     // user functionalaty 
    app.post('/users',async(req,res)=>{
      const newUser = req.body
      const email = req.body.email
      const query = {email:email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        res.send({message:"user already exists. do not need to insert again"})
      }
      else{
        const result = await userCollection.insertOne(newUser)
        res.send(result)
      }   
    })
      // create cars
    app.post("/cars", async (req, res) => {
      const newCar = req.body;
      const result = await carstCollection.insertOne(newCar);
      res.send(result);
    });

    // showing cars 

    app.get('/cars',async(req,res)=>{
      const cursor = carstCollection.find({}).sort({_id:-1}).limit(6)
      const result = await cursor.toArray()
      res.send(result)
  
    })
    app.get('/browsecars',async(req,res)=>{
      const cursor = carstCollection.find({})
      const result = await cursor.toArray()
      res.send(result)
  
    })






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`rent-wheels-server runnig on port: ${port}`)
})
