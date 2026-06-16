const pool = require("../config/db");

const createGroup = async (req, res) => {
  try {

    const { group_name } = req.body;

    const result = await pool.query(
      `
      INSERT INTO groups
      (group_name, created_by)
      VALUES ($1,$2)
      RETURNING *
      `,
      [group_name, req.user.id]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const getGroups = async (req, res) => {
  try {

    const result = await pool.query(
      "SELECT * FROM groups"
    );

    res.status(200).json(
      result.rows
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const addMember = async (req, res) => {
  try {

    const { user_id } = req.body;
    const { groupId } = req.params;

    const result = await pool.query(
      `
      INSERT INTO group_members
      (group_id,user_id,joined_at)
      VALUES ($1,$2,CURRENT_DATE)
      RETURNING *
      `,
      [groupId, user_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const removeMember = async (req, res) => {
  try {

    const { groupId, userId } = req.params;

    const result = await pool.query(
      `
      UPDATE group_members
      SET left_at = CURRENT_DATE
      WHERE group_id = $1
      AND user_id = $2
      AND left_at IS NULL
      RETURNING *
      `,
      [groupId, userId]
    );

    res.status(200).json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = await pool.query(
      "SELECT id, group_name, created_by FROM groups WHERE id = $1",
      [groupId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.name 
       FROM users u 
       JOIN group_members gm ON u.id = gm.user_id 
       WHERE gm.group_id = $1 AND gm.left_at IS NULL`,
      [groupId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { group_name } = req.body;

    const result = await pool.query(
      "UPDATE groups SET group_name = $1 WHERE id = $2 RETURNING id, group_name, created_by",
      [group_name, groupId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Delete members first
    await pool.query("DELETE FROM group_members WHERE group_id = $1", [groupId]);
    
    // Attempt to delete group
    const result = await pool.query("DELETE FROM groups WHERE id = $1 RETURNING id", [groupId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === '23503') {
       return res.status(400).json({ message: "Cannot delete group. There are expenses or settlements tied to it." });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createGroup,
  getGroups,
  addMember,
  removeMember,
  getGroupById,
  getGroupMembers,
  updateGroup,
  deleteGroup
};