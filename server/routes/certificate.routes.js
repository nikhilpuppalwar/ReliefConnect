const express = require("express");
const { body, param } = require("express-validator");
const multer = require("multer");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const validate = require("../middleware/validate");
const {
  getAllCertificates,
  getMyCertificates,
  getCertificatesByVolunteerId,
  createCertificate,
  deleteCertificate,
} = require("../controllers/certificate.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", auth, role(["admin"]), getAllCertificates);
router.get("/my", auth, role(["volunteer"]), getMyCertificates);
// FLOW _c_v.md: GET /api/certificates/:vid for volunteer dashboard
router.get(
  "/:vid",
  auth,
  role(["volunteer", "admin"]),
  [param("vid").isInt({ min: 1 })],
  validate,
  getCertificatesByVolunteerId
);
router.post(
  "/",
  auth,
  role(["admin"]),
  upload.single("certificate"),
  [body("volunteer_id").isInt({ min: 1 }), body("title").trim().notEmpty(), body("issued_on").optional().isISO8601()],
  validate,
  createCertificate
);
router.delete("/:id", auth, role(["admin"]), [param("id").isInt({ min: 1 })], validate, deleteCertificate);

module.exports = router;
