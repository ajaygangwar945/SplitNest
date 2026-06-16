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

const getAllSettlements = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `
      SELECT s.*, 
             payer.name AS paid_by_name, 
             receiver.name AS paid_to_name
      FROM settlements s
      JOIN users payer ON s.paid_by = payer.id
      JOIN users receiver ON s.paid_to = receiver.id
      WHERE s.paid_by = $1 OR s.paid_to = $1
      ORDER BY s.settled_at DESC
      `,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createSettlement,
  getAllSettlements
};