const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server working!");
});

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.chduhq7.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const db = client.db("rent-wheelsdb");
    const userCollection = db.collection("users"); // user collection
    const carsCollection = db.collection("cars"); // cars collection
    const bookingsCollection = db.collection("booking"); // booking collection

    // user functionalaty
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        res.send({
          message: "user already exists. do not need to insert again",
        });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });
    // create cars
    app.post("/cars", async (req, res) => {
      const newCar = req.body;
      const result = await carsCollection.insertOne(newCar);
      res.send(result);
    });
    //-------------------------------------------------------------------
    // update form listing page 
   
    app.put("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      try {
        const result = await carsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });
    //-------------------------------------------------------------------

    // showing cars

    app.get("/cars", async (req, res) => {
      const cursor = carsCollection.find({}).sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    // show available cars
    app.get("/browsecars", async (req, res) => {
      const cursor = carsCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      try {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking);

        // update car status
        await carsCollection.updateOne(
          { _id: new ObjectId(booking.carId) },
          { $set: { status: "Booked" } }
        );

        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    //======================================================

    // show details cars
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const car = await carsCollection.findOne(query);
      res.send(car);
    });

    // my listing functionalities
    app.get("/mylisting", async (req, res) => {
      const email = req.query.email; // logged-in provider email => user
      if (!email) return res.status(400).send({ message: "Email required" });
      try {
        // query by providerEmail
        const query = { providerEmail: email };
        const listings = await carsCollection.find(query).toArray();
        res.send(listings);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });

    //-------------------------------------------------------------------
    // Get all cars
    app.get("/browsecar", async (req, res) => {
      try {
        const cars = await carsCollection.find({}).toArray();
        res.send(cars);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Book a car (user click Book Now)
    app.post("/bookings", async (req, res) => {
      try {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking);

        // Update car status -> Booked
        await carsCollection.updateOne(
          { _id: new ObjectId(booking.carId) },
          { $set: { status: "Booked" } }
        );

        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    //**********************************************************
    // Get all bookings of a specific user
    app.get("/mybookings", async (req, res) => {
      const userEmail = req.query.email; // uer email
      if (!userEmail)
        return res.status(400).send({ message: "Email is required" });

      try {
        const bookings = await bookingsCollection.find({ userEmail }).toArray();
        res.send(bookings); // array of bookings
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    //--------------------------------------------------------------

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`rent-wheels-server runnig on port: ${port}`);
});
