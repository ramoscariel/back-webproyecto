const express = require("express");
const db = require("../config/db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

/* GET posts of the logged user, or (with the query param id) get posts 
of another user as long as the logged user is a follower*/
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query; // Extract query parameter

    if (id) {
      const query = `
    SELECT author_id, post_id, title, content, DATE(creation_time) AS creation_time FROM posts p
    INNER JOIN follows f on p.author_id = f.followed_id
    WHERE f.follower_id = ? AND f.followed_id = ?
      `;
      const queryParams = [req.user.userId, id];
      const [posts] = await db.query(query, queryParams);

      if (posts.length > 0) {
        res.json(posts);
      } else {
        res
          .status(403)
          .json({ error: "You are not authorized to see these posts or user does not have any" });
      }
    } else {
      const query =
        "SELECT author_id, post_id, title, content, DATE(creation_time) AS creation_time FROM posts WHERE author_id = ?";
      const queryParams = [req.user.userId];
      const [posts] = await db.query(query, queryParams);
      res.json(posts);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET post (if owned by logged user)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const query = "SELECT * from posts WHERE author_id = ? AND post_id = ?;";
    const queryParams = [userId, id];
    const [post] = await db.query(query, queryParams);
    if (post.length > 0) {
      res.json(post[0]);
    } else {
      res
        .status(403)
        .json({ error: "You are not authorized to see this post" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST post (if logged in)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    const query = `INSERT INTO posts (author_id, title, content) VALUES (?, ?, ?)`;
    const queryParams = [req.user.userId, title, content];
    const [result] = await db.query(query, queryParams);
    res.status(201).json({ post_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT post by id (if authorized)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; //post_id
    const { title, content } = req.body;
    const userId = req.user.userId;

    const query =
      "UPDATE posts SET title = ?, content = ? WHERE post_id = ? AND author_id = ?";
    const queryParams = [title, content, id, userId];

    const [result] = await db.query(query, queryParams);
    if (result.affectedRows === 0) {
      return res.status(403).json({
        error:
          "You are not authorized to update this post or it does not exist.",
      });
    }
    res.status(201).json({ message: "Post updated succesfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE post by id (if authorized)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; //post_id
    const userId = req.user.userId;
    const query = "DELETE FROM posts WHERE post_id = ? AND author_id = ?;";
    const queryParams = [id, userId];
    const [result] = await db.query(query, queryParams);

    if (result.affectedRows === 0) {
      return res.status(403).json({
        error:
          "You are not authorized to delete this post or it does not exist.",
      });
    }
    res.status(201).json({ message: "Post deleted succesfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
