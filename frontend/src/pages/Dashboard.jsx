import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) { console.log("Fetch error", err); }
  };

  const addTask = async (status = "todo") => {
    if (!title) return alert("Bhai, task ka naam toh likho!");
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, status, priority: "medium" })
    });
    const data = await res.json();
    setTasks([...tasks, data]);
    setTitle("");
  };

  const chartData = {
    labels: ["Todo", "Progress", "Done"],
    datasets: [{
      data: [
        tasks.filter(t => t.status === 'todo').length,
        tasks.filter(t => t.status === 'progress').length,
        tasks.filter(t => t.status === 'done').length
      ],
      backgroundColor: ["#7c3aed", "#facc15", "#22c55e"],
      borderWidth: 0,
    }]
  };

  const handlePayment = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, { method: "POST" });
      const data = await res.json();
      const stripe = await loadStripe("pk_test_XXXXXXXXXXXX"); // Apni Key dalo yahan
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) { alert("Payment Error: " + err.message); }
  };

  return (
    <div className="layout">
      {/* 1/3 SIDEBAR - AS PER FIGMA */}
      <aside className="sidebar">
        <div className="brand">
          <h2 className="logo-text">TaskMatrix</h2>
          <p className="tagline">Manage tasks like a pro</p>
        </div>

        <div className="analytics-box">
          <h4>Your Efficiency 📊</h4>
          <div className="chart-container">
            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <button className="pro-card-btn" onClick={handlePayment}>
          <span>Upgrade to Pro 🚀</span>
          <small>Get advanced analytics</small>
        </button>
        
        <button className="logout-btn" onClick={() => {localStorage.clear(); window.location.href="/"}}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <div className="top-bar">
          <div className="input-group">
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What needs to be done?" 
            />
            <button onClick={() => addTask("todo")}>Add Task</button>
          </div>
        </div>

        <div className="board-grid">
          {/* TO DO */}
          <div className="board-column">
            <div className="column-header todo-h">To Do</div>
            <div className="task-list">
              {tasks.filter(t => t.status === 'todo').map(t => (
                <div key={t._id} className="task-card-modern">{t.title}</div>
              ))}
            </div>
          </div>

          {/* PROGRESS */}
          <div className="board-column">
            <div className="column-header progress-h">In Progress</div>
            <div className="task-list">
              {tasks.filter(t => t.status === 'progress').map(t => (
                <div key={t._id} className="task-card-modern">{t.title}</div>
              ))}
            </div>
          </div>

          {/* DONE */}
          <div className="board-column">
            <div className="column-header done-h">Done</div>
            <div className="task-list">
              {tasks.filter(t => t.status === 'done').map(t => (
                <div key={t._id} className="task-card-modern">{t.title}</div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;