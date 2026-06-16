import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Wallet, ArrowRight, Search, CheckCircle, X, History, Receipt } from "lucide-react";

function Balances() {
  const [userMap, setUserMap] = useState({});
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const groupsRes = await api.get("/groups");
      const groups = groupsRes.data;

      const map = {};
      for (const group of groups) {
        const membersRes = await api.get(`/groups/${group.id}/members`);
        membersRes.data.forEach(member => {
          map[member.id] = member.name;
        });
      }
      
      let myId = null;
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          myId = payload.id;
          const myName = localStorage.getItem("username") || "User";
          map[payload.id] = "You (" + myName + ")";
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }

      setUserMap(map);

      const balancesRes = await api.get("/expenses/balances");
      const rawBalances = balancesRes.data;

      const settlementsRes = await api.get("/settlements");
      const settlements = settlementsRes.data;

      const netBalances = {};
      
      rawBalances.forEach(({ paid_by, user_id, split_amount }) => {
        if (paid_by === user_id) return;
        const amount = Number(split_amount);
        
        if (!netBalances[user_id]) netBalances[user_id] = {};
        if (!netBalances[user_id][paid_by]) netBalances[user_id][paid_by] = 0;
        
        if (!netBalances[paid_by]) netBalances[paid_by] = {};
        if (!netBalances[paid_by][user_id]) netBalances[paid_by][user_id] = 0;
        
        netBalances[user_id][paid_by] += amount;
        netBalances[paid_by][user_id] -= amount;
      });

      settlements.forEach(s => {
        const amount = Number(s.amount);
        const payer = s.paid_by;
        const receiver = s.paid_to;

        if (netBalances[payer] && netBalances[payer][receiver]) {
          netBalances[payer][receiver] -= amount;
        }
        if (netBalances[receiver] && netBalances[receiver][payer]) {
          netBalances[receiver][payer] += amount;
        }
      });

      const debtList = [];
      for (const [A, owesObj] of Object.entries(netBalances)) {
        for (const [B, amount] of Object.entries(owesObj)) {
          if (amount > 0.01) {
            debtList.push({
              fromId: Number(A),
              toId: Number(B),
              amount: amount
            });
          }
        }
      }

      setDebts(debtList);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [selectedDebt, setSelectedDebt] = useState(null);
  const [debtDetails, setDebtDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (debt) => {
    setSelectedDebt(debt);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/expenses/between/${debt.fromId}/${debt.toId}`);
      setDebtDetails(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSettleUp = async (debt) => {
    if (!window.confirm(`Confirm settlement of ₹${debt.amount.toFixed(2)}?`)) return;

    setSettling(true);
    try {
      await api.post("/settlements", {
        group_id: null,
        paid_by: debt.fromId,
        paid_to: debt.toId,
        amount: debt.amount
      });
      toast.success("Settled up successfully!");
      fetchData();
    } catch (error) {
      console.error("Error settling up:", error);
      toast.error("Failed to settle up");
    } finally {
      setSettling(false);
    }
  };

  if (loading && debts.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid var(--border-color)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="container animate-slide-up">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.5rem", background: "linear-gradient(to right, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Net Balances
        </h1>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: "2rem" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: 0, marginBottom: "1.5rem" }}>
          <Wallet size={24} color="var(--primary)" /> Who Owes Whom
        </h2>
        
        {debts.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <CheckCircle size={48} color="#10b981" />
            <h3 style={{ margin: 0 }}>All Settled Up!</h3>
            <p style={{ margin: 0 }}>No one owes anything right now.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {debts.map((debt, index) => (
              <div key={index} className="animate-fade-in" style={{ 
                padding: "16px", 
                background: "var(--input-bg)", 
                borderRadius: "12px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                flexWrap: "wrap",
                gap: "1rem",
                animationDelay: `${index * 0.1}s`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="avatar" style={{ background: "#fee2e2", color: "#991b1b" }}>
                      {(userMap[debt.fromId] || `U${debt.fromId}`).substring(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                      {userMap[debt.fromId] || `User ${debt.fromId}`}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 10px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>OWES</span>
                    <ArrowRight size={20} color="var(--primary)" />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="avatar" style={{ background: "#dcfce7", color: "#166534" }}>
                      {(userMap[debt.toId] || `U${debt.toId}`).substring(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                      {userMap[debt.toId] || `User ${debt.toId}`}
                    </span>
                  </div>

                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", marginLeft: "1rem" }}>
                    ₹{debt.amount.toFixed(2)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button 
                    style={{ display: "flex", alignItems: "center", gap: "6px", width: "auto", padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-color)", cursor: "pointer", background: "white", fontWeight: "500", transition: "all 0.2s" }}
                    onClick={() => handleViewDetails(debt)}
                    onMouseOver={(e) => e.currentTarget.style.background = "var(--input-focus)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "white"}
                  >
                    <Search size={16} /> Details
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px", width: "auto", padding: "8px 16px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)" }}
                    onClick={() => handleSettleUp(debt)}
                    disabled={settling}
                  >
                    <CheckCircle size={16} />
                    {settling ? "Processing..." : "Settle Up"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedDebt && (
        <div className="animate-fade-in" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card animate-slide-up" style={{ padding: "24px", width: "100%", maxWidth: "600px", maxHeight: "85vh", overflowY: "auto", position: "relative" }}>
            <button 
              onClick={() => setSelectedDebt(null)} 
              style={{ position: "absolute", top: "20px", right: "20px", background: "var(--input-bg)", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>

            <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
              <History size={24} color="var(--primary)" /> Transaction Details
            </h2>
            
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Showing raw, unsimplified transactions between <b>{userMap[selectedDebt.fromId]}</b> and <b>{userMap[selectedDebt.toId]}</b>:
            </p>
            
            {loadingDetails ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>Loading transactions...</div>
            ) : debtDetails.length === 0 ? (
              <div style={{ background: "var(--input-bg)", padding: "2rem", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)" }}>
                No direct transactions found. This debt is the result of multi-party debt simplification (e.g. A owes B, B owes C, so A owes C).
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {debtDetails.map(txn => (
                  <div key={txn.id} style={{ padding: "16px", background: "var(--input-bg)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ padding: "10px", background: "white", borderRadius: "8px", color: "var(--primary)" }}>
                        <Receipt size={20} />
                      </div>
                      <div>
                        <strong style={{ display: "block", fontSize: "1.1rem" }}>{txn.title}</strong>
                        <small style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                          {new Date(txn.expense_date).toLocaleDateString()} • Paid by {txn.paid_by_name}
                        </small>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: "800", fontSize: "1.2rem", color: "var(--text-main)" }}>₹{txn.split_amount}</span>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>Total: ₹{txn.total_amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Balances;
