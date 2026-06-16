import { useEffect, useState } from "react";
import axios from "../api/axios";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");

  const fetchGroups = async () => {
    try {
      const response = await axios.get("/groups");
      setGroups(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createGroup = async () => {
    try {
      await axios.post("/groups", {
        group_name: groupName,
      });

      setGroupName("");
      fetchGroups();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Groups</h1>

      <input
        type="text"
        className="form-control"
        style={{ maxWidth: "300px", display: "inline-block", marginRight: "10px" }}
        placeholder="Enter Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />

      <button className="btn-primary" style={{ maxWidth: "150px" }} onClick={createGroup}>
        Create Group
      </button>

      <hr style={{ margin: "20px 0", borderColor: "var(--border-color)" }} />

      <h2>My Groups</h2>

      {groups.length === 0 ? (
        <p>You don't have any groups yet.</p>
      ) : (
        groups.map((group) => (
          <div key={group.id} style={{ padding: "10px", background: "var(--card-bg)", borderRadius: "8px", marginBottom: "10px", boxShadow: "var(--shadow-sm)" }}>
            {group.group_name}
          </div>
        ))
      )}
    </div>
  );
}

export default Groups;
