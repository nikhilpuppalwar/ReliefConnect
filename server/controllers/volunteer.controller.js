const pool = require("../config/db");

// Admin: list volunteers with user profile + optional filters
const getAllVolunteers = async (req, res) => {
  try {
    const { availability, skills, verified, zone, search, limit } = req.query;

    let sql = `
      SELECT
        v.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        (SELECT COUNT(*) FROM tasks t WHERE t.volunteer_id = v.id) AS missions_count
      FROM volunteers v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (availability) {
      sql += " AND v.availability_status = ?";
      params.push(availability);
    }
    if (skills) {
      sql += " AND v.skills LIKE ?";
      params.push(`%${skills}%`);
    }
    if (verified !== undefined) {
      sql += " AND v.verified = ?";
      params.push(Number(verified) ? 1 : 0);
    }
    if (zone) {
      sql += " AND v.zone = ?";
      params.push(zone);
    }
    if (search) {
      sql += " AND (u.name LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY v.created_at DESC";

    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }

    const [rows] = await pool.query(sql, params);
    const mapped = rows.map(({ name, email, phone, avatar_url, ...v }) => ({
      ...v,
      user: { name, email, phone, avatar_url },
      availability: v.availability_status,
    }));
    return res.json({
      success: true,
      data: {
        total: mapped.length,
        volunteers: mapped,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch volunteers" });
  }
};

// Get volunteer profile by user_id (matches AUTH_SCREENS_FLOW.md expectations)
const getVolunteerById = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const [rows] = await pool.query(
      `
      SELECT
        v.*,
        u.name,
        u.email,
        u.phone,
        u.avatar_url
      FROM volunteers v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.user_id = ?
      `,
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Volunteer profile not found" });
    }

    const [tasks] = await pool.query(
      "SELECT id, title, status, due_date, created_at FROM tasks WHERE volunteer_id = ? ORDER BY created_at DESC LIMIT 20",
      [userId]
    );
    const [certificates] = await pool.query(
      "SELECT id, title, issued_on, certificate_url, created_at FROM certificates WHERE volunteer_id = ? ORDER BY created_at DESC LIMIT 20",
      [userId]
    );

    const { name, email, phone, avatar_url, ...v } = rows[0];
    return res.json({
      success: true,
      data: {
        ...v,
        availability: v.availability_status,
        user: { name, email, phone, avatar_url },
        tasks,
        certificates,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch volunteer profile" });
  }
};

// PUT /api/volunteers/:id (user_id) — update or create volunteer profile
const updateVolunteerProfile = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // only admin or same user can update
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const {
      skills, // string or csv
      experience_years = 0,
      zone = null,
      availability = "available",
    } = req.body;

    const [existing] = await pool.query("SELECT id FROM volunteers WHERE user_id = ?", [userId]);

    if (existing.length) {
      await pool.query(
        "UPDATE volunteers SET skills = COALESCE(?, skills), experience_years = COALESCE(?, experience_years), zone = COALESCE(?, zone), availability_status = COALESCE(?, availability_status) WHERE user_id = ?",
        [skills ?? null, Number(experience_years), zone, availability, userId]
      );
    } else {
      // Create with explicit id=userId so downstream tables can reference volunteers.id == users.id
      await pool.query(
        "INSERT INTO volunteers (id, user_id, skills, experience_years, zone, availability_status, verified) VALUES (?, ?, ?, ?, ?, ?, 0)",
        [userId, userId, skills ?? null, Number(experience_years) || 0, zone, availability]
      );
    }

    const [rows] = await pool.query("SELECT * FROM volunteers WHERE user_id = ?", [userId]);
    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update volunteer profile" });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { availability_status } = req.body;
    await pool.query("UPDATE volunteers SET availability_status = ? WHERE user_id = ?", [
      availability_status,
      userId,
    ]);
    return res.json({ success: true, data: { user_id: userId, availability_status } });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update availability" });
  }
};

const verifyVolunteer = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { verified = true } = req.body;
    await pool.query("UPDATE volunteers SET verified = ? WHERE user_id = ?", [verified ? 1 : 0, userId]);
    return res.json({ success: true, data: { user_id: userId, verified: !!verified } });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to verify volunteer" });
  }
};

module.exports = { getAllVolunteers, getVolunteerById, updateVolunteerProfile, updateAvailability, verifyVolunteer };

