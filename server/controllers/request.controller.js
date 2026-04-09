const path = require("path");
const { validationResult } = require("express-validator");
const pool = require("../config/db");
const { uploadFile } = require("../config/storage");

// ─── GET /api/requests  (filters for civilian/volunteer/admin) ─────────────
const getAllRequests = async (req, res) => {
  try {
    const { status, priority, from, to, limit, requested_by, assigned_to } = req.query;

    const role = req.user?.role;
    const isAdmin = role === "admin";
    const isCivilian = role === "civilian";
    const isVolunteer = role === "volunteer";

    const requestedByMe = requested_by === "me";
    const assignedToMe = assigned_to === "me";

    // Enforce access by filter intent (matches FLOW _c_v.md).
    if (requestedByMe && !isCivilian && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: requested_by=me" });
    }
    if (assignedToMe && !isVolunteer && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: assigned_to=me" });
    }

    // If no intent filter provided, default to "my own" based on role.
    const effectiveRequestedByMe = requestedByMe || (!requestedByMe && !assignedToMe && isCivilian);
    const effectiveAssignedToMe = assignedToMe || (!requestedByMe && !assignedToMe && isVolunteer);

    let sql = `
      SELECT
        hr.*,
        u_req.name       AS requested_by_name,
        u_req.avatar_url AS requested_by_avatar,
        u_asgn.name      AS assigned_to_name,
        u_asgn.avatar_url AS assigned_to_avatar
      FROM help_requests hr
      LEFT JOIN users u_req ON hr.user_id = u_req.id
      LEFT JOIN volunteers v_asgn ON hr.volunteer_id = v_asgn.id
      LEFT JOIN users u_asgn ON v_asgn.user_id = u_asgn.id
      WHERE 1=1
    `;
    const params = [];

    if (effectiveRequestedByMe) {
      sql += " AND hr.user_id = ?";
      params.push(req.user.id);
    }

    if (effectiveAssignedToMe) {
      sql += " AND hr.volunteer_id = ?";
      params.push(req.user.id);
    }

    if (status) {
      const statuses = String(status)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length) {
        sql += ` AND hr.status IN (${statuses.map(() => "?").join(",")})`;
        params.push(...statuses);
      }
    }

    if (priority) {
      sql += " AND hr.priority = ?";
      params.push(priority);
    }

    if (from) {
      sql += " AND hr.created_at >= ?";
      params.push(from);
    }

    if (to) {
      sql += " AND hr.created_at <= ?";
      params.push(to);
    }

    sql += " ORDER BY hr.created_at DESC";

    if (limit) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }

    const [rows] = await pool.query(sql, params);

    const requests = rows.map((row) => {
      const {
        requested_by_name,
        requested_by_avatar,
        assigned_to_name,
        assigned_to_avatar,
        media_url,
        ...r
      } = row;

      return {
        ...r,
        requested_by: requested_by_name ? { name: requested_by_name, avatar_url: requested_by_avatar } : null,
        assigned_to: assigned_to_name
          ? { name: assigned_to_name, avatar_url: assigned_to_avatar }
          : null,
        photo_url: media_url,
      };
    });

    if (isAdmin && !effectiveRequestedByMe && !effectiveAssignedToMe) {
      return res.json({
        success: true,
        data: {
          total: requests.length,
          requests,
        },
      });
    }

    return res.json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};

// ─── GET /api/requests/my  (civilian: my own requests) ───────────────────────
const getMyRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT hr.*,
             u_asgn.name      AS assigned_to_name,
             u_asgn.avatar_url AS assigned_to_avatar,
             u_req.name       AS requested_by_name,
             u_req.avatar_url AS requested_by_avatar
      FROM help_requests hr
      LEFT JOIN volunteers v_asgn ON hr.volunteer_id = v_asgn.id
      LEFT JOIN users u_asgn ON v_asgn.user_id = u_asgn.id
      LEFT JOIN users u_req ON hr.user_id = u_req.id
      WHERE hr.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      sql += ` AND hr.status IN (${statuses.map(() => "?").join(",")})`;
      params.push(...statuses);
    }

    sql += " ORDER BY hr.created_at DESC";

    const [rows] = await pool.query(sql, params);

    const requests = rows.map((row) => {
      const { assigned_to_name, assigned_to_avatar, requested_by_name, requested_by_avatar, media_url, ...r } = row;
      return {
        ...r,
        requested_by: requested_by_name ? { name: requested_by_name, avatar_url: requested_by_avatar } : null,
        assigned_to: assigned_to_name ? { name: assigned_to_name, avatar_url: assigned_to_avatar } : null,
        photo_url: media_url,
      };
    });

    return res.json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch my requests" });
  }
};

