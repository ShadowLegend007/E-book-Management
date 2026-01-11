import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sendWelcomeEmail, sendOtpEmail } from "./utils/email.mjs";

// ==========================
// Configuration
// ==========================
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ==========================
// Database Connection
// ==========================
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✓ Connected to PostgreSQL");
  } catch (err) {
    console.error("DB connection failed:", err.message);
    if (err.message.includes("ENOTFOUND")) {
      console.error("❌ Error: The database host could not be found. Please check your DATABASE_URL in the .env file. The project might be paused or the hostname is incorrect.");
    } else if (err.message.includes("password verification failed")) {
      console.error("❌ Error: Invalid password or username. Please check your credentials in the .env file.");
    }
    throw err;
  }
};

// ==========================
// Express App Setup
// ==========================
const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Static files for uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// ==========================
// Multer Setup for File Uploads
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "file") {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed"));
      }
    } else if (file.fieldname === "coverImage") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for cover"));
      }
    } else {
      cb(null, true);
    }
  },
});

// ==========================
// Auth Middleware
// ==========================
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query("SELECT id, name, email, role, is_verified FROM users WHERE id = $1", [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ==========================
// Root & Health Check Routes
// ==========================
app.get("/", (req, res) => {
  res.status(200).send("<h1>Backend Server Running</h1>");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ==========================
// AUTH ROUTES
// ==========================

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, phone, department, institute } = req.body;

    if (!name || !email || !password || !institute) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, department, institute, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id, name, email, role, is_verified`,
      [name, email, hashedPassword, phone || null, department || null, institute]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    // Send Welcome Email
    try {
      await sendWelcomeEmail(user);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role === 1 ? "admin" : "user",
        isVerified: user.is_verified,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role === 1 ? "admin" : "user",
        isVerified: user.is_verified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get current user
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role === 1 ? "admin" : "user",
      isVerified: req.user.is_verified,
    },
  });
});

// Delete account
app.delete("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);
    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Forgot Password
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query("UPDATE users SET otp = $1, reset_password_expiry = $2 WHERE id = $3", [otp, expiry, user.id]);

    await sendOtpEmail(user, otp);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Reset Password
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: "Email, OTP and password required" });
    }

    // Verify OTP
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    // Check if OTP matches and not expired
    if (!user.otp || parseInt(user.otp) !== parseInt(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.reset_password_expiry)) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear OTP
    await pool.query("UPDATE users SET password = $1, otp = NULL, reset_password_expiry = NULL WHERE id = $2", [hashedPassword, user.id]);

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Change Password
app.post("/api/auth/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await pool.query("SELECT password FROM users WHERE id = $1", [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, req.user.id]);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// USERS ROUTES (Admin)
// ==========================

// Get all users
app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = "SELECT id, name, email, phone, department, institute, role, is_verified, created_at FROM users";
    const params = [];
    const conditions = [];

    // Filter by Search
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    // Filter by Role
    if (role && role !== 'all') {
      let roleValue;
      if (role === 'admin') roleValue = 1;
      else if (role === 'teacher') roleValue = 2;
      else if (role === 'student') roleValue = 0;

      if (roleValue !== undefined) {
        params.push(roleValue);
        conditions.push(`role = $${params.length}`);
      }
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    const users = result.rows.map((u) => {
      let roleStr = "student";
      if (u.role === 1) roleStr = "admin";
      if (u.role === 2) roleStr = "teacher";

      return {
        id: u.id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        department: u.department,
        institute: u.institute,
        role: roleStr,
        isVerified: u.is_verified,
        createdAt: u.created_at,
      };
    });

    res.json({ success: true, users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update user role
app.put("/api/users/:id", authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // Only allow admin to perform this action
    if (req.user.role !== 1) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    let roleValue = 0;
    if (role === "admin") roleValue = 1;
    else if (role === "teacher") roleValue = 2;
    // else roleValue = 0 (student)

    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, role",
      [roleValue, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User role updated" });
  } catch (err) {
    console.error("Update user role error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete user (Admin)
app.delete("/api/users/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 1) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot delete your own admin account from here" });
    }

    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user stats
app.get("/api/users/stats/roles", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 1) as admins,
        COUNT(*) FILTER (WHERE role = 2) as teachers,
        COUNT(*) FILTER (WHERE role = 0) as students
      FROM users
    `);

    res.json({
      success: true,
      stats: {
        total: parseInt(result.rows[0].total),
        admins: parseInt(result.rows[0].admins),
        teachers: parseInt(result.rows[0].teachers),
        students: parseInt(result.rows[0].students),
      },
    });
  } catch (err) {
    console.error("Get user stats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// UPLOAD ROUTES
// ==========================

// Upload a file
app.post(
  "/api/upload/upload",
  authMiddleware,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, author, description, category, language, year, documentType, isABook } = req.body;

      if (!title || !author || !category) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      if (!req.files || !req.files.file) {
        return res.status(400).json({ success: false, message: "PDF file is required" });
      }

      const uploadId = uuidv4();
      const bookFile = req.files.file[0].filename;
      const coverFile = req.files.coverImage ? req.files.coverImage[0].filename : null;
      const isBook = isABook === "true" ? 1 : 0;

      await pool.query(
        `INSERT INTO uploads (user_id, upload_id, title, author, description, category, language, year, document_type, book_file, cover_file, is_a_book)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [req.user.id, uploadId, title, author, description || null, category, language || null, year || null, documentType || null, bookFile, coverFile, isBook]
      );

      res.status(201).json({
        success: true,
        message: "Upload successful",
        uploadId,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Get books
app.get("/api/upload/getBook", async (req, res) => {
  try {
    const { type, limit = 20, offset = 0, category } = req.query;

    let query = "SELECT * FROM uploads WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (type === "book") {
      query += ` AND is_a_book = 1`;
    } else if (type === "note") {
      query += ` AND is_a_book = 0`;
    }

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    const resources = result.rows.map((r) => ({
      id: r.id.toString(),
      uploadId: r.upload_id,
      title: r.title,
      author: r.author,
      description: r.description,
      category: r.category,
      language: r.language,
      year: r.year,
      documentType: r.document_type,
      bookFile: r.book_file ? `/uploads/${r.book_file}` : null,
      coverFile: r.cover_file ? `/uploads/${r.cover_file}` : null,
      isABook: r.is_a_book === 1,
      createdAt: r.created_at,
    }));

    res.json({ success: true, resources });
  } catch (err) {
    console.error("Get books error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get upload stats
app.get("/api/upload/stats", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_a_book = 1) as books,
        COUNT(*) FILTER (WHERE is_a_book = 0) as notes
      FROM uploads
    `);

    res.json({
      success: true,
      stats: {
        total: parseInt(result.rows[0].total),
        books: parseInt(result.rows[0].books),
        notes: parseInt(result.rows[0].notes),
      },
    });
  } catch (err) {
    console.error("Get upload stats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get single upload by ID
app.get("/api/upload/:uploadId", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM uploads WHERE upload_id = $1", [req.params.uploadId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const r = result.rows[0];
    res.json({
      success: true,
      resource: {
        id: r.id.toString(),
        uploadId: r.upload_id,
        title: r.title,
        author: r.author,
        description: r.description,
        category: r.category,
        language: r.language,
        year: r.year,
        documentType: r.document_type,
        bookFile: r.book_file ? `/uploads/${r.book_file}` : null,
        coverFile: r.cover_file ? `/uploads/${r.cover_file}` : null,
        isABook: r.is_a_book === 1,
        createdAt: r.created_at,
      },
    });
  } catch (err) {
    console.error("Get upload error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete upload
app.delete("/api/upload/:uploadId", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM uploads WHERE upload_id = $1 RETURNING *", [req.params.uploadId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    // Delete files from disk
    const upload = result.rows[0];
    if (upload.book_file) {
      const filePath = path.join(uploadsDir, upload.book_file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (upload.cover_file) {
      const coverPath = path.join(uploadsDir, upload.cover_file);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }

    res.json({ success: true, message: "Resource deleted" });
  } catch (err) {
    console.error("Delete upload error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// FAVORITES ROUTES
// ==========================

// Toggle favorite
app.post("/api/favorites/:uploadId", authMiddleware, async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;

    // Check if exists
    const existing = await pool.query(
      "SELECT * FROM favorites WHERE user_id = $1 AND upload_id = $2",
      [userId, uploadId]
    );

    if (existing.rows.length > 0) {
      // Remove
      await pool.query(
        "DELETE FROM favorites WHERE user_id = $1 AND upload_id = $2",
        [userId, uploadId]
      );
      return res.json({ success: true, message: "Removed from favorites", isFavorite: false });
    } else {
      // Add
      await pool.query(
        "INSERT INTO favorites (user_id, upload_id) VALUES ($1, $2)",
        [userId, uploadId]
      );
      return res.json({ success: true, message: "Added to favorites", isFavorite: true });
    }
  } catch (err) {
    console.error("Toggle favorite error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user favorites with details
app.get("/api/favorites/resources", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT u.* 
       FROM uploads u
       JOIN favorites f ON u.upload_id = f.upload_id
       WHERE f.user_id = $1
       ORDER BY u.created_at DESC`,
      [userId]
    );

    const resources = result.rows.map((r) => ({
      id: r.id.toString(),
      uploadId: r.upload_id,
      title: r.title,
      author: r.author,
      description: r.description,
      category: r.category,
      language: r.language,
      year: r.year,
      documentType: r.document_type,
      bookFile: r.book_file ? `/uploads/${r.book_file}` : null,
      coverFile: r.cover_file ? `/uploads/${r.cover_file}` : null,
      isABook: r.is_a_book === 1,
      createdAt: r.created_at,
    }));

    res.json({ success: true, resources });
  } catch (err) {
    console.error("Get favorite resources error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user favorites
app.get("/api/favorites", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT f.upload_id 
       FROM favorites f
       WHERE f.user_id = $1`,
      [userId]
    );

    const favoriteIds = result.rows.map(row => row.upload_id);
    res.json({ success: true, favorites: favoriteIds });
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user's uploads
app.get("/api/upload/user/my-uploads", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM uploads WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);

    const resources = result.rows.map((r) => ({
      id: r.id.toString(),
      uploadId: r.upload_id,
      title: r.title,
      author: r.author,
      description: r.description,
      category: r.category,
      language: r.language,
      year: r.year,
      documentType: r.document_type,
      bookFile: r.book_file ? `/uploads/${r.book_file}` : null,
      coverFile: r.cover_file ? `/uploads/${r.cover_file}` : null,
      isABook: r.is_a_book === 1,
      createdAt: r.created_at,
    }));

    res.json({ success: true, resources });
  } catch (err) {
    console.error("Get user uploads error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================
// Error Handling
// ==========================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Server error" });
});

// ==========================
// Start Server
// ==========================
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
