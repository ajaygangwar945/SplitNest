const pool = require("../config/db");

const calculateBalances = async (req, res) => {
  try {

    const splits = await pool.query(`
      SELECT
        e.paid_by,
        es.user_id,
        es.split_amount
      FROM expense_splits es
      JOIN expenses e
      ON es.expense_id = e.id
    `);

    const balances = {};

    splits.rows.forEach(row => {

      const payer = row.paid_by;
      const user = row.user_id;
      const amount = Number(row.split_amount);

      if (!balances[payer]) balances[payer] = 0;
      if (!balances[user]) balances[user] = 0;

      balances[payer] += amount;
      balances[user] -= amount;
    });

    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([user, amount]) => {

      if (amount < 0) {
        debtors.push({
          user_id: Number(user),
          amount: Math.abs(amount)
        });
      }

      if (amount > 0) {
        creditors.push({
          user_id: Number(user),
          amount
        });
      }

    });

    const settlements = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {

      const debt = debtors[i];
      const credit = creditors[j];

      const amount = Math.min(
        debt.amount,
        credit.amount
      );

      settlements.push({
        from: debt.user_id,
        to: credit.user_id,
        amount
      });

      debt.amount -= amount;
      credit.amount -= amount;

      if (debt.amount === 0) i++;
      if (credit.amount === 0) j++;
    }

    res.json({
      balances,
      settlements
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error calculating balances"
    });
  }
};

module.exports = {
  calculateBalances
};