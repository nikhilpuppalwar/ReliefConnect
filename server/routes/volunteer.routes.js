const express = require("express");
const { body, param } = require("express-validator");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const validate = require("../middleware/validate");
const {
  getAllVolunteers,
  getVolunteerById,
  updateAvailability,
  verifyVolunteer,
  updateVolunteerProfile,
} = require("../controllers/volunteer.controller");

const router = express.Router();

// Admin: list all volunteers
router.get("/", auth, role(["admin"]), getAllVolunteers);

// Get a specific volunteer profile by user_id (matches auth flow)
router.get("/:id", auth, [param("id").isInt({ min: 1 })], validate, getVolunteerById);

// Volunteer or admin: update full profile (skills, zone, experience) by user_id
router.put(
  "/:id",
  auth,
  role(["volunteer", "admin"]),
  [
    param("id").isInt({ min: 1 }),
    body("skills").optional().isString(),
    body("experience_years").optional().isInt({ min: 0 }),
    body("zone").optional().isString(),
    body("availability").optional().isIn(["available", "busy", "offline"]),
  ],
  validate,
  updateVolunteerProfile
);

// Volunteer or admin: update availability status only
router.put(
  "/:id/availability",
  auth,
  role(["volunteer", "admin"]),
  [param("id").isInt({ min: 1 }), body("availability_status").isIn(["available", "busy", "offline"])],
  validate,
  updateAvailability
);

// Admin: verify a volunteer
router.put(
  "/:id/verify",
  auth,
  role(["admin"]),
  [param("id").isInt({ min: 1 }), body("verified").optional().isBoolean()],
  validate,
  verifyVolunteer
);

module.exports = router;

