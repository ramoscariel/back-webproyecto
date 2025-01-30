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

//GET follow_requests of the logged user
router.get("/requests", authenticateToken, async(req, res) => {
  try{
    const userId = req.user.userId;
    const query = "SELECT * FROM follow_requests WHERE followed_id = ? OR follower_id = ?;";
    const [followRequests] = await db.query(query,[userId,userId]);
    res.json(followRequests)
  }catch (err){
    res.status(500).json({ error: err.message });
  }
})

//respond follow request: deletes follow request and if accepted, creates a follow record
router.post("/respond/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { accepted } = req.body;

    const query_delete =
      "DELETE FROM follow_requests WHERE follower_id = ? AND followed_id = ?;";
    const [result_delete] = await db.query(query_delete, [id, userId]);
    if (result_delete.affectedRows === 0) {
      return res.status(403).json({
        error: "This request does not exist",
        follower_id: id,
        followed_id: userId,
      });
    }

    if (accepted) {
      const query_accept =
        "INSERT INTO follows (follower_id, followed_id) VALUES(?, ?);";
      await db.query(query_accept, [id, userId]);
      res.status(201).json({ message: "Request accepted" });
    } else {
      res.status(201).json({ message: "Request declined" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//POST follow request (ask to follow someone)
router.post("/request/:id", authenticateToken, async (req, res) => {
    try{
        const { id } = req.params
        const userId = req.user.userId
        const query = "INSERT INTO follow_requests (follower_id, followed_id) VALUES (?, ?)"
        const [result] = await db.query(query,[userId, id])
        res.status(201).json({ message: "Request created succesfully" });
    }catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
