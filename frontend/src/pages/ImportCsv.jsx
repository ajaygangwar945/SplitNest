import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2, XCircle, Users, ArrowRight } from "lucide-react";

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
      if (response.data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(response.data[0].id.toString());
      }
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
    <div className="container animate-slide-up">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.5rem", background: "linear-gradient(to right, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Import from CSV
        </h1>
      </div>
      
      {!report && (
        <div className="card" style={{ padding: "32px", maxWidth: "600px", margin: "0 auto" }}>
          <form onSubmit={handleAnalyze} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>1. Select Target Group</label>
              <div style={{ position: "relative" }}>
                <Users size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <select 
                  className="form-control"
                  style={{ paddingLeft: "40px", cursor: "pointer" }}
                  value={selectedGroupId} 
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a Group...</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.group_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>2. Upload Spreadsheet</label>
              <div style={{ 
                border: "2px dashed var(--border-color)", 
                borderRadius: "16px", 
                padding: "40px 20px", 
                textAlign: "center",
                background: file ? "var(--input-focus)" : "var(--input-bg)",
                transition: "all 0.2s",
                position: "relative",
                cursor: "pointer"
              }}>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  ref={fileInputRef}
                  required
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                />
                
                {file ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--primary)" }}>
                    <FileSpreadsheet size={48} />
                    <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>{file.name}</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Click to change file</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--text-muted)" }}>
                    <UploadCloud size={48} />
                    <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>Drag & Drop or Click to Upload</span>
                    <span style={{ fontSize: "0.85rem" }}>Supports .csv exports</span>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "1rem" }}>
              {loading ? "Analyzing..." : "Analyze File"} <ArrowRight size={20} />
            </button>
          </form>
        </div>
      )}

      {report && (
        <div className="animate-fade-in" style={{ marginTop: "20px" }}>
          <div className="card" style={{ padding: "24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <FileSpreadsheet color="var(--primary)" /> Import Review
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>Please review the anomalies below before confirming.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => { setReport(null); setFile(null); }} 
                style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "white", cursor: "pointer", fontWeight: "600" }}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleConfirm} disabled={loading} style={{ margin: 0, width: "auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} /> {loading ? "Importing..." : "Confirm & Import"}
              </button>
            </div>
          </div>
          
          <div className="card" style={{ overflowX: "auto", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)", background: "var(--input-bg)" }}>
                  <th style={{ padding: "16px", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "16px", fontWeight: "600" }}>Date</th>
                  <th style={{ padding: "16px", fontWeight: "600" }}>Description</th>
                  <th style={{ padding: "16px", fontWeight: "600" }}>Amount</th>
                  <th style={{ padding: "16px", fontWeight: "600" }}>Issues Detected</th>
                  <th style={{ padding: "16px", fontWeight: "600", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-color)", opacity: r.skip ? 0.4 : 1, transition: "opacity 0.2s" }}>
                    <td style={{ padding: "16px" }}>
                      <span className={`badge badge-${r.status === "Error" ? "danger" : r.status === "Warning" ? "warning" : "success"}`} style={{ display: "flex", gap: "6px", width: "fit-content" }}>
                        {r.status === "Error" ? <XCircle size={14} /> : r.status === "Warning" ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: "500" }}>{r.original.date}</div>
                      {r.proposed.date !== r.original.date && <div style={{ color: "var(--primary)", fontSize: "0.85rem", marginTop: "4px" }}>➔ {r.proposed.date}</div>}
                    </td>
                    <td style={{ padding: "16px", fontWeight: "500" }}>{r.proposed.description}</td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: "600" }}>₹{r.original.amount}</div>
                      {r.proposed.amount !== r.original.amount && (
                        <div style={{ color: "var(--primary)", fontSize: "0.85rem", marginTop: "4px", fontWeight: "600" }}>➔ ₹{r.proposed.amount}</div>
                      )}
                    </td>
                    <td style={{ padding: "16px", maxWidth: "300px" }}>
                      {r.issues.length === 0 ? <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Looks good</span> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {r.issues.map((issue, idx) => (
                            <div key={idx} style={{ fontSize: "0.85rem", color: r.status === "Error" ? "#991b1b" : "#92400e", background: r.status === "Error" ? "#fef2f2" : "#fffbeb", padding: "4px 8px", borderRadius: "4px" }}>
                              • {issue}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <button 
                        onClick={() => toggleSkip(i)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          background: r.skip ? "var(--text-main)" : "#fee2e2",
                          color: r.skip ? "white" : "#991b1b",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {r.skip ? "Include Row" : "Skip Row"}
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
