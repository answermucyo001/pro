import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:password@localhost:5432/mucyo_portfolio",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  console.log("Connected to PostgreSQL...");

  // Execute schema tables
  const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schemaSql);
  console.log("Schema tables verified/created.");

  // Seed Admin
  const adminUsername = process.env.ADMIN_USERNAME || "mucyo answer";
  const adminPassword = process.env.ADMIN_PASSWORD || "MucyoAdmin2026!";
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const { rows: existingAdmin } = await pool.query("SELECT * FROM admins WHERE username = $1", [adminUsername]);
  if (existingAdmin.length === 0) {
    await pool.query("INSERT INTO admins (username, password_hash) VALUES ($1, $2)", [adminUsername, passwordHash]);
    console.log(`Admin account '${adminUsername}' created successfully.`);
  } else {
    await pool.query("UPDATE admins SET password_hash = $1 WHERE username = $2", [passwordHash, adminUsername]);
    console.log(`Admin account '${adminUsername}' password updated.`);
  }

  // Seed Profile
  const { rows: existingProfile } = await pool.query("SELECT * FROM profile");
  if (existingProfile.length === 0) {
    await pool.query(
      `INSERT INTO profile (name, title, secondary, school, location, tagline, sidebar_description, email, github, linkedin, form_endpoint)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        "Mucyo",
        "Software Development Student",
        "Creative Artist",
        "Lycée de Muhura",
        "Rwanda",
        "Building with code. Creating with imagination.",
        "I build digital experiences, explore emerging technology, and create through code, drawing, and design.",
        "answermucyo001@gmail.com",
        "https://github.com/mucyoanswer001",
        "https://www.linkedin.com/in/mucyoanswer001",
        "",
      ]
    );
    console.log("Default profile seeded.");
  }

  // Seed Projects
  const { rows: existingProjects } = await pool.query("SELECT * FROM projects");
  if (existingProjects.length === 0) {
    const defaultProjects = [
      {
        title: "Services Booking System",
        kind: "Personal Project",
        description: "A web-based platform for managing services, reservations, schedules and appointments.",
        technologies: JSON.stringify(["React.js", "Node.js", "Express.js", "PostgreSQL", "REST API"]),
        github: "",
        demo: "",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=70",
      },
      {
        title: "IoT Fire Safety Monitoring",
        kind: "School Project",
        description: "An IoT monitoring system using sensors and an ESP32 to monitor environmental conditions and provide safety alerts.",
        technologies: JSON.stringify(["ESP32", "DHT11", "MQ Sensor", "PHP", "PostgreSQL", "JavaScript"]),
        github: "",
        demo: "",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70",
      },
      {
        title: "Personal Portfolio",
        kind: "Learning Project",
        description: "A personal portfolio combining software development, technology, creativity and artwork.",
        technologies: JSON.stringify(["React.js", "Vite", "CSS", "Framer Motion"]),
        github: "",
        demo: "",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=70",
      },
    ];

    for (const p of defaultProjects) {
      await pool.query(
        "INSERT INTO projects (title, kind, description, technologies, github, demo, image) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [p.title, p.kind, p.description, p.technologies, p.github, p.demo, p.image]
      );
    }
    console.log("Default projects seeded.");
  }

  // Seed Skills
  const { rows: existingSkills } = await pool.query("SELECT * FROM skills");
  if (existingSkills.length === 0) {
    const defaultSkills = [
      { group_name: "Frontend", item_name: "React.js" },
      { group_name: "Frontend", item_name: "JavaScript" },
      { group_name: "Frontend", item_name: "HTML" },
      { group_name: "Frontend", item_name: "CSS" },
      { group_name: "Backend", item_name: "Node.js" },
      { group_name: "Backend", item_name: "Express.js" },
      { group_name: "Database", item_name: "PostgreSQL" },
      { group_name: "Tools", item_name: "Git & GitHub" },
      { group_name: "IoT", item_name: "ESP32 & Sensors" },
    ];

    for (const s of defaultSkills) {
      await pool.query("INSERT INTO skills (group_name, item_name) VALUES ($1, $2)", [s.group_name, s.item_name]);
    }
    console.log("Default skills seeded.");
  }

  // Seed Education
  const { rows: existingEdu } = await pool.query("SELECT * FROM education");
  if (existingEdu.length === 0) {
    await pool.query(
      "INSERT INTO education (period, title, institution, location, description, topics) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        "Currently studying",
        "Software Development Student",
        "Lycée de Muhura",
        "Rwanda",
        "Studying the foundations of building software and connected devices, and applying them in personal and school projects.",
        JSON.stringify(["Programming", "Web Development", "Database Systems", "Software Development", "IoT", "Embedded Systems"]),
      ]
    );
    console.log("Default education seeded.");
  }

  await pool.end();
  console.log("Database seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
