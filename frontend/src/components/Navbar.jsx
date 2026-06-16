import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>SplitNest</div>
      <div style={linkContainerStyle}>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/groups" style={linkStyle}>Groups</Link>
        <Link to="/expenses" style={linkStyle}>Expenses</Link>
        <Link to="/balances" style={linkStyle}>Balances</Link>
        <Link to="/import" style={linkStyle}>Import CSV</Link>
        <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
      </div>
    </nav>
  );
}

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 2rem",
  background: "var(--card-bg)",
  boxShadow: "var(--shadow-sm)",
  marginBottom: "20px"
};

const logoStyle = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "var(--primary-color)"
};

const linkContainerStyle = {
  display: "flex",
  gap: "20px",
  alignItems: "center"
};

const linkStyle = {
  textDecoration: "none",
  color: "var(--text-color)",
  fontWeight: "500"
};

const logoutBtnStyle = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};

export default Navbar;
