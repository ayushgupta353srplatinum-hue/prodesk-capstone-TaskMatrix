import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { 
    if (token) { fetchTasks(); } else { window.location.href = "/"; }
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) { console.log("Fetch error", err); }
  };

  const addTask = async (status = "todo") => {
    if (!title) return alert("Bhai, task ka naam toh likho!");
    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, status, priority: "medium" })
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([...tasks, data]);
        setTitle("");
      }
    } catch (err) { console.error("Add task error:", err); }
  };

  const chartData = {
    labels: ["Todo", "Progress", "Done"],
    datasets: [{
      data: [
        tasks.filter(t => t.status === 'todo').length || 0,
        tasks.filter(t => t.status === 'progress').length || 0,
        tasks.filter(t => t.status === 'done').length || 0
      ],
      backgroundColor: ["#7c3aed", "#facc15", "#22c55e"],
      borderWidth: 0,
    }]
  };

  const handlePayment = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();

      if (data.url) {
        // Stripe ke hosted checkout page par redirect
        window.location.href = data.url;
      } else {
        alert("Bhai, backend se URL nahi aaya!");
      }
    } catch (err) { 
      alert("Payment Error: " + err.message); 
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <h2 className="logo-text">TaskMatrix</h2>
          <p className="tagline">Manage tasks like a pro</p>
        </div>
        <div className="analytics-box">
          <h4>Your Efficiency 📊</h4>
          <div className="chart-container" style={{ height: '200px' }}>
            {tasks.length > 0 ? (
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            ) : (
              <p style={{textAlign: 'center', marginTop: '20px', fontSize: '12px'}}>No tasks yet!</p>
            )}
          </div>
        </div>
        <button className="pro-card-btn" onClick={handlePayment}>
          <span>Upgrade to Pro 🚀</span>
          <small>Get advanced analytics</small>
        </button>
        <button className="logout-btn" onClick={() => {localStorage.clear(); window.location.href="/"}}>Logout</button>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <div className="input-group">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" />
            <button onClick={() => addTask("todo")}>Add Task</button>
          </div>
        </div>
        <div className="board-grid">
          {["todo", "progress", "done"].map(status => (
            <div key={status} className="board-column">
              <div className={`column-header ${status}-h`}>{status.toUpperCase()}</div>
              <div className="task-list">
                {tasks.filter(t => t.status === status).map(t => (
                  <div key={t._id} className="task-card-modern">{t.title}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;