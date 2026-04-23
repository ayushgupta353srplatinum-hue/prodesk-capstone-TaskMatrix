import { useEffect, useState } from "react";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { 
    if (token) fetchTasks(); 
    else window.location.href = "/";
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
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title: title, 
          status: status, 
          priority: "medium" // Match with model enum
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([...tasks, data]);
        setTitle("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) { console.error("Add task error:", err); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Bhai, delete kar doon?")) return;
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== id));
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) setTasks(originalTasks);
    } catch (err) { setTasks(originalTasks); }
  };

  const moveTask = async (id, currentStatus) => {
    let nextStatus = currentStatus === "todo" ? "progress" : "done";
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchTasks();
    } catch (err) { console.error("Update error:", err); }
  };

  const handlePayment = async () => {
    const res = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div>
          <div className="logo-container">
            <div className="logo-circle"></div>
            <h2 style={{color: 'white'}}>TaskMatrix</h2>
          </div>
          <ul className="nav-links" style={{listStyle: 'none', marginTop: '30px'}}>
            <li className="nav-item active">Dashboard <span className="nav-badge">{tasks.length}</span></li>
            <li className="nav-item">Settings</li>
          </ul>
        </div>
        <div className="sidebar-bottom">
          <button className="pro-card-btn" onClick={handlePayment} style={{background: '#facc15', color: 'black', width: '100%', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px'}}>
            Upgrade to Pro 🚀
          </button>
          <button className="logout-btn" onClick={() => {localStorage.clear(); window.location.href="/"}} style={{background: 'transparent', color: '#888', border: 'none', cursor: 'pointer'}}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <input 
            className="search-bar" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Add new task..." 
            onKeyPress={(e) => e.key === 'Enter' && addTask("todo")}
          />
        </div>

        <div className="board-grid">
          {["todo", "progress", "done"].map(status => (
            <div key={status} className="column">
              <div className="col-header">{status.toUpperCase()} ({tasks.filter(t => t.status === status).length})</div>
              {tasks.filter(t => t.status === status).map(t => (
                <div key={t._id} className={`task-card ${status}-card`}>
                  <div className="task-content">
                    <h4 style={{ textDecoration: status === "done" ? "line-through" : "none" }}>{t.title}</h4>
                  </div>
                  <div className="card-actions-row">
                    {status !== "done" && (
                      <button className="pro-btn pro-btn-move" onClick={() => moveTask(t._id, t.status)}>Move →</button>
                    )}
                    <button className="pro-btn pro-btn-delete" onClick={() => deleteTask(t._id)}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;