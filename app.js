/**
 * Name: Eason Meng
 * Section AF
 * 5/31/2024
 *
 * API for Final Project (Restaurant Reservation Website).
 * app.js defines the server-side behavior, including interactions with the database.
 */

"use strict";

const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const multer = require('multer');

const INVALID_PARAM_ERROR = 400;
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG = "An error occurred on the server. Try again later.";
const PARAM_ERROR_MSG = "Missing one or more of the required params.";

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

// get all restaurant information
app.get("/info", async (req, res) => {
  try {
    let db = await getDBConnection();
    let result = await db.all("SELECT * FROM restaurants");
    await db.close();
    res.json(result);
  } catch (err) {
    res.type("text").status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// get information about the inputted restaurant
app.get("/info/:restaurant", async (req, res) => {
  try {
    let restaurant = req.params.restaurant;
    let db = await getDBConnection();
    let result = await db.get("SELECT * FROM restaurants WHERE name = ?", restaurant);
    await db.close();
    res.json(result);
  } catch (err) {
    res.type("text").status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// log in with username and password
app.post("/login", async (req, res) => {
  try {
    let db = await getDBConnection();
    let username = req.body.username;
    let password = req.body.password;
    let query = "SELECT * FROM users WHERE username = ? AND password = ?";
    let result = await db.get(query, username, password);
    await db.close();
    if (result) {
      res.type("text");
      res.send("Welcome, " + username + "!");
    } else {
      res.type("text").status(INVALID_PARAM_ERROR);
      res.send("Wrong username or password!");
    }
  } catch (err) {
    res.type("text").status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// register a new account with email, phone, username, and password
app.post("/register", async (req, res) => {
  let email = req.body.email;
  let phone = req.body.phone;
  let username = req.body.username;
  let password = req.body.password;
  if (email && phone && username && password) {
    try {
      let db = await getDBConnection();
      let query = "INSERT INTO users (email, phone, username, password) VALUES (?, ?, ?, ?)";
      await db.run(query, email, phone, username, password);
      await db.close();
      res.type("text");
      res.send("Account Succesfully Registered!");
    } catch (err) {
      res.type("text").status(SERVER_ERROR);
      res.send(SERVER_ERROR_MSG);
    }
  } else {
    res.type("text").status(INVALID_PARAM_ERROR);
    res.send(PARAM_ERROR_MSG);
  }
});

// delete the logged-in account
app.post("/deleteAccount", async (req, res) => {
  let username = req.body.username;
  if (username) {
    try {
      let db = await getDBConnection();
      let account = await db.get("SELECT * FROM users WHERE username = ?", username);
      if (account) {
        let query = "DELETE FROM users WHERE username = ?";
        await db.run(query, username);
        await db.close();
        res.type("text");
        res.send("Account Succesfully Deleted");
      } else {
        res.type("text").status(INVALID_PARAM_ERROR);
        res.send("Account does not exist");
      }
    } catch (err) {
      res.type("text").status(SERVER_ERROR);
      res.send(SERVER_ERROR_MSG);
    }
  } else {
    res.type("text").status(INVALID_PARAM_ERROR);
    res.send(PARAM_ERROR_MSG);
  }
});

// add a review to the inputted restaurant
app.post("/review", async (req, res) => {
  let restaurant = req.body.restaurant;
  let username = req.body.username;
  let comment = req.body.comment;
  if (restaurant && username && req.body.rating && comment) {
    try {
      let db = await getDBConnection();
      let history = (
        await db.get("SELECT history FROM users WHERE username = ?", username)
      ).history;
      if (history.indexOf(restaurant) !== -1) {
        let query = "INSERT INTO reviews (restaurant, username, rating, comment) " +
         "VALUES (?, ?, ?, ?)";
        await db.run(query, restaurant, username, req.body.rating, comment);
        await db.close();
        res.type("text");
        res.send("Review Succesfully Added");
      } else {
        res.type("text").status(INVALID_PARAM_ERROR);
        res.send("User has not been to this restaurant before");
      }
    } catch (err) {
      res.type("text").status(SERVER_ERROR);
      res.send(SERVER_ERROR_MSG);
    }
  } else {
    res.type("text").status(INVALID_PARAM_ERROR);
    res.send(PARAM_ERROR_MSG);
  }
});

// make a reservation at the given restaurant
app.post("/reserve", async (req, res) => {
  if (req.body.username && req.body.restaurant && req.body.numGuests) {
    try {
      if (checkNumGuest(req.body.restaurant, req.body.numGuests)) {
        let num = await addToHistory(req.body.username, req.body.restaurant, req.body.numGuests);
        res.type("text");
        res.send(num.toString());
      } else {
        res.type("text").status(INVALID_PARAM_ERROR);
        res.send("Your party is too small!");
      }
    } catch (err) {
      res.type("text").status(SERVER_ERROR);
      res.send(SERVER_ERROR_MSG);
    }
  } else {
    res.type("text").status(INVALID_PARAM_ERROR);
    res.send(PARAM_ERROR_MSG);
  }
});

// filter restaurants based on the given cuisine
app.get("/filter/:cuisine", async (req, res) => {
  let cuisine = req.params.cuisine;
  try {
    let db = await getDBConnection();
    let result = await db.all("SELECT * FROM restaurants WHERE cuisine = ?", cuisine);
    await db.close();
    res.json(result);
  } catch (err) {
    res.type("text").status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// search restaurants' name, address, and cuisine based on the search query
app.get("/search", async (req, res) => {
  let searchQuery = req.query.search;
  if (searchQuery) {
    try {
      let db = await getDBConnection();
      let result = await db.all(
        "SELECT * FROM restaurants " +
        "WHERE name LIKE ? OR cuisine LIKE ? OR address LIKE ?",
        "%" + searchQuery + "%",
        "%" + searchQuery + "%",
        "%" + searchQuery + "%"
      );
      await db.close();
      res.json(result);
    } catch (err) {
      res.type("text").status(SERVER_ERROR);
      res.send(SERVER_ERROR_MSG);
    }
  } else {
    res.type("text").status(INVALID_PARAM_ERROR);
    res.send(PARAM_ERROR_MSG);
  }
});

// get the average rating of the restaurant
app.get("/rating/:restaurant", async (req, res) => {
  let restaurant = req.params.restaurant;
  try {
    let db = await getDBConnection();
    let query = "SELECT ROUND(AVG(rating), 1) AS rating FROM reviews WHERE restaurant = ?";
    let result = (await db.get(query, restaurant)).rating;
    if (!result) {
      result = 0.0;
    }
    await db.close();
    res.type("text");
    res.send(result.toString());
  } catch (err) {
    res.type("text").status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// get information about the given user
app.get("/user/:username", async (req, res) => {
  try {
    let username = req.params.username;
    let db = await getDBConnection();
    let result = await db.get("SELECT * FROM users WHERE username = ?", username);
    await db.close();
    res.json(result);
  } catch (err) {
    res.type("text").status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

// get all distinct cuisines from all the restaurants
app.get("/cuisine", async (req, res) => {
  try {
    let db = await getDBConnection();
    let result = await db.all("SELECT DISTINCT cuisine FROM restaurants");
    await db.close();
    res.json(result);
  } catch (err) {
    res.type("text").status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

/**
 * Check if the number of guests is valid
 * a valid number of guests will be greater than the minimum guests of the restaurant
 * and has to be less than the capacity of the restaurant
 * @param {String} restaurant: the name of the restaurant
 * @param {integer} numGuests: the number of guests
 * @return {boolean}: whether the number of guests is valid
 */
async function checkNumGuest(restaurant, numGuests) {
  let db = await getDBConnection();
  let minGuests = (
    await db.get("SELECT minGuests FROM restaurants WHERE name = ?", restaurant)
  ).minGuests;
  let capacity = (
    await db.get("SELECT capacity FROM restaurants WHERE name = ?", restaurant)
  ).capacity;
  if (numGuests >= minGuests && (capacity - numGuests) >= 0) {
    await db.run(
          "UPDATE restaurants SET capacity = ? WHERE name = ?",
          capacity - numGuests,
          restaurant
    );
    return true;
  }
  return false;
}

/**
 * adds the reservation to the user's history
 * @param {String} username: the username
 * @param {String} restaurant: the name of the restaurant
 * @param {integer} numGuests: the number of guests
 * @return {integer}: the confirmation number
 */
async function addToHistory(username, restaurant, numGuests) {
  let db = await getDBConnection();
  let history = JSON.parse((
    await db.get("SELECT history FROM users WHERE username = ?", username)
  ).history);
  let confirmNum = Date.now();
  history.push({"restaurant": restaurant, "numGuest": numGuests,
    "confirmNum": confirmNum});
  await db.run(
    "UPDATE users SET history = ? WHERE username = ?",
    JSON.stringify(history),
    username
  );
  return confirmNum;
}

/**
 * Establishes a database connection to a database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'reservation.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static("public"));

const DEFAULT_PORT = 8000;
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);