import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    totalMembers: 0,
    outstandingBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch groups
        const groupsRes = await api.get("/groups");
        const groups = groupsRes.data;
        const numGroups = groups.length;

        // Fetch members across groups to count unique members
        const uniqueMembers = new Set();
        for (const group of groups) {
          const membersRes = await api.get(`/groups/${group.id}/members`);
          membersRes.data.forEach(m => uniqueMembers.add(m.id));
        }
        
        // Fetch our own user ID by decoding the JWT token
        let myId = null;
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            myId = payload.id;
          }
        } catch (e) {
          console.error("Failed to decode token", e);
        }

        // Fetch balances to calculate total expenses and outstanding balance
        const balancesRes = await api.get("/expenses/balances");
        const balances = balancesRes.data;

        let totalExp = 0;
        let owedToMe = 0;
        let iOwe = 0;

        balances.forEach(b => {
          const amount = Number(b.split_amount);
          
          if (b.user_id === myId) {
            totalExp += amount;
          }
          
          if (b.paid_by === myId && b.user_id !== myId) {
            owedToMe += amount;
          }
          if (b.user_id === myId && b.paid_by !== myId) {
            iOwe += amount;
          }
        });

        const outstandingBalance = owedToMe - iOwe;

        setStats({
          totalGroups: numGroups,
          totalMembers: uniqueMembers.size,
          totalExpenses: totalExp,
          outstandingBalance: outstandingBalance
        });

      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Welcome, {username}!</h1>
        <button className="btn-primary" style={{ backgroundColor: "red", width: "auto" }} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading your SplitNest dashboard...</p>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "20px",
          marginBottom: "40px" 
        }}>
          <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "12px", boxShadow: "var(--shadow-md)", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-color)", opacity: 0.8 }}>Total Groups</h3>
            <p style={{ fontSize: "2rem", margin: 0, fontWeight: "bold", color: "var(--primary)" }}>{stats.totalGroups}</p>
          </div>
          
          <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "12px", boxShadow: "var(--shadow-md)", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-color)", opacity: 0.8 }}>Members</h3>
            <p style={{ fontSize: "2rem", margin: 0, fontWeight: "bold", color: "var(--primary)" }}>{stats.totalMembers}</p>
          </div>

          <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "12px", boxShadow: "var(--shadow-md)", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-color)", opacity: 0.8 }}>My Total Share</h3>
            <p style={{ fontSize: "2rem", margin: 0, fontWeight: "bold", color: "var(--primary)" }}>₹{stats.totalExpenses.toFixed(2)}</p>
          </div>

          <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "12px", boxShadow: "var(--shadow-md)", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "var(--text-color)", opacity: 0.8 }}>Net Balance</h3>
            <p style={{ fontSize: "2rem", margin: 0, fontWeight: "bold", color: stats.outstandingBalance >= 0 ? "green" : "red" }}>
              {stats.outstandingBalance >= 0 ? "+" : "-"}₹{Math.abs(stats.outstandingBalance).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <h2>Quick Links</h2>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <button className="btn-primary" style={{ flex: "1 1 200px" }} onClick={() => navigate("/groups")}>Manage Groups</button>
        <button className="btn-primary" style={{ flex: "1 1 200px" }} onClick={() => navigate("/expenses")}>View Expenses</button>
        <button className="btn-primary" style={{ flex: "1 1 200px", background: "var(--secondary)" }} onClick={() => navigate("/balances")}>Settle Balances</button>
        <button className="btn-primary" style={{ flex: "1 1 200px", background: "#10b981" }} onClick={() => navigate("/import")}>Import CSV</button>
      </div>
    </div>
  );
}

export default Dashboard;