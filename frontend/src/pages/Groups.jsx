import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Users, Plus, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const response = await axios.get("/groups");
      setGroups(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      await axios.post("/groups", { group_name: groupName });
      setGroupName("");
      toast.success("Group created successfully");
      fetchGroups();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="container animate-slide-up">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.5rem", background: "linear-gradient(to right, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Your Groups
        </h1>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={20} color="var(--primary)" /> Create a New Group
        </h3>
        <form onSubmit={createGroup} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-control"
            style={{ flex: "1", minWidth: "200px" }}
            placeholder="E.g., Goa Trip 2026"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "auto", margin: 0, padding: "0.75rem 1.5rem" }}>
            {loading ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>

      <div className="bento-grid">
        {groups.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", gridColumn: "1 / -1" }}>
            <Users size={48} opacity={0.5} style={{ marginBottom: "1rem" }} />
            <p>You don't have any groups yet. Create one above to get started!</p>
          </div>
        ) : (
          groups.map((group) => (
            <div 
              key={group.id} 
              className="card"
              onClick={() => navigate(`/groups/${group.id}`)}
              style={{ 
                padding: "24px", 
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                <div style={{ padding: "12px", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", color: "white", borderRadius: "12px" }}>
                  <Users size={24} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{group.group_name}</h3>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: "500" }}>
                  View Details <ChevronRight size={18} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Groups;
