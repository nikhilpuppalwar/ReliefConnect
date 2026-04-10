const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { uploadFile } = require("../config/storage");

/**
 * PUT /api/users/:id — Update own profile (name, phone, location)
 * Same user or admin only
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Only same user or admin can update
    if (req.user.role !== "admin" && req.user.id !== Number(id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const { name, phone, location } = req.body;
    await pool.query(
      "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), location = COALESCE(?, location) WHERE id = ?",
      [name || null, phone || null, location || null, id]
    );
    const [rows] = await pool.query("SELECT id, name, email, role, phone, location, avatar_url FROM users WHERE id = ?", [id]);
    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

/**
 * DELETE /api/users/:id — Soft-delete a user (set is_active = 0)
 * Admin only
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (Number(id) === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot deactivate your own account" });
    }

    // Ensure soft-delete column exists
    await pool.query(
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1"
    );

    const [result] = await pool.query("UPDATE users SET is_active = 0 WHERE id = ? AND is_active = 1", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found or already deactivated" });
    }

    return res.json({ success: true, data: { id: Number(id), is_active: 0 } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to deactivate user" });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && req.user.id !== Number(id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }
    
    // Upload image
    const key = `avatars/${id}-${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { url } = await uploadFile({
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
      key
    });

    await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [url, id]);
    return res.json({ success: true, data: { avatar_url: url } });
  } catch (error) {
    console.error("updateAvatar error", error);
    return res.status(500).json({ success: false, message: "Failed to upload avatar" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    // Only the user can change their own password (for simplicity, we don't handle admin changing user passwords here)
    if (req.user.id !== Number(id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("updatePassword error", error);
    return res.status(500).json({ success: false, message: "Failed to update password" });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && req.user.id !== Number(id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    
    const [sosRows] = await pool.query("SELECT COUNT(*) as cnt FROM help_requests WHERE user_id = ?", [id]);
    const sosCount = sosRows[0].cnt;

    const [reportsRows] = await pool.query("SELECT COUNT(*) as cnt FROM disasters WHERE reported_by = ?", [id]);
    const reportsCount = reportsRows[0].cnt;

    const [resolvedRows] = await pool.query("SELECT COUNT(*) as cnt FROM help_requests WHERE user_id = ? AND status = 'resolved'", [id]);
    const resolvedSOS = resolvedRows[0].cnt;

    const [resolvedRepRows] = await pool.query("SELECT COUNT(*) as cnt FROM disasters WHERE reported_by = ? AND status = 'resolved'", [id]);
    const resolvedReports = resolvedRepRows[0].cnt;

    return res.json({ success: true, data: { sosCount, reportsCount, resolvedCount: resolvedSOS + resolvedReports } });
  } catch (error) {
    console.error("getUserStats error", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

module.exports = { updateUser, deleteUser, updateAvatar, updatePassword, getUserStats };
