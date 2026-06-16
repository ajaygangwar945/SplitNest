import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Receipt, Calendar, Users, SplitSquareHorizontal, Plus, IndianRupee } from "lucide-react";

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
      if (response.data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(response.data[0].id.toString());
      }
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
    <div className="container animate-slide-up">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.5rem", background: "linear-gradient(to right, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Expenses
        </h1>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        
        {/* Left Column: Form */}
        <div style={{ flex: "1 1 300px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={20} color="var(--primary)" /> Add New Expense
            </h3>
            
            <form onSubmit={handleCreateExpense} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "0.9rem" }}>Group</label>
                <div style={{ position: "relative" }}>
                  <Users size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <select 
                    className="form-control"
                    style={{ paddingLeft: "40px" }}
                    value={selectedGroupId} 
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a Group...</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.group_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "0.9rem" }}>Title</label>
                <div style={{ position: "relative" }}>
                  <Receipt size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input 
                    type="text" 
                    className="form-control"
                    style={{ paddingLeft: "40px" }}
                    placeholder="e.g., Dinner at Marina" 
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "0.9rem" }}>Amount</label>
                <div style={{ position: "relative" }}>
                  <IndianRupee size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input 
                    type="number" 
                    className="form-control"
                    style={{ paddingLeft: "40px" }}
                    placeholder="0.00" 
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "0.9rem" }}>Date</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input 
                    type="date" 
                    className="form-control"
                    style={{ paddingLeft: "40px" }}
                    value={newExpense.expense_date}
                    onChange={(e) => setNewExpense({...newExpense, expense_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>Create Expense</button>
            </form>
          </div>
        </div>

        {/* Right Column: Feed */}
        <div style={{ flex: "2 1 500px" }}>
          {selectedGroupId ? (
            <>
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                <Receipt size={24} color="var(--primary)" /> Group Expenses
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {expenses.length === 0 ? (
                  <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    <Receipt size={48} opacity={0.5} style={{ marginBottom: "1rem" }} />
                    <p>No expenses found for this group. Add one to get started!</p>
                  </div>
                ) : (
                  expenses.map(expense => (
                    <div key={expense.id} className="card animate-fade-in" style={{ padding: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ padding: "12px", background: "#f1f5f9", color: "var(--text-main)", borderRadius: "12px" }}>
                            <Receipt size={24} />
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{expense.title}</h3>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                              <span style={{ fontWeight: "800", color: "var(--text-main)", fontSize: "1.1rem" }}>₹{expense.amount}</span>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Calendar size={12} /> {new Date(expense.expense_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          className="btn-primary" 
                          style={{ margin: 0, padding: "8px 16px", width: "auto", display: "flex", alignItems: "center", gap: "6px", background: splittingExpenseId === expense.id ? "var(--text-muted)" : "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", boxShadow: "none" }}
                          onClick={() => {
                            setSplittingExpenseId(splittingExpenseId === expense.id ? null : expense.id);
                            setSplitAmounts({});
                          }}
                        >
                          <SplitSquareHorizontal size={16} />
                          {splittingExpenseId === expense.id ? "Cancel Split" : "Split Expense"}
                        </button>
                      </div>

                      {/* Splitting Section */}
                      {splittingExpenseId === expense.id && (
                        <div className="animate-slide-up" style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px dashed var(--border-color)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h4 style={{ margin: 0, color: "var(--text-main)" }}>Split Between Members</h4>
                            <button 
                              onClick={() => splitEqually(expense.amount)}
                              style={{ background: "#f3e8ff", border: "none", color: "var(--primary)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
                            >
                              Split Equally
                            </button>
                          </div>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                            {members.map(member => (
                              <div key={member.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--input-bg)", padding: "10px", borderRadius: "12px" }}>
                                <div className="avatar" style={{ width: "32px", height: "32px", fontSize: "0.9rem" }}>
                                  {member.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>{member.name}</div>
                                  <div style={{ position: "relative" }}>
                                    <IndianRupee size={14} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input 
                                      type="number"
                                      className="form-control"
                                      style={{ padding: "6px 8px 6px 28px", fontSize: "0.9rem" }}
                                      placeholder="0.00"
                                      value={splitAmounts[member.id] || ""}
                                      onChange={(e) => handleSplitChange(member.id, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                            <button 
                              className="btn-primary" 
                              style={{ width: "auto", margin: 0, padding: "10px 24px" }}
                              onClick={() => submitSplit(expense.id)}
                            >
                              Confirm Split
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Users size={48} opacity={0.5} style={{ marginBottom: "1rem" }} />
              <h3>Select a group to view expenses</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Expenses;
