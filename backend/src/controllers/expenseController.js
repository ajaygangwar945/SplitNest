const pool = require("../config/db");

const createExpense = async (req, res) => {
  try {

    const {
      group_id,
      title,
      amount,
      expense_date
    } = req.body || {};

    const paid_by = req.user.id;

    // Verify user is a member of the group
    if (group_id) {
      const memberCheck = await pool.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [group_id, paid_by]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ message: "Access denied. You are not a member of this group." });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO expenses
      (
        group_id,
        title,
        amount,
        paid_by,
        expense_date
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        group_id,
        title,
        amount,
        paid_by,
        expense_date
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const splitExpense = async (req, res) => {
  try {

    const { expenseId } = req.params;
    const { splits } = req.body || {};
    const userId = req.user.id;

    if (!splits || !Array.isArray(splits)) {
      return res.status(400).json({ message: "Invalid or missing splits data" });
    }

    // Verify user is a member of the group this expense belongs to
    const expenseQuery = await pool.query(`SELECT group_id FROM expenses WHERE id = $1`, [expenseId]);
    if (expenseQuery.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }
    const groupId = expenseQuery.rows[0].group_id;

    if (groupId) {
      const memberCheck = await pool.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ message: "Access denied. You are not a member of this group." });
      }
    }

    for (const split of splits) {

      await pool.query(
        `
        INSERT INTO expense_splits
        (
          expense_id,
          user_id,
          split_amount
        )
        VALUES ($1,$2,$3)
        `,
        [
          expenseId,
          split.user_id,
          split.amount
        ]
      );
    }

    res.status(201).json({
      message: "Expense Split Added"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const getBalances = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT
        e.paid_by,
        es.user_id,
        es.split_amount
      FROM expenses e
      JOIN expense_splits es
      ON e.id = es.expense_id
      WHERE e.group_id IN (
        SELECT group_id FROM group_members WHERE user_id = $1
      )
    `, [userId]);

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Verify user is a member of the group
    const memberCheck = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied. You are not a member of this group." });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM expenses
      WHERE group_id = $1
      ORDER BY id DESC
      `,
      [groupId]
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
  createExpense,
  splitExpense,
  getBalances,
  getGroupExpenses
};