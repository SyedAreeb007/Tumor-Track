const express = require("express");
const { getAIResponse } = require("../controllers/aiController");

const router = express.Router();
router.post("/generate", getAIResponse);

module.exports = router;
