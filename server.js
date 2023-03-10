const express = require("express")
const expressLayouts = require('express-ejs-layouts')
const app = express()
const mongoose = require("mongoose")
const passport = require("passport")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const methodOverride = require("method-override")
const flash = require("express-flash")
const logger = require("morgan")
const connectDB = require("./config/database")
const mainRoutes = require("./routes/main")
const customerRoutes = require("./routes/customers")
const invoiceRoutes = require("./routes/invoices")
const paymentRoutes = require("./routes/payments")
const reportRoutes = require("./routes/reports")

//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" })

// Passport config
require("./config/passport")(passport)

//Connect To Database
connectDB();

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

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

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
