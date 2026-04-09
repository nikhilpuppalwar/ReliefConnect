require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const disasterRoutes = require("./routes/disaster.routes");
const volunteerRoutes = require("./routes/volunteer.routes");
const requestRoutes = require("./routes/request.routes");
const resourceRoutes = require("./routes/resource.routes");
const resourceAllocationRoutes = require("./routes/resource-allocation.routes");
const taskRoutes = require("./routes/task.routes");
const certificateRoutes = require("./routes/certificate.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Local Storage: serve uploaded files statically in development ───────────
if (process.env.USE_LOCAL_STORAGE === "true") {
  const uploadsDir = path.join(__dirname, "uploads");
  app.use("/uploads", express.static(uploadsDir));
  // eslint-disable-next-line no-console
  console.log(`[storage] Local disk mode active — serving /uploads from ${uploadsDir}`);
} else {
  // eslint-disable-next-line no-console
  console.log(`[storage] S3 mode active — bucket: ${process.env.S3_BUCKET_NAME}`);
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ success: true, data: { status: "ok" } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/disasters", disasterRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/resource-allocations", resourceAllocationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/users", userRoutes);

app.use((_req, res) => {
  return res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
