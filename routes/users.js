const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authenticateToken = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();

// GET all users
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = "SELECT user_id, username FROM users;";
    const [users] = await db.query(query, [userId]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [result] = await db.query(
      "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
      [email, username, hashedPassword]
    );
    res.status(201).json({ userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token, user_id: user.user_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
