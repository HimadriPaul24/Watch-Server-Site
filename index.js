const express = require("express");
require("dotenv").config();
const corse = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(corse());
app.use(express.json());




const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mbv6h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


async function run() {

  try {
    await client.connect();
    const database = client.db("watchOfSwitzerland");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");


    app.get('/users', async (req, res) => {
      const users = await usersCollection.find({}).toArray();
      res.json(users);
    })

    app.get('/products', async (req, res) => {
      const products = await productsCollection.find().toArray();
      res.json(products);
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.json(product);
    })


    app.get('/orders', async (req, res) => {
      const orders = await ordersCollection.find().toArray();
      res.json(orders);
    })

    app.get('/orders/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const order = await ordersCollection.find(query).toArray();
      res.json(order);
    })


    app.get('/reviews', async (req, res) => {
      const reviews = await reviewsCollection.find().toArray();
      res.json(reviews);
    })

     app.get("/user/:email", async (req, res) => {
       const email = req.params.email;
       const query = { email: email };
       const user = await usersCollection.findOne(query);
       let isAdmin = false;
       if (user?.role === "admin") {
         isAdmin = true;
       }
       res.json({ admin: isAdmin });
     });

    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    })
    
    app.post('/user', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    })

     app.put("/user", async (req, res) => {
       const user = req.body;
       const filter = { email: user.email };
       const options = { upsert: true };
       const updateDoc = {
         $set: user,
       };
       const result = await usersCollection.updateOne(
         filter,
         updateDoc,
         options
       );
       res.json(result);
     });
    
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })


    app.put('/orders/status', async (req, res) => {
      const statusId = req.body.id;
      let status = req.body.status;
      if (status === 'pending') {
        status = 'shipped'
      } else {
        status = 'pending'
      }
      const filter = { _id: ObjectId(statusId) };
      const options = { upsert: true };

      const updateDoc = { $set: { status: status } };

      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    })

    app.post('/order', async (req, res) => {
      const order = req.body;
      Object.assign(order, { status: "pending" });
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    })

    
    app.post('/review', async (req, res) => {
       const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });

    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    })

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    })
    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.json(result);
    })

    }
    finally {
        //await client.close();
    }
    
}

run().catch(console.dir);






app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
