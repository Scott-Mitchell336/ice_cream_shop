//
// Server.js
// Created by Scott Mitchell on 04/25/2025
// Block 32 - The Acme Ice Cream Shop
//

const express = require("express");
const pg = require("pg");

const { Client } = pg;
const client = new Client({
  user: "postgres",
  password: "123",
  host: "localhost",
  port: 5432,
  database: "ice_cream_flavors",
});

const app = express();
const port = 3000;
app.use(express.json());

async function initializeDB() {
  try {
    const createTableQuery = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
            id INT,
            name VARCHAR(255),
            is_favorite BOOLEAN,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
    )`;
    await client.query(createTableQuery);
    console.log("Table created successfully");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

async function insertData() {
  try {
    const insertQuery = `
        INSERT INTO flavors (id, name, is_favorite, created_at, updated_at)
        VALUES
            (1, 'Vanilla', true, NOW(), NOW()),
            (2, 'Chocolate', false, NOW(), NOW()),
            (3, 'Strawberry', false, NOW(), NOW()),
            (4, 'Mint Chocolate Chip', false, NOW(), NOW()),
            (5, 'Chocolate Peanut Butter', true, NOW(), NOW()),
            (6, 'Vanilla Bean', false, NOW(), NOW()),
            (7, 'Cherry', false, NOW(), NOW())
    `;
    await client.query(insertQuery);
    console.log("Data inserted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
  }
}

// homepage route
app.get("/", (req, res) => {
  res.send("Ice Cream Flavors API");
});

// API routes
// Get all the flavors
app.get("/api/flavors", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM flavors");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Get a single flavor by ID
app.get("/api/flavors/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await client.query("SELECT * FROM flavors WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send("Flavor not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Create a new flavor
app.post("/api/flavors", async (req, res) => {
  const { id, name, is_favorite } = req.body;
  try {
    const result = await client.query(
      "INSERT INTO flavors (id, name, is_favorite, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
      [id, name, is_favorite]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Delete a flavor by ID
app.delete("/api/flavors/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await client.query("DELETE FROM flavors WHERE id = $1", [
      id,
    ]);
    // if (result.rows.length === 0) {
    //   return res.status(404).send("Flavor not found");
    // }
    // res.json(result.rows[0]);
  } catch (err) {
    console.error("Error deleting data:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Update a flavor by ID
app.put("/api/flavors/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, is_favorite } = req.body;
  try {
    const result = await client.query(
      "UPDATE flavors SET name = $1, is_favorite = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [name, is_favorite, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Flavor not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, async () => {
  await client.connect();
  console.log(`Server is running on http://localhost:${port}`);
  await initializeDB();
  await insertData();
});
