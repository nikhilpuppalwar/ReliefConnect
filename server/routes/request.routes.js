const express = require("express");
const multer = require("multer");
const { body, param } = require("express-validator");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const validate = require("../middleware/validate");
const {
  getAllRequests,
  getMyRequests,
  getRequestById,
  createRequest,
  assignRequest,
  updateRequest,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/request.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Civilian: GET /api/requests?requested_by=me
// Volunteer: GET /api/requests?assigned_to=me
// Admin: no intent param returns all (with filters).
router.get("/", auth, role(["civilian", "volunteer", "admin"]), getAllRequests);

router.get("/my", auth, role(["civilian"]), getMyRequests);
// Request detail (FLOW _c_v.md)
router.get("/:id", auth, [param("id").isInt({ min: 1 })], validate, getRequestById);
router.post(
  "/",
  auth,
  role(["civilian", "admin"]),
  upload.single("photo"),
  [
    body("description").trim().notEmpty().withMessage("description is required"),
    body("location").trim().notEmpty().withMessage("location is required"),
    body("priority").isIn(["low", "medium", "high", "critical"]).withMessage("invalid priority"),
    // Optional fields supported for forward-compat with FLOW doc
    body("title").optional().trim(),
    body("status").optional().isIn(["pending", "assigned", "in_progress", "resolved", "cancelled"]),
    body("disaster_id").optional().isInt({ min: 1 }),
  ],
  validate,
  createRequest
);
router.put(
  "/:id/assign",
  auth,
  role(["admin"]),
  [param("id").isInt({ min: 1 }), body("volunteer_id").isInt({ min: 1 })],
  validate,
  assignRequest
);
router.put(
  "/:id",
  auth,
  role(["admin", "volunteer"]),
  [param("id").isInt({ min: 1 }), body("status").isIn(["pending", "assigned", "in_progress", "resolved", "cancelled"])],
  validate,
  updateRequest
);
router.put(
  "/:id/status",
  auth,
  role(["admin", "volunteer"]),
  [param("id").isInt({ min: 1 }), body("status").isIn(["pending", "assigned", "in_progress", "resolved", "cancelled"])],
  validate,
  updateRequestStatus
);
router.delete("/:id", auth, role(["admin"]), [param("id").isInt({ min: 1 })], validate, deleteRequest);

module.exports = router;
