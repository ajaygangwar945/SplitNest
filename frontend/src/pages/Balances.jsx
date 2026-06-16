import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

function Balances() {
  const [userMap, setUserMap] = useState({});
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch groups to get members
      const groupsRes = await api.get("/groups");
      const groups = groupsRes.data;

      // 2. Fetch all members across all groups
      const map = {};
      for (const group of groups) {
        const membersRes = await api.get(`/groups/${group.id}/members`);
        membersRes.data.forEach(member => {
          map[member.id] = member.name;
        });
      }
      
      let myId = null;
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          myId = payload.id;
          const myName = localStorage.getItem("username") || "User";
          map[payload.id] = "You (" + myName + ")";
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }

      setUserMap(map);

      // 3. Fetch balances
      const balancesRes = await api.get("/expenses/balances");
      const rawBalances = balancesRes.data;

      // 4. Fetch settlements
      const settlementsRes = await api.get("/settlements");
      const settlements = settlementsRes.data;

      // 5. Compute Net Balances
      const netBalances = {};
      
      // Add up all expenses
      rawBalances.forEach(({ paid_by, user_id, split_amount }) => {
        if (paid_by === user_id) return;
        const amount = Number(split_amount);
        
        if (!netBalances[user_id]) netBalances[user_id] = {};
        if (!netBalances[user_id][paid_by]) netBalances[user_id][paid_by] = 0;
        
        if (!netBalances[paid_by]) netBalances[paid_by] = {};
        if (!netBalances[paid_by][user_id]) netBalances[paid_by][user_id] = 0;
        
        netBalances[user_id][paid_by] += amount;
        netBalances[paid_by][user_id] -= amount;
      });

      // Subtract settlements
      // If paid_by paid paid_to an amount, then paid_by's debt to paid_to decreases
      settlements.forEach(s => {
        const amount = Number(s.amount);
        const payer = s.paid_by; // user ID who paid
        const receiver = s.paid_to; // user ID who received

        if (netBalances[payer] && netBalances[payer][receiver]) {
          netBalances[payer][receiver] -= amount;
        }
        if (netBalances[receiver] && netBalances[receiver][payer]) {
          netBalances[receiver][payer] += amount;
        }
      });

      // 6. Convert to List
      const debtList = [];
      for (const [A, owesObj] of Object.entries(netBalances)) {
        for (const [B, amount] of Object.entries(owesObj)) {
          // Because of floating point math, check if amount is > 0.01
          if (amount > 0.01) {
            debtList.push({
              fromId: Number(A),
              toId: Number(B),
              amount: amount
            });
          }
        }
      }

      setDebts(debtList);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedDebt, setSelectedDebt] = useState(null);
  const [debtDetails, setDebtDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (debt) => {
    setSelectedDebt(debt);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/expenses/between/${debt.fromId}/${debt.toId}`);
      setDebtDetails(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSettleUp = async (debt) => {
    if (!window.confirm(`Confirm settlement of ₹${debt.amount.toFixed(2)}?`)) return;

    setSettling(true);
    try {
      await api.post("/settlements", {
        group_id: null, // Global settlement
        paid_by: debt.fromId,
        paid_to: debt.toId,
        amount: debt.amount
      });
      toast.success("Settled up successfully!");
      fetchData(); // Refresh balances
    } catch (error) {
      console.error("Error settling up:", error);
      toast.error("Failed to settle up");
    } finally {
      setSettling(false);
    }
  };

  if (loading && debts.length === 0) {
    return <div style={{ padding: "20px" }}>Loading balances...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Balances</h1>

      <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
        <h2>Net Balance</h2>
        
        {debts.length === 0 ? (
          <p>All settled up! No one owes anything.</p>
        ) : (
          debts.map((debt, index) => (
            <div key={index} style={{ padding: "15px", borderBottom: index < debts.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.1rem" }}>
              <div>
                <span style={{ fontWeight: "bold", color: "red", marginRight: "10px" }}>
                  {userMap[debt.fromId] || `User ${debt.fromId}`}
                </span>
                <span style={{ marginRight: "10px" }}>owes</span>
                <span style={{ fontWeight: "bold", color: "green", marginRight: "10px" }}>
                  {userMap[debt.toId] || `User ${debt.toId}`}
                </span>
                <span style={{ fontWeight: "bold" }}>
                  ₹{debt.amount.toFixed(2)}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  style={{ width: "auto", padding: "8px 16px", borderRadius: "6px", border: "1px solid var(--border-color)", cursor: "pointer", background: "transparent" }}
                  onClick={() => handleViewDetails(debt)}
                >
                  View Details
                </button>
                <button 
                  className="btn-primary" 
                  style={{ width: "auto", padding: "8px 16px", background: "#10b981" }}
                  onClick={() => handleSettleUp(debt)}
                  disabled={settling}
                >
                  {settling ? "Processing..." : "Settle Up"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedDebt && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "8px", width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "15px" }}>
              <h2>Transaction Details</h2>
              <button onClick={() => setSelectedDebt(null)} style={{ background: "transparent", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>
            
            <p>Raw transactions between <b>{userMap[selectedDebt.fromId]}</b> and <b>{userMap[selectedDebt.toId]}</b>:</p>
            
            {loadingDetails ? (
              <p>Loading transactions...</p>
            ) : debtDetails.length === 0 ? (
              <p>No direct transactions found. This debt may be the result of multi-party debt simplification.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {debtDetails.map(txn => (
                  <li key={txn.id} style={{ padding: "10px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong>{txn.title}</strong><br/>
                      <small style={{ color: "#666" }}>{new Date(txn.expense_date).toLocaleDateString()} • Paid by {txn.paid_by_name}</small>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: "bold" }}>₹{txn.split_amount}</span><br/>
                      <small>Total: ₹{txn.total_amount}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Balances;
