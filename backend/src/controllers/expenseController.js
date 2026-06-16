const pool = require("../config/db");

const createExpense = async (req, res) => {
  try {

    const {
      group_id,
      title,
      amount,
      expense_date
    } = req.body;

    const paid_by = req.user.id;

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
    const { splits } = req.body;

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

    const result = await pool.query(`
      SELECT
        e.paid_by,
        es.user_id,
        es.split_amount
      FROM expenses e
      JOIN expense_splits es
      ON e.id = es.expense_id
    `);

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