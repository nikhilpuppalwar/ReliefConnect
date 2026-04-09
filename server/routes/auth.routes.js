const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { register, login, me, forgotPassword } = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("email").isEmail().withMessage("valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("password must be at least 8 chars"),
    body("role").optional().isIn(["civilian", "volunteer", "admin"]).withMessage("invalid role"),
    body("phone").optional().trim(),
    body("location").optional().trim(),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("valid email is required"),
    body("password").notEmpty().withMessage("password is required"),
  ],
  validate,
  login
);

router.get("/me", auth, me);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("valid email is required")],
  forgotPassword
);

module.exports = router;
