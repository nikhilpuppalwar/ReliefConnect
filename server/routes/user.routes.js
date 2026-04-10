const express = require("express");
const { param } = require("express-validator");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const validate = require("../middleware/validate");
const multer = require("multer");
const { updateUser, deleteUser, updateAvatar, updatePassword, getUserStats } = require("../controllers/user.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// PUT /api/users/:id — Update own profile info
router.put(
  "/:id",
  auth,
  [param("id").isInt({ min: 1 })],
  validate,
  updateUser
);

// POST /api/users/:id/avatar — Upload and set profile avatar
router.post(
  "/:id/avatar",
  auth,
  [param("id").isInt({ min: 1 })],
  validate,
  upload.single("avatar"),
  updateAvatar
);

// PUT /api/users/:id/password — Update password
router.put(
  "/:id/password",
  auth,
  [param("id").isInt({ min: 1 })],
  validate,
  updatePassword
);

// GET /api/users/:id/stats — Get activity stats
router.get(
  "/:id/stats",
  auth,
  [param("id").isInt({ min: 1 })],
  validate,
  getUserStats
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
