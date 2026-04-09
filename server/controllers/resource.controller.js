const { validationResult } = require("express-validator");
const pool = require("../config/db");

const getAllResources = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";
    let sql = "SELECT * FROM resources";
    const params = [];

    if (!isAdmin) {
      sql += " WHERE status = 'approved' OR submitted_by = ?";
      params.push(req.user.id);
    }

    sql += " ORDER BY created_at DESC";
    const [rows] = await pool.query(sql, params);
    return res.json({
      success: true,
      data: {
        total: rows.length,
        resources: rows,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch resources" });
  }
};

const createResource = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", data: errors.array() });
    }
    const { name, quantity, quantity_available, unit, location } = req.body;
    const safeQty = quantity ?? quantity_available ?? 0;
    const isCivilian = req.user?.role === "civilian";
    const status = isCivilian ? "pending" : "approved";

    const [result] = await pool.query(
      "INSERT INTO resources (name, quantity, unit, location, status, submitted_by) VALUES (?, ?, ?, ?, ?, ?)",
      [name, safeQty, unit || null, location || null, status, req.user.id]
    );
    return res.status(201).json({
      success: true,
      data: { id: result.insertId, status },
      message: isCivilian ? "Resource submitted for admin review" : "Resource created successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create resource: " + String(error) });
  }
};

const updateResource = async (req, res) => {
  try {
    const { quantity, quantity_available, name, unit, location } = req.body;
    const safeQty = quantity ?? quantity_available ?? null;
    await pool.query(
      "UPDATE resources SET quantity = COALESCE(?, quantity), name = COALESCE(?, name), unit = COALESCE(?, unit), location = COALESCE(?, location) WHERE id = ?",
      [safeQty, name || null, unit || null, location || null, req.params.id]
    );
    return res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update resource" });
  }
};

const deleteResource = async (req, res) => {
  try {
    await pool.query("DELETE FROM resources WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete resource" });
  }
};

const reviewResource = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const [resourceRows] = await pool.query("SELECT id FROM resources WHERE id = ?", [req.params.id]);
    if (!resourceRows.length) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    await pool.query(
      `UPDATE resources
       SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
       WHERE id = ?`,
      [status, req.user.id, status === "rejected" ? rejection_reason || null : null, req.params.id]
    );

    return res.json({
      success: true,
      data: { id: Number(req.params.id), status, reviewed_by: req.user.id },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to review resource" });
  }
};

const allocateResource = async (req, res) => {
  try {
    const { disaster_id, quantity, note } = req.body;
    const [resourceRows] = await pool.query("SELECT id, status FROM resources WHERE id = ?", [req.params.id]);
    if (!resourceRows.length) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    if (resourceRows[0].status !== "approved") {
      return res.status(400).json({ success: false, message: "Only approved resources can be allocated" });
    }

    await pool.query(
      "INSERT INTO resource_allocations (resource_id, disaster_id, quantity, note, allocated_by) VALUES (?, ?, ?, ?, ?)",
      [req.params.id, disaster_id, quantity, note || null, req.user.id]
    );
    await pool.query("UPDATE resources SET quantity = quantity - ? WHERE id = ?", [quantity, req.params.id]);
    return res.status(201).json({ success: true, data: { resource_id: Number(req.params.id), disaster_id, quantity } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to allocate resource" });
  }
};

const getResourceAllocations = async (req, res) => {
  try {
    const { limit } = req.query;

    let sql = `
      SELECT
        ra.*,
        r.name AS resource_name,
        d.title AS disaster_title,
        d.location AS disaster_location,
        u.name AS allocated_by_name
      FROM resource_allocations ra
      LEFT JOIN resources r ON ra.resource_id = r.id
      LEFT JOIN disasters d ON ra.disaster_id = d.id
      LEFT JOIN users u ON ra.allocated_by = u.id
      ORDER BY ra.allocated_at DESC
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
        allocations: rows,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch resource allocations" });
  }
};

module.exports = {
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  allocateResource,
  getResourceAllocations,
  reviewResource,
};
