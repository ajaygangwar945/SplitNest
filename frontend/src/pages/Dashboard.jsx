import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/reports/dashboard")
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Welcome {localStorage.getItem("username")}</h2>

      {stats && (
        <>
          <p>Total Groups: {stats.total_groups}</p>
          <p>Total Expenses: {stats.total_expenses}</p>
          <p>Total Settlements: {stats.total_settlements}</p>
        </>
      )}
    </div>
  );
}

export default Dashboard;
