import { useNavigate } from "react-router-dom";

function Dashboard() {
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome {username || "User"} 👋</h1>

      <hr />

      <div>
        <h3>Total Groups: 0</h3>
        <h3>Total Expenses: ₹0</h3>
        <h3>You Owe: ₹0</h3>
        <h3>You Are Owed: ₹0</h3>
      </div>

      <hr />

      <button className="btn-primary" style={{ maxWidth: "150px" }} onClick={() => navigate("/groups")}>Groups</button>
    </div>
  );
}

export default Dashboard;