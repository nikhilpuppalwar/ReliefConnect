const express = require("express");
const { param } = require("express-validator");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const validate = require("../middleware/validate");
const { updateUser, deleteUser } = require("../controllers/user.controller");

const router = express.Router();

// PUT /api/users/:id — Update own profile info
router.put(
  "/:id",
  auth,
  [param("id").isInt({ min: 1 })],
  validate,
  updateUser
);

// DELETE /api/users/:id — Soft-delete a user (admin only)
router.delete(
  "/:id",
  auth,
  role(["admin"]),
  [param("id").isInt({ min: 1 })],
  validate,
  deleteUser
);

module.exports = router;
