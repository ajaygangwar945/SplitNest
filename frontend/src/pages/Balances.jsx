import { useEffect, useState } from "react";
import api from "../api/axios";

function Balances() {
  const [userMap, setUserMap] = useState({});
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch groups to get members
        const groupsRes = await api.get("/groups");
        const groups = groupsRes.data;

        // 2. Fetch all members across all groups to build a dictionary of IDs to Names
        const map = {};
        for (const group of groups) {
          const membersRes = await api.get(`/groups/${group.id}/members`);
          membersRes.data.forEach(member => {
            map[member.id] = member.name;
          });
        }
        
        // Get our own user ID from the JWT token so we can label ourselves "You"
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
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

        // 4. Compute Net Balances
        const netBalances = {};
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

        // 5. Convert to List
        const debtList = [];
        for (const [A, owesObj] of Object.entries(netBalances)) {
          for (const [B, amount] of Object.entries(owesObj)) {
            if (amount > 0) {
              debtList.push({
                fromId: A,
                toId: B,
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

    fetchData();
  }, []);

  if (loading) {
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
            <div key={index} style={{ padding: "15px", borderBottom: index < debts.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", fontSize: "1.1rem" }}>
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
          ))
        )}
      </div>
    </div>
  );
}

export default Balances;
