import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [stats, setStats] = useState({
    total_groups: 0,
    total_expenses: 0,
    outstanding_balance: 0,
    total_members: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get("/reports/dashboard");
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px",
        marginTop: "20px"
      }}>
        <div style={cardStyle}>
          <h3>Total Groups</h3>
          <p style={statStyle}>{stats.total_groups}</p>
        </div>
        
        <div style={cardStyle}>
          <h3>Total Expenses</h3>
          <p style={statStyle}>₹{stats.total_expenses.toFixed(2)}</p>
        </div>

        <div style={cardStyle}>
          <h3>Outstanding Balance</h3>
          <p style={{ ...statStyle, color: stats.outstanding_balance > 0 ? "green" : stats.outstanding_balance < 0 ? "red" : "black" }}>
            {stats.outstanding_balance > 0 ? "+" : ""}₹{stats.outstanding_balance.toFixed(2)}
          </p>
          <small>{stats.outstanding_balance > 0 ? "(Owed to you)" : stats.outstanding_balance < 0 ? "(You owe)" : "(Settled up)"}</small>
        </div>

        <div style={cardStyle}>
          <h3>Members Network</h3>
          <p style={statStyle}>{stats.total_members}</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "var(--card-bg)",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "var(--shadow-sm)",
  textAlign: "center"
};

const statStyle = {
  fontSize: "2rem",
  fontWeight: "bold",
  margin: "10px 0 0 0",
  color: "var(--primary-color)"
};

export default Dashboard;