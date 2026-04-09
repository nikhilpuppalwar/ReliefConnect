const path = require("path");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const pool = require("../config/db");
const { uploadFile } = require("../config/storage");

function getRoleFromAuthHeader(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.role || null;
  } catch {
    return null;
  }
}

const getAllDisasters = async (req, res) => {
  try {
    const { status, type, severity, from, to, limit } = req.query;
    let sql = `
      SELECT d.*, u.name AS reported_by_name,
        (SELECT media_url FROM disaster_media WHERE disaster_id = d.id LIMIT 1) AS media_url
      FROM disasters d
      LEFT JOIN users u ON d.reported_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += " AND d.status = ?";
      params.push(status);
    }
    if (type) {
      sql += " AND d.type = ?";
      params.push(type);
    }
    if (severity) {
      sql += " AND d.severity = ?";
      params.push(severity);
    }
    if (from) {
      sql += " AND d.created_at >= ?";
      params.push(from);
    }
    if (to) {
      sql += " AND d.created_at <= ?";
      params.push(to);
    }

    sql += " ORDER BY d.created_at DESC";

    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }

    const [rows] = await pool.query(sql, params);
    const mapped = rows.map(({ reported_by_name, ...d }) => ({
      ...d,
      reported_by: reported_by_name ? { name: reported_by_name } : null,
    }));

    // ADMIN_FLOW.md shape for admin callers
    const callerRole = req.user?.role || getRoleFromAuthHeader(req);
    if (callerRole === "admin") {
      return res.json({
        success: true,
        data: {
          total: mapped.length,
          disasters: mapped,
        },
      });
    }

    return res.json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch disasters" });
  }
};

const getDisasterById = async (req, res) => {
  try {
    const [disasters] = await pool.query("SELECT * FROM disasters WHERE id = ?", [req.params.id]);
    if (!disasters.length) {
      return res.status(404).json({ success: false, message: "Disaster not found" });
    }
    const [media] = await pool.query("SELECT * FROM disaster_media WHERE disaster_id = ?", [req.params.id]);
    return res.json({ success: true, data: { ...disasters[0], media } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch disaster" });
  }
};

const createDisaster = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", data: errors.array() });
    }
    const { title, description, type, severity, location, status = "active" } = req.body;
    const [result] = await pool.query(
      "INSERT INTO disasters (title, description, type, severity, location, status, reported_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, description, type, severity, location, status, req.user.id]
    );

    if (req.files?.length) {
      for (const file of req.files) {
        const key = `disasters/${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
        const { url } = await uploadFile({ buffer: file.buffer, contentType: file.mimetype, key });
        await pool.query("INSERT INTO disaster_media (disaster_id, media_url, media_type) VALUES (?, ?, ?)", [
          result.insertId,
          url,
          file.mimetype,
        ]);
      }
    }

    return res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create disaster" });
  }
};

const updateDisaster = async (req, res) => {
  try {
    const { status, title, description, severity, location } = req.body;
    await pool.query(
      "UPDATE disasters SET status = COALESCE(?, status), title = COALESCE(?, title), description = COALESCE(?, description), severity = COALESCE(?, severity), location = COALESCE(?, location) WHERE id = ?",
      [status, title, description, severity, location, req.params.id]
    );
    return res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update disaster" });
  }
};

const deleteDisaster = async (req, res) => {
  try {
    await pool.query("DELETE FROM disasters WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete disaster" });
  }
};

const uploadDisasterMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Media file is required" });
    }

    const key = `disasters/${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(req.file.originalname)}`;
    const { url } = await uploadFile({
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
      key,
    });

    const [result] = await pool.query(
      "INSERT INTO disaster_media (disaster_id, media_url, media_type) VALUES (?, ?, ?)",
      [req.params.id, url, req.file.mimetype]
    );

    return res.status(201).json({ success: true, data: { id: result.insertId, media_url: url } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to upload disaster media" });
  }
};

module.exports = {
  getAllDisasters,
  getDisasterById,
  createDisaster,
  updateDisaster,
  deleteDisaster,
  uploadDisasterMedia,
};
