const path = require("path");
const pool = require("../config/db");
const { uploadFile } = require("../config/storage");

const getAllCertificates = async (req, res) => {
  try {
    const { limit } = req.query;
    let sql = `
      SELECT
        c.*,
        u.name        AS volunteer_name,
        u.avatar_url  AS volunteer_avatar,
        u.email       AS volunteer_email,
        ub.name       AS issued_by_name
      FROM certificates c
      LEFT JOIN users u  ON c.volunteer_id = u.id
      LEFT JOIN users ub ON c.issued_by    = ub.id
      ORDER BY c.created_at DESC
    `;
    const params = [];
    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }
    const [rows] = await pool.query(sql, params);
    return res.json({
      success: true,
      data: {
        total: rows.length,
        certificates: rows,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch certificates" });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM certificates WHERE volunteer_id = ? ORDER BY created_at DESC", [
      req.user.id,
    ]);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch my certificates" });
  }
};

// ─── GET /api/certificates/:vid  (volunteer/admin: fetch certificates for volunteer) ─────
const getCertificatesByVolunteerId = async (req, res) => {
  try {
    const vid = Number(req.params.vid);

    if (req.user.role === "volunteer" && req.user.id !== vid) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const [rows] = await pool.query("SELECT * FROM certificates WHERE volunteer_id = ? ORDER BY created_at DESC", [vid]);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch certificates" });
  }
};

const createCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Certificate file is required" });
    }
    const { volunteer_id, title, issued_on } = req.body;
    const key = `certificates/${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(req.file.originalname)}`;
    const { url } = await uploadFile({
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
      key,
    });
    const [result] = await pool.query(
      "INSERT INTO certificates (volunteer_id, title, issued_on, certificate_url, issued_by) VALUES (?, ?, ?, ?, ?)",
      [volunteer_id, title, issued_on || new Date(), url, req.user.id]
    );
    return res.status(201).json({ success: true, data: { id: result.insertId, certificate_url: url } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create certificate" });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    await pool.query("DELETE FROM certificates WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to revoke certificate" });
  }
};

module.exports = {
  getAllCertificates,
  getMyCertificates,
  getCertificatesByVolunteerId,
  createCertificate,
  deleteCertificate,
};
