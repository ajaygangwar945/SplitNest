const pool = require("../config/db");

const createSettlement = async (req, res) => {
  try {

    const {
      group_id,
      paid_by,
      paid_to,
      amount
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO settlements
      (
        group_id,
        paid_by,
        paid_to,
        amount
      )
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        group_id,
        paid_by,
        paid_to,
        amount
      ]
    );

    res.status(201).json(
      result.rows[0]
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

module.exports = {
  createSettlement
};