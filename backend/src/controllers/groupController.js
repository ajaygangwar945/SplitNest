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

module.exports = {
  createGroup,
  getGroups,
  addMember,
  removeMember
};