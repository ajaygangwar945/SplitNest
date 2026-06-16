import { useEffect, useState } from "react";
import api from "../api/axios";
import { Users, Receipt, Wallet, Network } from "lucide-react";

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

  if (loading) return (
    <div className="container animate-fade-in" style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div style={{ width: "40px", height: "40px", border: "4px solid var(--border-color)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="container animate-slide-up">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
        <h1 className="page-title">
          Welcome back
        </h1>
      </div>
      
      <div className="bento-grid">
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)" }}>
            <div style={{ padding: "10px", background: "#f3e8ff", color: "#9333ea", borderRadius: "12px" }}>
              <Users size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Total Groups</h3>
          </div>
          <p className="stat-value">{stats.total_groups}</p>
        </div>
        
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)" }}>
            <div style={{ padding: "10px", background: "#dcfce7", color: "#16a34a", borderRadius: "12px" }}>
              <Receipt size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Total Expenses</h3>
          </div>
          <p className="stat-value">₹{stats.total_expenses.toFixed(2)}</p>
        </div>

        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", background: stats.outstanding_balance > 0 ? "#f0fdf4" : stats.outstanding_balance < 0 ? "#fef2f2" : "var(--card-bg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)" }}>
            <div style={{ padding: "10px", background: stats.outstanding_balance > 0 ? "#bbf7d0" : stats.outstanding_balance < 0 ? "#fecaca" : "#f1f5f9", color: stats.outstanding_balance > 0 ? "#166534" : stats.outstanding_balance < 0 ? "#991b1b" : "#475569", borderRadius: "12px" }}>
              <Wallet size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Net Balance</h3>
          </div>
          <div>
            <p className="stat-value" style={{ color: stats.outstanding_balance > 0 ? "#16a34a" : stats.outstanding_balance < 0 ? "#dc2626" : "inherit" }}>
              {stats.outstanding_balance > 0 ? "+" : ""}₹{stats.outstanding_balance.toFixed(2)}
            </p>
            <span className={`badge ${stats.outstanding_balance > 0 ? "badge-success" : stats.outstanding_balance < 0 ? "badge-danger" : ""}`} style={{ marginTop: "8px" }}>
              {stats.outstanding_balance > 0 ? "Owed to you" : stats.outstanding_balance < 0 ? "You owe" : "All settled up"}
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)" }}>
            <div style={{ padding: "10px", background: "#e0f2fe", color: "#0284c7", borderRadius: "12px" }}>
              <Network size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Network</h3>
          </div>
          <p className="stat-value">{stats.total_members} <span style={{ fontSize: "1rem", fontWeight: "500", color: "var(--text-muted)" }}>people</span></p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;