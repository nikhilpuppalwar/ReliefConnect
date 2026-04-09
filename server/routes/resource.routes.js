const express = require("express");
const { body, param } = require("express-validator");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const validate = require("../middleware/validate");
const {
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  allocateResource,
  reviewResource,
} = require("../controllers/resource.controller");

const router = express.Router();

router.get("/", auth, getAllResources);
router.post(
  "/",
  auth,
  role(["admin", "civilian"]),
  [
    body("name").trim().notEmpty(),
    body("quantity").optional().isFloat({ min: 0 }),
    body("quantity_available").optional().isFloat({ min: 0 }),
    body("unit").optional().isString(),
  ],
  validate,
  createResource
);
router.put("/:id", auth, role(["admin"]), [param("id").isInt({ min: 1 })], validate, updateResource);
router.delete("/:id", auth, role(["admin"]), [param("id").isInt({ min: 1 })], validate, deleteResource);
router.post(
  "/:id/allocate",
  auth,
  role(["admin"]),
  [param("id").isInt({ min: 1 }), body("disaster_id").isInt({ min: 1 }), body("quantity").isFloat({ gt: 0 })],
  validate,
  allocateResource
);
router.put(
  "/:id/review",
  auth,
  role(["admin"]),
  [
    param("id").isInt({ min: 1 }),
    body("status").isIn(["approved", "rejected"]),
    body("rejection_reason")
      .optional()
      .isString()
      .isLength({ max: 500 }),
  ],
  validate,
  reviewResource
);

module.exports = router;
