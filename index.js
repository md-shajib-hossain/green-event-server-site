const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

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
    // await client.connect();
    //
    const db = client.db("events_db");
    const eventsCollection = db.collection("events");
    // join event collection
    const joinedEventCollection = db.collection("joinedEvents");

    // get api
    app.get("/events", async (req, res) => {
      const result = await eventsCollection.find().sort({ date: 1 }).toArray();
      res.send(result);
    });

    // get api by findOne for event detail page........
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
      // console.log(data);
      const result = await eventsCollection.insertOne(data);
      res.send(result);
      // console.log(result);
    });

    app.post("/joined-events", async (req, res) => {
      try {
        const { eventId, userEmail, thumbnail, type, title, date } = req.body;
        if (!eventId || !userEmail) {
          return res
            .status(400)
            .json({ message: "Event Id and User email required" });
        }
        const event = await eventsCollection.findOne({
          _id: new ObjectId(eventId),
        });
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        const alreadyJoined = await joinedEventCollection.findOne({
          eventId: new ObjectId(eventId),
          userEmail,
        });

        if (alreadyJoined) {
          return res
            .status(400)
            .json({ message: "You already joined this event" });
        }

        const result = await joinedEventCollection.insertOne({
          eventId: new ObjectId(eventId),
          userEmail,
          thumbnail,
          type,
          title,
          date,
          joinedAt: new Date(),
        });
        res.status(201).json({
          success: true,
          message: "Successfully joined the event!",
          joinedId: result.insertedId,
        });
      } catch (error) {
        console.error("Join error:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // api for joinedd event page by user email.
    app.get("/my-joined-events", async (req, res) => {
      const email = req.query.email;
      const result = await joinedEventCollection
        .find({
          userEmail: email,
        })
        .sort({ date: 1 })
        .toArray();

      res.send(result);
    });
    // API for manage events page
    app.get("/manage-event", async (req, res) => {
      const email = req.query.email;
      const result = await eventsCollection
        .find({ creatorEmail: email })
        .toArray();
      res.send(result);
    });

    //  Update Event get api ...

    app.get("/update-event/:id", async (req, res) => {
      const { id } = req.params;
      const result = await eventsCollection.findOne({ _id: new ObjectId(id) });
      res.send({
        success: true,
        result,
      });
    });

    // Update event put/patch api
    app.patch("/events/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      console.log(data);
      const objectId = new ObjectId(id);

      const result = await eventsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      // res.send(result);
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Event not found" });
      }

      // শুধু দরকারি ডেটা পাঠাও
      res.status(200).json({
        success: true,
        message: "Event updated successfully",
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      });
    });

    //  search api
    app.get("/search", async (req, res) => {
      const search_text = req.query.search;
      const result = await eventsCollection
        .find({ title: { $regex: search_text, $options: "i" } })
        .toArray();
      res.send(result);
      console.log(result);
    });

    // filter event by type ...
    app.get("/filter", async (req, res) => {
      const filter_text = req.query.filter;
      const result = await eventsCollection
        .find({ type: filter_text })
        .toArray();
      res.send(result);
      console.log(result);
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
