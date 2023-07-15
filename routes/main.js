const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const posController = require("../controllers/pos");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes
router.get("/", homeController.getIndex);

//Auth Routes
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

//POS Routes
router.get("/pos", posController.getPOS)
router.put("/pos", posController.startPOS)
router.post("/pos", ensureAuth, posController.readFile)
router.delete("/pos", posController.stopPOS)

module.exports = router;
