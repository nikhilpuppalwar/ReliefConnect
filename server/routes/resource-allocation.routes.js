const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { getResourceAllocations } = require("../controllers/resource.controller");

const router = express.Router();

// Admin: list recent resource allocation logs
router.get("/", auth, role(["admin"]), getResourceAllocations);

module.exports = router;

