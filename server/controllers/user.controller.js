const pool = require("../config/db");

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

module.exports = { updateUser, deleteUser };
