import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

function Expenses() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    expense_date: ""
  });

  const [splittingExpenseId, setSplittingExpenseId] = useState(null);
  const [splitAmounts, setSplitAmounts] = useState({});

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchExpenses();
      fetchMembers();
      setSplittingExpenseId(null);
    } else {
      setExpenses([]);
      setMembers([]);
    }
  }, [selectedGroupId]);

  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/expenses/group/${selectedGroupId}`);
      setExpenses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/groups/${selectedGroupId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      toast.error("Please select a group first.");
      return;
    }

    try {
      await api.post("/expenses", {
        group_id: Number(selectedGroupId),
        title: newExpense.title,
        amount: Number(newExpense.amount),
        expense_date: newExpense.expense_date
      });

      setNewExpense({ title: "", amount: "", expense_date: "" });
      toast.success("Expense created!");
      fetchExpenses();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create expense.");
    }
  };

  const handleSplitChange = (userId, amount) => {
    setSplitAmounts(prev => ({
      ...prev,
      [userId]: amount
    }));
  };

  const submitSplit = async (expenseId) => {
    const splits = Object.entries(splitAmounts)
      .filter(([userId, amount]) => amount && Number(amount) > 0)
      .map(([userId, amount]) => ({
        user_id: Number(userId),
        amount: Number(amount)
      }));

    if (splits.length === 0) {
      toast.error("Please enter split amounts.");
      return;
    }

    try {
      await api.post(`/expenses/${expenseId}/split`, { splits });
      toast.success("Expense split successfully!");
      setSplittingExpenseId(null);
      setSplitAmounts({});
    } catch (error) {
      console.error(error);
      toast.error("Failed to split expense.");
    }
  };

  const splitEqually = (expenseAmount) => {
    if (members.length === 0) return;
    
    const splitValue = (expenseAmount / members.length).toFixed(2);
    const newSplits = {};
    members.forEach(member => {
      newSplits[member.id] = splitValue;
    });
    setSplitAmounts(newSplits);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Expenses</h1>

      <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "8px", marginBottom: "20px", boxShadow: "var(--shadow-sm)" }}>
        <h2>Add New Expense</h2>
        <form onSubmit={handleCreateExpense} style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "400px" }}>
          <div>
            <label>Group</label>
            <select 
              className="form-control"
              value={selectedGroupId} 
              onChange={(e) => setSelectedGroupId(e.target.value)}
              required
            >
              <option value="">Select a Group...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.group_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Title</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g., Dinner, Hotel" 
              value={newExpense.title}
              onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
              required
            />
          </div>

          <div>
            <label>Amount (₹)</label>
            <input 
              type="number" 
              className="form-control"
              placeholder="0.00" 
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              required
            />
          </div>

          <div>
            <label>Date</label>
            <input 
              type="date" 
              className="form-control"
              value={newExpense.expense_date}
              onChange={(e) => setNewExpense({...newExpense, expense_date: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Create Expense</button>
        </form>
      </div>

      {selectedGroupId && (
        <div>
          <h2>Group Expenses</h2>
          {expenses.length === 0 ? (
            <p>No expenses found for this group.</p>
          ) : (
            expenses.map(expense => (
              <div key={expense.id} style={{ background: "var(--card-bg)", padding: "15px", borderRadius: "8px", marginBottom: "15px", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{expense.title}</strong> - ₹{expense.amount}
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ maxWidth: "100px", padding: "8px" }}
                    onClick={() => {
                      setSplittingExpenseId(splittingExpenseId === expense.id ? null : expense.id);
                      setSplitAmounts({});
                    }}
                  >
                    {splittingExpenseId === expense.id ? "Cancel" : "Split"}
                  </button>
                </div>

                {splittingExpenseId === expense.id && (
                  <div style={{ marginTop: "15px", padding: "15px", borderTop: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                      <h4>Split Between Members</h4>
                      <button 
                        onClick={() => splitEqually(expense.amount)}
                        style={{ background: "transparent", border: "1px solid var(--primary)", color: "var(--primary)", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Split Equally
                      </button>
                    </div>
                    
                    {members.map(member => (
                      <div key={member.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px", gap: "10px" }}>
                        <span style={{ width: "120px" }}>{member.name}</span>
                        <input 
                          type="number"
                          className="form-control"
                          style={{ maxWidth: "150px" }}
                          placeholder="₹ Amount"
                          value={splitAmounts[member.id] || ""}
                          onChange={(e) => handleSplitChange(member.id, e.target.value)}
                        />
                      </div>
                    ))}
                    <button 
                      className="btn-primary" 
                      style={{ marginTop: "10px" }}
                      onClick={() => submitSplit(expense.id)}
                    >
                      Submit Split
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Expenses;
