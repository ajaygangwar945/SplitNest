const pool = require("../config/db");

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users"
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  getUsers
};