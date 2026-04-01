import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Pizzas12!@",
};

const DB_NAME = process.env.DB_NAME || "mydatabase1";
let authDbPool;

const initializeDatabase = async () => {
  const bootstrapConnection = await mysql.createConnection(DB_CONFIG);
  await bootstrapConnection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
  await bootstrapConnection.end();

  authDbPool = mysql.createPool({
    ...DB_CONFIG,
    database: DB_NAME,
    connectionLimit: 10,
  });

  await authDbPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log(`MySQL ready: ${DB_NAME}.users table is available.`);
};

// Create transporter using Gmail SMTP and the provided App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mailsuhas.madhu@gmail.com", // Assuming this is also the sender
    pass: "gyqf oahv mfrx rqor",
  },
});

app.post("/api/sos-email", async (req, res) => {
  const { message, location } = req.body;

  const mailOptions = {
    from: "mailsuhas.madhu@gmail.com",
    to: "mailsuhas.madhu@gmail.com", // Default recipient
    subject: "URGENT: SOS Alert Triggered from Guardian Companion!",
    text: `🚨 URGENT SOS ALERT 🚨\n\n${
      message || "The emergency SOS button was pressed by the user."
    }\nLocation: ${location || "Unknown location"}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("SOS email sent successfully.");
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const [existingRows] = await authDbPool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);

    if (existingRows.length > 0) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [insertResult] = await authDbPool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, normalizedEmail, passwordHash]
    );

    const token = randomBytes(24).toString("hex");
    return res.status(201).json({
      token,
      user: {
        id: insertResult.insertId,
        name,
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error("Signup failed:", error);
    return res.status(500).json({ error: "Unable to create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const [rows] = await authDbPool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = randomBytes(24).toString("hex");
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Unable to login." });
  }
});

const PORT = process.env.PORT || 3001;
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Guardian backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize backend:", error);
    process.exit(1);
  });
