const express = require("express");
const multer = require("multer");
const { body, param } = require("express-validator");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const validate = require("../middleware/validate");
const {
  getAllTasks,
  getMyTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
} = require("../controllers/task.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Admin: list all tasks
router.get("/", auth, role(["admin"]), getAllTasks);

// Volunteer: my tasks
router.get("/me", auth, role(["volunteer"]), getMyTasks);

// Admin: create + assign task
router.post(
  "/",
  auth,
  role(["admin"]),
  [
    body("title").trim().notEmpty(),
    body("description").optional().isString(),
    body("disaster_id").isInt({ min: 1 }),
    body("volunteer_id").isInt({ min: 1 }),
    body("due_date")
      .optional()
      .custom((val) => {
        if (!val) return true;
        const d = new Date(val);
        if (isNaN(d.getTime())) throw new Error("Invalid due_date");
        return true;
      }),
    body("status")
      .optional()
      .isIn(["assigned", "in_progress", "completed", "cancelled"])
      .withMessage("status must be one of: assigned, in_progress, completed, cancelled"),
  ],
  validate,
  createTask
);

// Admin: full task edit (title, description, disaster, volunteer, due_date, status)
router.put(
  "/:id",
  auth,
  role(["admin"]),
  [param("id").isInt({ min: 1 })],
  validate,
  updateTask
);

// Admin: emergency reassign volunteer
router.put(
  "/:id/assign",
  auth,
  role(["admin"]),
  [param("id").isInt({ min: 1 }), body("volunteer_id").isInt({ min: 1 })],
  validate,
  assignTask
);

// Volunteer / Admin: update status + optional proof upload
router.put(
  "/:id/status",
  auth,
  role(["volunteer", "admin"]),
  [param("id").isInt({ min: 1 }), body("status").isIn(["assigned", "in_progress", "completed", "cancelled"])],
  validate,
  upload.single("proof"),
  updateTaskStatus
);

// Admin: delete task
router.delete("/:id", auth, role(["admin"]), [param("id").isInt({ min: 1 })], validate, deleteTask);

module.exports = router;
