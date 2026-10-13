import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import { verifyAdmin } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secure_jwt_secret_key_change_me_in_production_2026";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ================= AUTH ROUTES =================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const [rows] = await pool.query("SELECT * FROM admins WHERE username = ?", [username.trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const admin = rows[0];
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, message: "Logged in successfully", username: admin.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/api/auth/check", verifyAdmin, (req, res) => {
  res.json({ authenticated: true, admin: req.admin });
});

// ================= PUBLIC PORTFOLIO DATA ROUTES =================
app.get("/api/portfolio", async (req, res) => {
  try {
    const [profileRows] = await pool.query("SELECT * FROM profile LIMIT 1");
    const [projectRows] = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    const [skillRows] = await pool.query("SELECT * FROM skills ORDER BY group_name, id");
    const [eduRows] = await pool.query("SELECT * FROM education ORDER BY id DESC");

    const projects = projectRows.map((p) => ({
      ...p,
      technologies: typeof p.technologies === "string" ? JSON.parse(p.technologies || "[]") : p.technologies,
    }));

    const education = eduRows.map((e) => ({
      ...e,
      topics: typeof e.topics === "string" ? JSON.parse(e.topics || "[]") : e.topics,
    }));

    res.json({
      profile: profileRows[0] || {},
      projects,
      skills: skillRows,
      education,
    });
  } catch (err) {
    console.error("Error fetching portfolio data:", err);
    res.status(500).json({ error: "Failed to fetch portfolio data" });
  }
});

// ================= ADMIN CRUD ROUTES (PROTECTED) =================

// --- Profile ---
app.put("/api/admin/profile", verifyAdmin, async (req, res) => {
  try {
    const { name, title, secondary, school, location, tagline, sidebar_description, email, github, linkedin, form_endpoint, image } = req.body;
    await pool.query(
      `UPDATE profile SET name = ?, title = ?, secondary = ?, school = ?, location = ?, tagline = ?, sidebar_description = ?, email = ?, github = ?, linkedin = ?, form_endpoint = ?, image = ? WHERE id = 1`,
      [name, title, secondary, school, location, tagline, sidebar_description, email, github, linkedin, form_endpoint, image || "/mucyo.JPG"]
    );
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// --- Admin Credentials ---
app.put("/api/admin/credentials", verifyAdmin, async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;
    const adminId = req.admin.id;

    if (!currentPassword || !newUsername) {
      return res.status(400).json({ error: "Current password and new username are required" });
    }

    const [rows] = await pool.query("SELECT * FROM admins WHERE id = ?", [adminId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    let query = "UPDATE admins SET username = ?";
    let params = [newUsername.trim()];

    if (newPassword && newPassword.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      query += ", password_hash = ?";
      params.push(hashedPassword);
    }

    query += " WHERE id = ?";
    params.push(adminId);

    await pool.query(query, params);
    res.json({ success: true, message: "Credentials updated successfully" });
  } catch (err) {
    console.error("Error updating credentials:", err);
    res.status(500).json({ error: "Failed to update credentials" });
  }
});

// --- Projects ---
app.get("/api/admin/projects", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    const projects = rows.map((p) => ({
      ...p,
      technologies: typeof p.technologies === "string" ? JSON.parse(p.technologies || "[]") : p.technologies,
    }));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

app.post("/api/admin/projects", verifyAdmin, async (req, res) => {
  try {
    const { title, kind, description, technologies, github, demo, image } = req.body;
    const techJson = JSON.stringify(Array.isArray(technologies) ? technologies : (technologies ? technologies.split(",") : []));
    const [result] = await pool.query(
      "INSERT INTO projects (title, kind, description, technologies, github, demo, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, kind, description, techJson, github || "", demo || "", image || ""]
    );
    res.json({ success: true, id: result.insertId, message: "Project created successfully" });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

app.put("/api/admin/projects/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, kind, description, technologies, github, demo, image } = req.body;
    const techJson = JSON.stringify(Array.isArray(technologies) ? technologies : (technologies ? technologies.split(",") : []));
    await pool.query(
      "UPDATE projects SET title = ?, kind = ?, description = ?, technologies = ?, github = ?, demo = ?, image = ? WHERE id = ?",
      [title, kind, description, techJson, github || "", demo || "", image || "", id]
    );
    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

app.delete("/api/admin/projects/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM projects WHERE id = ?", [id]);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// --- Skills ---
app.get("/api/admin/skills", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM skills ORDER BY group_name, id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

app.post("/api/admin/skills", verifyAdmin, async (req, res) => {
  try {
    const { group_name, item_name } = req.body;
    const [result] = await pool.query("INSERT INTO skills (group_name, item_name) VALUES (?, ?)", [group_name, item_name]);
    res.json({ success: true, id: result.insertId, message: "Skill added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add skill" });
  }
});

app.delete("/api/admin/skills/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM skills WHERE id = ?", [id]);
    res.json({ success: true, message: "Skill deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

// --- Education ---
app.get("/api/admin/education", verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM education ORDER BY id DESC");
    const edu = rows.map((e) => ({
      ...e,
      topics: typeof e.topics === "string" ? JSON.parse(e.topics || "[]") : e.topics,
    }));
    res.json(edu);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch education" });
  }
});

app.post("/api/admin/education", verifyAdmin, async (req, res) => {
  try {
    const { period, title, institution, location, description, topics } = req.body;
    const topicsJson = JSON.stringify(Array.isArray(topics) ? topics : (topics ? topics.split(",") : []));
    const [result] = await pool.query(
      "INSERT INTO education (period, title, institution, location, description, topics) VALUES (?, ?, ?, ?, ?, ?)",
      [period, title, institution, location, description, topicsJson]
    );
    res.json({ success: true, id: result.insertId, message: "Education record added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add education record" });
  }
});

app.delete("/api/admin/education/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM education WHERE id = ?", [id]);
    res.json({ success: true, message: "Education record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete education record" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
