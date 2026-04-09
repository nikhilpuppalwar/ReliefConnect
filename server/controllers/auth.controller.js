const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const pool = require("../config/db");

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { name, email, password, role = "civilian", phone = null, location = null, adminCode } = req.body;

    if (role === "admin" && adminCode !== "admin2026") {
      return res.status(403).json({ success: false, message: "Invalid admin code" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      // 409 Conflict — email already registered
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to insert with phone/location columns; fallback if columns don't exist
    let result;
    try {
      [result] = await pool.query(
        "INSERT INTO users (name, email, password, role, phone, location) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, role, phone, location]
      );
    } catch (colErr) {
      // Fallback: insert without optional columns
      [result] = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );
    }

    const user = { id: result.insertId, name, email, role };
    const token = signToken(user);
    return res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Failed to register user" });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT id, name, email, role, password FROM users WHERE email = ?", [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};

const me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, phone, location, avatar_url FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);

    if (rows.length) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store OTP in DB (try password_reset_tokens table, fall through if not present)
      try {
        await pool.query(
          "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expires_at = ?",
          [rows[0].id, otp, expires, otp, expires]
        );
      } catch (_) {
        // Table may not exist yet — log for dev
      }

      // Dev mode: log OTP to console (replace with email service in production)
      console.log(`[DEV] Password reset OTP for ${email}: ${otp}`);
    }

    // Always return 200 — security best practice: don't reveal if email exists
    return res.json({ success: true, message: "Recovery code sent if email exists" });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    return res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

module.exports = { register, login, me, forgotPassword };
