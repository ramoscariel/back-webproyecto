const express = require("express");
const db = require("../config/db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

//GET follows of the logged user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const query =
      "SELECT * FROM follows WHERE follower_id = ? OR followed_id = ?;";
    const [follows] = await db.query(query, [userId, userId]);
    res.json(follows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//respond follow request: deletes follow request and if accepted, creates a follow record
router.post("/respond", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { follower_id, accepted } = req.body;

    const query_delete =
      "DELETE FROM follow_requests WHERE follower_id = ? AND followed_id = ?;";
    const [result_delete] = await db.query(query_delete, [follower_id, userId]);
    if (result_delete.affectedRows === 0) {
      return res.status(403).json({
        error: "This request does not exist",
      });
    }

    if (accepted) {
      const query_accept =
        "INSERT INTO follows (follower_id, followed_id) VALUES(?, ?);";
      const [result] = await db.query(query_accept, [follower_id, userId]);
      res.status(201).json({ message: "Request accepted" });
    } else {
      res.status(201).json({ message: "Request declined" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//POST follow request (ask to follow someone)
router.post("/respond", authenticateToken, async (req, res) => {
    
});

module.exports = router;
