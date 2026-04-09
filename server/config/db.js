const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error("Missing DB_* environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).");
}

// Basic safety: DB_NAME is interpolated into CREATE DATABASE, so restrict characters.
if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) {
  throw new Error("Invalid DB_NAME format.");
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

const originalQuery = pool.query.bind(pool);

async function ensureSchemaIfNeeded() {
  // Check if at least `users` exists; if not, run the init SQL (creates tables).
  const [rows] = await originalQuery(
    `SELECT TABLE_NAME
     FROM information_schema.tables
     WHERE table_schema = ? AND table_name = 'users'
     LIMIT 1;`,
    [DB_NAME]
  );

  const haveUsers = Array.isArray(rows) && rows.length > 0;
  if (haveUsers) return;

  const initSqlPath = path.join(__dirname, "..", "migrations", "001_init_schema.sql");
  const initSql = fs.readFileSync(initSqlPath, "utf8");
  await originalQuery(initSql);
}

// Wrap queries so register/login works even on a fresh DB.
pool.query = async (sql, params) => {
  try {
    return await originalQuery(sql, params);
  } catch (err) {
    // ER_BAD_DB_ERROR = "Unknown database '<name>'"
    if (err && err.code === "ER_BAD_DB_ERROR") {
      const adminConn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
      });

      await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      await adminConn.end();

      await ensureSchemaIfNeeded();
      return await originalQuery(sql, params); // retry the original query
    }

    throw err;
  }
};

module.exports = pool;
