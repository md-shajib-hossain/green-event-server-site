const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());
//
// app.get("/", (req, res) => {
//   res.send("helllo brother");
// });

// mongodb
// greendb
// fF6KPdEF9fXCKbvu

const uri =
  "mongodb+srv://greendb:fF6KPdEF9fXCKbvu@cluster0.xg4rh8d.mongodb.net/?appName=Cluster0";

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
    //
    const db = client.db("events_db");
    const eventsCollection = db.collection("events");

    // get api
    app.get("/events", async (req, res) => {
      const result = await eventsCollection.find().sort({ date: 1 }).toArray();
      res.send(result);
    });

    // get api by findOne
    app.get("/events/:id", async (req, res) => {
      const { id } = req.params;
      const result = await eventsCollection.findOne({ _id: new ObjectId(id) });
      console.log(id);
      res.send({
        success: true,
        result,
      });
    });

    // post api
    app.post("/events", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await eventsCollection.insertOne(data);
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

//

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
