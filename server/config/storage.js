/**
 * Storage Abstraction Layer
 * ─────────────────────────
 * Switches automatically between providers based on environment:
 *
 *   USE_LOCAL_STORAGE=true  →  Local disk  (development)
 *   USE_LOCAL_STORAGE unset →  AWS S3      (production)
 *
 * All callers use a single function:
 *
 *   const { url, key, provider } = await uploadFile({ buffer, contentType, key });
 *
 * The returned `url` is always a publicly accessible HTTP URL string,
 * regardless of which provider is active.
 */

const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// ─── Provider Detection ───────────────────────────────────────────────────────

const USE_LOCAL = process.env.USE_LOCAL_STORAGE === "true";

// ─── Local Disk Provider ──────────────────────────────────────────────────────

/**
 * Saves a buffer to `server/uploads/<key>` and returns a URL.
 * The server must serve /uploads as static files (see index.js).
 *
 * @param {{ buffer: Buffer, key: string }} opts
 * @returns {{ url: string, key: string, provider: 'local' }}
 */
const uploadLocal = async ({ buffer, key }) => {
  // Resolve uploads root to <project-root>/server/uploads/
  const uploadsRoot = path.join(__dirname, "..", "uploads");

  // key may include sub-directories like "disasters/123-abc.jpg"
  const destPath = path.join(uploadsRoot, key);
  const destDir = path.dirname(destPath);

  // Create nested directories if they don't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);

  // Build public URL — uses LOCAL_STORAGE_URL env var with fallback
  const baseUrl =
    (process.env.LOCAL_STORAGE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");

  const url = `${baseUrl}/uploads/${key}`;

  return { url, key, provider: "local" };
};

// ─── AWS S3 Provider ──────────────────────────────────────────────────────────

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a buffer to S3 and returns the public object URL.
 *
 * @param {{ buffer: Buffer, contentType: string, key: string }} opts
 * @returns {{ url: string, key: string, provider: 's3' }}
 */
const uploadS3 = async ({ buffer, contentType, key }) => {
  const bucket = process.env.S3_BUCKET_NAME;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { url, key, provider: "s3" };
};

// ─── Unified Upload Function ──────────────────────────────────────────────────

/**
 * Upload a file buffer using the active storage provider.
 *
 * @param {{ buffer: Buffer, contentType: string, key: string }} opts
 *   - buffer      Raw file bytes (from multer memoryStorage)
 *   - contentType MIME type string (e.g. "image/jpeg")
 *   - key         Storage path/filename (e.g. "disasters/1234-abc.jpg")
 *
 * @returns {Promise<{ url: string, key: string, provider: 'local' | 's3' }>}
 *   - url      Publicly accessible HTTP URL for the uploaded file
 *   - key      The storage key/path used
 *   - provider Which provider stored the file
 */
const uploadFile = (opts) => {
  if (USE_LOCAL) {
    return uploadLocal(opts);
  }
  return uploadS3(opts);
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  uploadFile,
  // Expose individual providers for testing / direct use
  uploadLocal,
  uploadS3,
  // Active provider name — useful for logging
  activeProvider: USE_LOCAL ? "local" : "s3",
};
