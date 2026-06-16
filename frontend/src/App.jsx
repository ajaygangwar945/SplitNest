import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      {/* Floating Background Elements (Global) */}
      <div className="floating-shape shape-1" style={{ position: "fixed" }}>💸</div>
      <div className="floating-shape shape-2" style={{ position: "fixed" }}>🧾</div>
      <div className="floating-shape shape-3" style={{ position: "fixed" }}>💳</div>
      <div className="floating-shape shape-4" style={{ position: "fixed" }}>🤝</div>
      <div className="floating-shape shape-5" style={{ position: "fixed" }}>💰</div>
      <div className="floating-shape shape-6" style={{ position: "fixed" }}>📊</div>

      <AppRoutes />
    </>
  );
}

export default App;