import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

function ImportCsv() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      toast.error("Please select a group first.");
      return;
    }
    if (!file) {
      toast.error("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("group_id", selectedGroupId);

    setLoading(true);
    try {
      const response = await api.post("/import/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setReport(response.data);
      toast.success("CSV analyzed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze CSV.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkip = (index) => {
    const newReport = [...report];
    newReport[index].skip = !newReport[index].skip;
    setReport(newReport);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await api.post("/import/confirm", {
        group_id: Number(selectedGroupId),
        rows: report
      });
      toast.success(`Import complete! Created ${response.data.importedExpenses} expenses and ${response.data.importedSettlements} settlements.`);
      setReport(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error(error);
      toast.error("Failed to confirm import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Import Expenses from CSV</h1>
      
      {!report && (
        <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "8px", maxWidth: "500px", boxShadow: "var(--shadow-sm)" }}>
          <form onSubmit={handleAnalyze} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label>Select Group</label>
              <select 
                className="form-control"
                value={selectedGroupId} 
                onChange={(e) => setSelectedGroupId(e.target.value)}
                required
              >
                <option value="">Select a Group...</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.group_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>CSV File</label>
              <input 
                type="file" 
                accept=".csv"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
                ref={fileInputRef}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze CSV"}
            </button>
          </form>
        </div>
      )}

      {report && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2>Import Report</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
                {loading ? "Importing..." : "Confirm & Import"}
              </button>
              <button 
                onClick={() => setReport(null)} 
                style={{ padding: "10px 15px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "transparent", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
          
          <div style={{ overflowX: "auto", background: "var(--card-bg)", borderRadius: "8px", boxShadow: "var(--shadow-sm)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Date</th>
                  <th style={{ padding: "12px" }}>Description</th>
                  <th style={{ padding: "12px" }}>Amount</th>
                  <th style={{ padding: "12px" }}>Issues & Proposed Actions</th>
                  <th style={{ padding: "12px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-color)", opacity: r.skip ? 0.5 : 1 }}>
                    <td style={{ padding: "12px" }}>
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "4px", 
                        fontSize: "0.85em",
                        background: r.status === "Error" ? "#fee2e2" : r.status === "Warning" ? "#fef3c7" : "#dcfce7",
                        color: r.status === "Error" ? "#991b1b" : r.status === "Warning" ? "#92400e" : "#166534"
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>{r.original.date}<br/><small style={{ color: "var(--primary)" }}>{r.proposed.date !== r.original.date ? r.proposed.date : ""}</small></td>
                    <td style={{ padding: "12px" }}>{r.proposed.description}</td>
                    <td style={{ padding: "12px" }}>
                      ₹{r.original.amount} 
                      {r.proposed.amount !== r.original.amount && (
                        <div style={{ color: "var(--primary)", fontSize: "0.9em" }}>➔ ₹{r.proposed.amount}</div>
                      )}
                    </td>
                    <td style={{ padding: "12px", maxWidth: "300px" }}>
                      {r.issues.length === 0 ? <span style={{ color: "#6b7280" }}>Looks good</span> : (
                        <ul style={{ margin: 0, paddingLeft: "20px", color: "#b91c1c", fontSize: "0.9em" }}>
                          {r.issues.map((issue, idx) => <li key={idx}>{issue}</li>)}
                        </ul>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button 
                        onClick={() => toggleSkip(i)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "1px solid",
                          borderColor: r.skip ? "#10b981" : "#ef4444",
                          background: r.skip ? "#ecfdf5" : "#fef2f2",
                          color: r.skip ? "#047857" : "#b91c1c",
                          cursor: "pointer"
                        }}
                      >
                        {r.skip ? "Include" : "Skip"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportCsv;
