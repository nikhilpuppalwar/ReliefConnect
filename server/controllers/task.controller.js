const path = require("path");
const { validationResult } = require("express-validator");
const pool = require("../config/db");
const { uploadFile } = require("../config/storage");

// ─── GET /api/tasks  (admin: all tasks with filters) ─────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const { status, category, limit, sort } = req.query;

    let sql = `
      SELECT
        t.*,
        d.title     AS disaster_title,
        d.location  AS disaster_location,
        u_to.name   AS assigned_to_name,
        u_by.name   AS assigned_by_name
      FROM tasks t
      LEFT JOIN disasters d ON t.disaster_id = d.id
      LEFT JOIN volunteers v_to ON t.volunteer_id = v_to.id
      LEFT JOIN users u_to ON v_to.user_id = u_to.id
      LEFT JOIN users u_by ON t.created_by = u_by.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      // Support comma-separated statuses: ?status=pending,in_progress
      const statuses = status.split(",").map((s) => s.trim());
      sql += ` AND t.status IN (${statuses.map(() => "?").join(",")})`;
      params.push(...statuses);
    }

    if (category) {
      // Backward-compat: older prototypes used `category`, but current schema does not.
      // Ignore it silently.
    }

    const orderCol = sort === "updated_at" ? "t.updated_at" : "t.created_at";
    sql += ` ORDER BY ${orderCol} DESC`;

    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }

    const [rows] = await pool.query(sql, params);
    return res.json({
      success: true,
      data: {
        total: rows.length,
        tasks: rows,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// ─── GET /api/tasks/me  (volunteer: my tasks) ────────────────────────────────
const getMyTasks = async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT
        t.*,
        d.title    AS disaster_title,
        d.location AS disaster_location,
        u_by.name  AS assigned_by_name
      FROM tasks t
      LEFT JOIN disasters d ON t.disaster_id = d.id
      LEFT JOIN users u_by  ON t.created_by = u_by.id
      WHERE t.volunteer_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      sql += ` AND t.status IN (${statuses.map(() => "?").join(",")})`;
      params.push(...statuses);
    }

    sql += " ORDER BY t.created_at DESC";

    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch my tasks" });
  }
};

// ─── POST /api/tasks  (admin: create + assign task) ──────────────────────────
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", data: errors.array() });
    }
    const { title, description, disaster_id, volunteer_id, due_date, status = "assigned", priority = "medium" } = req.body;
    const parsedDueDate = due_date ? new Date(due_date) : null;
    const [result] = await pool.query(
      "INSERT INTO tasks (title, description, disaster_id, volunteer_id, due_date, status, priority, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [title, description || null, disaster_id, volunteer_id, parsedDueDate, status, priority, req.user.id]
    );
    return res.status(201).json({ success: true, data: { id: result.insertId, title, status } });
  } catch (error) {
    console.error("Task creation error:", error);
    return res.status(500).json({ success: false, message: "Failed to create task: " + String(error) });
  }
};

// ─── PUT /api/tasks/:id/status  (volunteer/admin: update status + proof) ─────
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let proofUrl = null;

    if (req.file) {
      const key = `tasks/${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(req.file.originalname)}`;
      const { url } = await uploadFile({
        buffer: req.file.buffer,
        contentType: req.file.mimetype,
        key,
      });
      proofUrl = url;
    }

    if (req.user.role === "volunteer") {
      // Volunteer can only update tasks assigned to them.
      const [result] = await pool.query(
        `UPDATE tasks
         SET status = ?,
             proof_url = COALESCE(?, proof_url),
             completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_at END
         WHERE id = ? AND volunteer_id = ?`,
        [status, proofUrl, status, req.params.id, req.user.id]
      );
      if (result.affectedRows === 0) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    } else {
      await pool.query(
        `UPDATE tasks
         SET status = ?,
             proof_url = COALESCE(?, proof_url),
             completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_at END
         WHERE id = ?`,
        [status, proofUrl, status, req.params.id]
      );
    }

    return res.json({ success: true, data: { id: Number(req.params.id), status, proof_url: proofUrl } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update task status" });
  }
};

// ─── PUT /api/tasks/:id  (admin: full edit) ──────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { title, description, disaster_id, volunteer_id, due_date, status, priority } = req.body;
    await pool.query(
      `UPDATE tasks
       SET title        = COALESCE(?, title),
           description  = COALESCE(?, description),
           disaster_id  = COALESCE(?, disaster_id),
           volunteer_id = COALESCE(?, volunteer_id),
           due_date     = COALESCE(?, due_date),
           status       = COALESCE(?, status),
           priority     = COALESCE(?, priority),
           updated_at   = NOW()
       WHERE id = ?`,
      [title || null, description || null, disaster_id || null, volunteer_id || null, due_date || null, status || null, priority || null, req.params.id]
    );
    const [rows] = await pool.query(
      `SELECT t.*, d.title AS disaster_title, u_to.name AS assigned_to_name
       FROM tasks t
       LEFT JOIN disasters d ON t.disaster_id = d.id
       LEFT JOIN volunteers v ON t.volunteer_id = v.id
       LEFT JOIN users u_to ON v.user_id = u_to.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

// ─── PUT /api/tasks/:id/assign  (admin: emergency reassign to volunteer) ──────
const assignTask = async (req, res) => {
  try {
    const { volunteer_id } = req.body;
    if (!volunteer_id) return res.status(400).json({ success: false, message: "volunteer_id required" });
    await pool.query(
      "UPDATE tasks SET volunteer_id = ?, status = 'assigned', updated_at = NOW() WHERE id = ?",
      [volunteer_id, req.params.id]
    );
    return res.json({ success: true, data: { id: Number(req.params.id), volunteer_id, status: "assigned" } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to assign task" });
  }
};

// ─── DELETE /api/tasks/:id  (admin only) ─────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    await pool.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};

module.exports = { getAllTasks, getMyTasks, createTask, updateTask, updateTaskStatus, assignTask, deleteTask };
