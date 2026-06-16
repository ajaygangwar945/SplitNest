const pool = require("../config/db");

const getExpenseReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.id,
        e.title,
        e.amount,
        e.currency,
        e.expense_date,
        u.name AS paid_by
      FROM expenses e
      JOIN users u
      ON e.paid_by = u.id
      ORDER BY e.expense_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

const getSettlementReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.amount,
        s.settlement_date,
        payer.name AS paid_by,
        receiver.name AS paid_to
      FROM settlements s
      JOIN users payer
      ON s.paid_by = payer.id
      JOIN users receiver
      ON s.paid_to = receiver.id
      ORDER BY s.settlement_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

const getDashboardReport = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total Groups User is in
    const groupsRes = await pool.query(
      "SELECT COUNT(*) FROM group_members WHERE user_id = $1",
      [userId]
    );

    // Total Expenses (User's share)
    const expensesRes = await pool.query(
      "SELECT COALESCE(SUM(split_amount), 0) as total FROM expense_splits WHERE user_id = $1",
      [userId]
    );

    // Unique Members across all groups the user is in
    const membersRes = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as total 
       FROM group_members 
       WHERE group_id IN (SELECT group_id FROM group_members WHERE user_id = $1)`,
      [userId]
    );

    // Outstanding Balance (Owed to User - User Owes)
    const owedToMeRes = await pool.query(
      `SELECT COALESCE(SUM(es.split_amount), 0) as total 
       FROM expenses e 
       JOIN expense_splits es ON e.id = es.expense_id 
       WHERE e.paid_by = $1 AND es.user_id != $1`,
      [userId]
    );
    const iOweRes = await pool.query(
      `SELECT COALESCE(SUM(es.split_amount), 0) as total 
       FROM expenses e 
       JOIN expense_splits es ON e.id = es.expense_id 
       WHERE e.paid_by != $1 AND es.user_id = $1`,
      [userId]
    );

    const settledByMeRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM settlements WHERE paid_by = $1`,
      [userId]
    );
    const settledToMeRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM settlements WHERE paid_to = $1`,
      [userId]
    );

    const owedToMe = Number(owedToMeRes.rows[0].total);
    const iOwe = Number(iOweRes.rows[0].total);
    const settledByMe = Number(settledByMeRes.rows[0].total); // Reduces what I owe
    const settledToMe = Number(settledToMeRes.rows[0].total); // Reduces what is owed to me

    const netOwedToMe = owedToMe - settledToMe;
    const netIOwe = iOwe - settledByMe;
    
    const outstandingBalance = netOwedToMe - netIOwe;

    res.json({
      total_groups: Number(groupsRes.rows[0].count),
      total_expenses: Number(expensesRes.rows[0].total),
      total_members: Number(membersRes.rows[0].total),
      outstanding_balance: outstandingBalance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

const groupSummary = async (req, res) => {
  const { id } = req.params;

  try {

      const groupResult = await pool.query(
          `
          SELECT group_name
          FROM groups
          WHERE id = $1
          `,
          [id]
      );

      const expenseResult = await pool.query(
          `
          SELECT
              COUNT(*) AS total_expenses,
              COALESCE(SUM(amount),0) AS total_amount
          FROM expenses
          WHERE group_id = $1
          `,
          [id]
      );

      const memberResult = await pool.query(
          `
          SELECT COUNT(*) AS members
          FROM group_members
          WHERE group_id = $1
          `,
          [id]
      );

      res.json({
          group_name: groupResult.rows[0]?.group_name,
          total_expenses: Number(expenseResult.rows[0].total_expenses),
          total_amount: expenseResult.rows[0].total_amount,
          members: Number(memberResult.rows[0].members)
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: "Error fetching group summary"
      });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const topSpenderResult = await pool.query(`
      SELECT u.name
      FROM expenses e
      JOIN users u ON e.paid_by = u.id
      GROUP BY u.id, u.name
      ORDER BY SUM(e.amount) DESC
      LIMIT 1
    `);

    const largestExpenseResult = await pool.query(`
      SELECT title, amount
      FROM expenses
      ORDER BY amount DESC
      LIMIT 1
    `);

    const mostActiveGroupResult = await pool.query(`
      SELECT g.group_name
      FROM expenses e
      JOIN groups g ON e.group_id = g.id
      GROUP BY g.id, g.group_name
      ORDER BY COUNT(e.id) DESC
      LIMIT 1
    `);

    const totalUsersResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
    `);

    res.json({
      top_spender: topSpenderResult.rows[0]?.name || null,
      largest_expense: largestExpenseResult.rows[0] ? {
        title: largestExpenseResult.rows[0].title,
        amount: Number(largestExpenseResult.rows[0].amount)
      } : null,
      most_active_group: mostActiveGroupResult.rows[0]?.group_name || null,
      total_users: Number(totalUsersResult.rows[0]?.total || 0)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching analytics"
    });
  }
};

module.exports = {
  getExpenseReport,
  getSettlementReport,
  getDashboardReport,
  groupSummary,
  getAnalytics
};