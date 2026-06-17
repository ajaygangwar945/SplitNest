import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Users, Trash2, UserPlus, UserMinus, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGroup = async () => {
    try {
      const response = await api.get(`/groups/${groupId}`);
      setGroup(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      setMembers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchMembers();
  }, [groupId]);

  const addMember = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      await api.post(`/groups/${groupId}/member`, {
        user_id: Number(userId),
      });
      setUserId("");
      toast.success("Member added");
      fetchMembers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId) => {
    try {
      await api.delete(`/groups/${groupId}/member/${memberId}`);
      toast.success("Member removed");
      fetchMembers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove member");
    }
  };

  const deleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await api.delete(`/groups/${groupId}`);
      toast.success("Group deleted");
      navigate("/groups");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete group");
    }
  };

  return (
    <div className="container animate-slide-up">
      <button onClick={() => navigate("/groups")} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", marginBottom: "1rem", fontSize: "1rem", padding: 0 }}>
        <ChevronLeft size={20} /> Back to Groups
      </button>

      <div className="card" style={{ padding: "24px", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="group-header-icon">
            <Users />
          </div>
          <div>
            <h1 className="group-header-title">{group ? group.group_name : "Loading..."}</h1>
            <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>{members.length} members</p>
          </div>
        </div>
        <button className="btn-primary" style={{ background: "#fee2e2", color: "#991b1b", width: "auto", margin: 0, padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "8px", boxShadow: "none" }} onClick={deleteGroup}>
          <Trash2 size={18} /> Delete Group
        </button>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <UserPlus size={20} color="var(--primary)" /> Add a Member
        </h3>
        <form onSubmit={addMember} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="number"
            className="form-control"
            style={{ flex: "1", minWidth: "200px" }}
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "auto", margin: 0, padding: "0.75rem 1.5rem" }}>
            {loading ? "Adding..." : "Add Member"}
          </button>
        </form>
      </div>

      <h2 style={{ marginBottom: "1rem" }}>Group Members</h2>
      <div className="bento-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {members.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", gridColumn: "1 / -1" }}>
            <Users size={48} opacity={0.5} style={{ marginBottom: "1rem" }} />
            <p>No members yet.</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="card" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="avatar">
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{member.name}</h4>
                  <small style={{ color: "var(--text-muted)" }}>ID: {member.id}</small>
                </div>
              </div>
              <button style={{ background: "#fee2e2", border: "none", color: "#991b1b", padding: "8px", borderRadius: "8px", cursor: "pointer", display: "flex" }} onClick={() => removeMember(member.id)} title="Remove Member">
                <UserMinus size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GroupDetails;
