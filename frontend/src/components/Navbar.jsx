import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Receipt, Wallet, Upload, LogOut, Menu, X } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Groups", path: "/groups", icon: <Users size={20} /> },
    { name: "Expenses", path: "/expenses", icon: <Receipt size={20} /> },
    { name: "Balances", path: "/balances", icon: <Wallet size={20} /> },
    { name: "Import", path: "/import", icon: <Upload size={20} /> }
  ];

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1rem 2rem",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "2rem"
      }}>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)", display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/favicon.png" alt="SplitNest Logo" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
          SplitNest
        </div>
        
        {/* Desktop Links */}
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }} className="hide-on-mobile">
          {navLinks.map(link => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                style={{ 
                  textDecoration: "none", 
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: isActive ? "600" : "500",
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "8px",
                  background: isActive ? "var(--input-focus)" : "transparent",
                  transition: "all 0.2s"
                }}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
          <button onClick={handleLogout} style={{
            background: "#fee2e2", color: "#991b1b", border: "none",
            padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
            fontWeight: "600", display: "flex", alignItems: "center", gap: "6px",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#fca5a5"}
          onMouseOut={(e) => e.currentTarget.style.background = "#fee2e2"}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <div style={{ display: "none" }} className="mobile-toggle">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: "transparent", border: "none", color: "var(--text-main)", cursor: "pointer" }}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed", top: "70px", left: 0, width: "100%", height: "calc(100vh - 70px)",
          background: "var(--card-bg)", backdropFilter: "blur(20px)",
          zIndex: 40, display: "flex", flexDirection: "column", padding: "2rem",
          animation: "slideUp 0.3s ease-out"
        }}>
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                textDecoration: "none", color: "var(--text-main)", fontSize: "1.2rem",
                padding: "1rem 0", borderBottom: "1px solid var(--border-color)",
                display: "flex", alignItems: "center", gap: "15px"
              }}
            >
              {link.icon} {link.name}
            </Link>
          ))}
          <button onClick={handleLogout} style={{
            background: "#fee2e2", color: "#991b1b", border: "none",
            padding: "1rem", borderRadius: "8px", cursor: "pointer",
            fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            marginTop: "2rem", fontSize: "1.1rem"
          }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      )}

      {/* Inject mobile toggle CSS */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </>
  );
}

export default Navbar;
