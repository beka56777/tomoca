const express = require("express");
const router = express.Router();

const controller = require("../controllers/ticketsController");

// PUBLIC endpoint
router.get("/track-ticket", controller.trackTicketPublic);

module.exports = router;
