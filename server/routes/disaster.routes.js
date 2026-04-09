const express = require("express");
const multer = require("multer");
const { body, param } = require("express-validator");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const validate = require("../middleware/validate");
const {
  getAllDisasters,
  getDisasterById,
  createDisaster,
  updateDisaster,
  deleteDisaster,
  uploadDisasterMedia,
} = require("../controllers/disaster.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getAllDisasters);
router.get("/:id", [param("id").isInt({ min: 1 })], validate, getDisasterById);
router.post(
  "/",
  auth,
  role(["civilian", "admin"]),
  upload.array("media", 5),
  [
    body("title").trim().notEmpty().withMessage("title is required"),
    body("description").trim().notEmpty().withMessage("description is required"),
    body("type").trim().notEmpty().withMessage("type is required"),
    body("severity").optional().isIn(["low", "medium", "high", "critical"]),
    body("status").optional().isIn(["active", "monitoring", "resolved"]),
    body("location").optional().isString(),
  ],
  validate,
  createDisaster
);
router.put("/:id", auth, role(["admin"]), [param("id").isInt({ min: 1 })], validate, updateDisaster);
router.delete("/:id", auth, role(["admin"]), [param("id").isInt({ min: 1 })], validate, deleteDisaster);
router.post(
  "/:id/media",
  auth,
  role(["civilian", "admin"]),
  [param("id").isInt({ min: 1 })],
  validate,
  upload.single("media"),
  uploadDisasterMedia
);

module.exports = router;
