const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const { connectDB, sessionStore } = require("./config/database");
const mainRoutes = require("./routes/main");
const customerRoutes = require("./routes/customers");
const invoiceRoutes = require("./routes/invoices");
const paymentRoutes = require("./routes/payments");
const reportRoutes = require("./routes/reports");
const expressLayouts = require('express-ejs-layouts');

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" })

// Passport config
require("./config/passport")(passport)

//Connect To Database
connectDB()

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

//Using EJS for views
app.set("view engine", "ejs")

//Use EJS Layouts
app.use(expressLayouts)
app.set("layout", "layouts/layout")

//Static Folder
app.use(express.static("public"))

//Body Parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//Logging
app.use(logger("dev"))

//Use forms for put / delete
app.use(methodOverride("_method"))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes)
app.use("/customers", customerRoutes)
app.use("/invoices", invoiceRoutes)
app.use("/payments", paymentRoutes)
app.use("/reports", reportRoutes)

//Server Running
app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}! Hooray!`);
})
