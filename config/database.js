const express = require("express");
const app = express();
const MongoStore = require("connect-mongo");
const session = require("express-session");


const connectDB = async () => {
  try {

    // Setup Sessions - stored in MongoDB
    app.use(
      session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ 
          mongoUrl: process.env.DB_STRING,
        }),
      })
    );

    console.log(`MongoDB Connected!`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