// ─── POST /api/requests  (civilian/admin: create new request) ────────────────
const createRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", data: errors.array() });
    }

    const { title, description, location, priority = "high", status = "pending" } = req.body;
    let mediaUrl = null;

    if (req.file) {
      const key = `requests/${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(req.file.originalname)}`;
      const { url } = await uploadFile({ buffer: req.file.buffer, contentType: req.file.mimetype, key });
      mediaUrl = url;
    }

    // DB requires title, but FLOW civilian "new SOS request" only sends description.
    const safeTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim().slice(0, 255)
        : String(description || "").slice(0, 255) || "SOS Request";

    const [result] = await pool.query(
      "INSERT INTO help_requests (user_id, volunteer_id, title, description, location, priority, status, media_url) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)",
      [req.user.id, safeTitle, description, location, priority, status, mediaUrl]
    );

    return res.status(201).json({ success: true, data: { id: result.insertId, status } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create request" });
  }
};

// ─── PUT /api/requests/:id/assign  (admin: assign volunteer) ─────────────────
const assignRequest = async (req, res) => {
  try {
    const { volunteer_id } = req.body;
    await pool.query(
      "UPDATE help_requests SET volunteer_id = ?, status = 'assigned' WHERE id = ?",
      [volunteer_id, req.params.id]
    );
    return res.json({ success: true, data: { id: Number(req.params.id), volunteer_id, status: "assigned" } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to assign request" });
  }
};

// ─── PUT /api/requests/:id/status  (admin/volunteer: update status) ──────────
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (req.user.role === "volunteer") {
      // Volunteer can only update requests assigned to them
      const [result] = await pool.query("UPDATE help_requests SET status = ? WHERE id = ? AND volunteer_id = ?", [
        status,
        req.params.id,
        req.user.id,
      ]);
      if (result.affectedRows === 0) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    } else {
      await pool.query("UPDATE help_requests SET status = ? WHERE id = ?", [status, req.params.id]);
    }

    return res.json({ success: true, data: { id: Number(req.params.id), status } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update request status" });
  }
};

// Alias for admin flow docs: PUT /api/requests/:id with { status }
const updateRequest = async (req, res) => {
  return updateRequestStatus(req, res);
};

// ─── GET /api/requests/:id  (civilian/volunteer/admin: request detail) ──────
const getRequestById = async (req, res) => {
  try {
    const reqId = Number(req.params.id);

    const sql = `
      SELECT
        hr.*,
        u_req.name       AS requested_by_name,
        u_req.avatar_url AS requested_by_avatar,
        u_asgn.name      AS assigned_to_name,
        u_asgn.avatar_url AS assigned_to_avatar
      FROM help_requests hr
      LEFT JOIN users u_req ON hr.user_id = u_req.id
      LEFT JOIN volunteers v_asgn ON hr.volunteer_id = v_asgn.id
      LEFT JOIN users u_asgn ON v_asgn.user_id = u_asgn.id
      WHERE hr.id = ?
    `;

    const [rows] = await pool.query(sql, [reqId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const row = rows[0];

    // Access control
    if (req.user.role === "civilian" && row.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (req.user.role === "volunteer" && row.volunteer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const {
      requested_by_name,
      requested_by_avatar,
      assigned_to_name,
      assigned_to_avatar,
      media_url,
      ...r
    } = row;

    return res.json({
      success: true,
      data: {
        ...r,
        requested_by: requested_by_name ? { name: requested_by_name, avatar_url: requested_by_avatar } : null,
        assigned_to: assigned_to_name ? { name: assigned_to_name, avatar_url: assigned_to_avatar } : null,
        photo_url: media_url,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch request detail" });
  }
};

// ─── DELETE /api/requests/:id  (admin) ───────────────────────────────────────
const deleteRequest = async (req, res) => {
  try {
    await pool.query("DELETE FROM help_requests WHERE id = ?", [req.params.id]);
    return res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete request" });
  }
};

module.exports = {
  getAllRequests,
  getMyRequests,
  getRequestById,
  createRequest,
  assignRequest,
  updateRequest,
  updateRequestStatus,
  deleteRequest,
};
