const pool = require("../config/db");

const getDashboard = async (req, res) => {
  try {

    const totalUsers = await pool.query(
      "SELECT COUNT(*) FROM users"
    );

    const totalGroups = await pool.query(
      "SELECT COUNT(*) FROM groups"
    );

    const totalExpenses = await pool.query(
      "SELECT COUNT(*) FROM expenses"
    );

    const totalSettlements = await pool.query(
      "SELECT COUNT(*) FROM settlements"
    );

    const totalExpenseAmount = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM expenses"
    );

    const totalSettlementAmount = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM settlements"
    );

    res.json({
      total_users: parseInt(totalUsers.rows[0].count),
      total_groups: parseInt(totalGroups.rows[0].count),
      total_expenses: parseInt(totalExpenses.rows[0].count),
      total_settlements: parseInt(totalSettlements.rows[0].count),
      total_expense_amount: totalExpenseAmount.rows[0].total,
      total_settlement_amount: totalSettlementAmount.rows[0].total
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

    const expenses = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM expenses"
    );

    const settlements = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM settlements"
    );

    const totalExpense =
      parseFloat(expenses.rows[0].total);

    const totalSettled =
      parseFloat(settlements.rows[0].total);

    const pendingBalance =
      totalExpense - totalSettled;

    res.json({
      total_expense: totalExpense,
      total_settled: totalSettled,
      pending_balance: pendingBalance
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

module.exports = {
  getDashboard,
  getBalances
};