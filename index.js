const express = require("express");
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mongo db driver
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.lds4lih.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const plantCollection = client.db("plantDb").collection("plants");

    // Plant
    // -----------------------

    // GET
    // app.get("/plants", async (req, res) => {
    //   const result = await plantCollection.find().toArray();
    //   res.send(result);
    // });

    app.get("/plants", async (req, res) => {
      try {
        const result = await plantCollection
          .find()
          .sort({ nextWatering: 1, _id: 1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching plants:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // Specific GET
    app.get("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.findOne(query);
      res.send(result);
    });

    // POST
    app.post("/plants", async (req, res) => {
      const addPlantData = req.body;
      const result = await plantCollection.insertOne(addPlantData);
      res.send(result);
    });

    // PUT
    app.put("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedPlant = req.body;
      const updatedDoc = {
        $set: updatedPlant,
      };
      const result = await plantCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // DELETE
    app.delete("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
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

app.get("/", (req, res) => {
  res.send("Plantify Server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
