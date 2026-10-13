import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  console.log("Connected to MySQL server...");

  // Create database
  await connection.query(`CREATE DATABASE IF NOT EXISTS mucyo_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.query(`USE mucyo_portfolio;`);
  console.log("Database 'mucyo_portfolio' selected.");

  // Execute schema tables
  const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const statements = schemaSql.split(";").filter((stmt) => stmt.trim().length > 0);
  for (const stmt of statements) {
    if (!stmt.trim().toUpperCase().startsWith("CREATE DATABASE") && !stmt.trim().toUpperCase().startsWith("USE ")) {
      await connection.query(stmt);
    }
  }
  console.log("Schema tables verified/created.");

  // Seed Admin
  const adminUsername = process.env.ADMIN_USERNAME || "mucyo answer";
  const adminPassword = process.env.ADMIN_PASSWORD || "MucyoAdmin2026!";
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const [existingAdmin] = await connection.query("SELECT * FROM admins WHERE username = ?", [adminUsername]);
  if (existingAdmin.length === 0) {
    await connection.query("INSERT INTO admins (username, password_hash) VALUES (?, ?)", [adminUsername, passwordHash]);
    console.log(`Admin account '${adminUsername}' created successfully.`);
  } else {
    await connection.query("UPDATE admins SET password_hash = ? WHERE username = ?", [passwordHash, adminUsername]);
    console.log(`Admin account '${adminUsername}' password updated.`);
  }

  // Seed Profile
  const [existingProfile] = await connection.query("SELECT * FROM profile");
  if (existingProfile.length === 0) {
    await connection.query(
      `INSERT INTO profile (name, title, secondary, school, location, tagline, sidebar_description, email, github, linkedin, form_endpoint) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  const [existingProjects] = await connection.query("SELECT * FROM projects");
  if (existingProjects.length === 0) {
    const defaultProjects = [
      {
        title: "Services Booking System",
        kind: "Personal Project",
        description: "A web-based platform for managing services, reservations, schedules and appointments.",
        technologies: JSON.stringify(["React.js", "Node.js", "Express.js", "MySQL", "REST API"]),
        github: "",
        demo: "",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=70",
      },
      {
        title: "IoT Fire Safety Monitoring",
        kind: "School Project",
        description: "An IoT monitoring system using sensors and an ESP32 to monitor environmental conditions and provide safety alerts.",
        technologies: JSON.stringify(["ESP32", "DHT11", "MQ Sensor", "PHP", "MySQL", "JavaScript"]),
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
      await connection.query(
        "INSERT INTO projects (title, kind, description, technologies, github, demo, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [p.title, p.kind, p.description, p.technologies, p.github, p.demo, p.image]
      );
    }
    console.log("Default projects seeded.");
  }

  // Seed Skills
  const [existingSkills] = await connection.query("SELECT * FROM skills");
  if (existingSkills.length === 0) {
    const defaultSkills = [
      { group_name: "Frontend", item_name: "React.js" },
      { group_name: "Frontend", item_name: "JavaScript" },
      { group_name: "Frontend", item_name: "HTML" },
      { group_name: "Frontend", item_name: "CSS" },
      { group_name: "Backend", item_name: "Node.js" },
      { group_name: "Backend", item_name: "Express.js" },
      { group_name: "Database", item_name: "MySQL" },
      { group_name: "Tools", item_name: "Git & GitHub" },
      { group_name: "IoT", item_name: "ESP32 & Sensors" },
    ];

    for (const s of defaultSkills) {
      await connection.query("INSERT INTO skills (group_name, item_name) VALUES (?, ?)", [s.group_name, s.item_name]);
    }
    console.log("Default skills seeded.");
  }

  // Seed Education
  const [existingEdu] = await connection.query("SELECT * FROM education");
  if (existingEdu.length === 0) {
    await connection.query(
      "INSERT INTO education (period, title, institution, location, description, topics) VALUES (?, ?, ?, ?, ?, ?)",
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

  await connection.end();
  console.log("Database seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
