const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
      (name,email,password_hash)
      VALUES($1,$2,$3)
      RETURNING id,name,email`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User Registered",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  register
};