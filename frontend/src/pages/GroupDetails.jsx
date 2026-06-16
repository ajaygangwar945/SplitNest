import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [userId, setUserId] = useState("");

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

  const addMember = async () => {
    try {
      await api.post(`/groups/${groupId}/member`, {
        user_id: Number(userId),
      });

      setUserId("");
      fetchMembers();
    } catch (error) {
      console.error(error);
    }
  };

  const removeMember = async (memberId) => {
    try {
      await api.delete(`/groups/${groupId}/member/${memberId}`);
      fetchMembers();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteGroup = async () => {
    try {
      await api.delete(`/groups/${groupId}`);
      navigate("/groups");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{group ? group.group_name : "Loading..."}</h1>
        <button className="btn-primary" style={{ backgroundColor: "red", maxWidth: "150px" }} onClick={deleteGroup}>
          Delete Group
        </button>
      </div>

      <hr style={{ margin: "20px 0", borderColor: "var(--border-color)" }} />

      <h2>Members</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="number"
          className="form-control"
          style={{ maxWidth: "200px", display: "inline-block", marginRight: "10px" }}
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button className="btn-primary" style={{ maxWidth: "150px" }} onClick={addMember}>
          Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <p>No members yet.</p>
      ) : (
        members.map((member) => (
          <div key={member.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "var(--card-bg)", borderRadius: "8px", marginBottom: "10px", boxShadow: "var(--shadow-sm)" }}>
            <span>{member.name} (ID: {member.id})</span>
            <button style={{ background: "transparent", border: "none", color: "red", cursor: "pointer" }} onClick={() => removeMember(member.id)}>
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default GroupDetails;
