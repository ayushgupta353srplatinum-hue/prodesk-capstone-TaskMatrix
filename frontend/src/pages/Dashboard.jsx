import { useEffect, useState } from "react";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_URL;

  // Initial Load: Database se tasks lana
  useEffect(() => { 
    if (token) {
      fetchTasks(); 
    } else {
      window.location.href = "/";
    }
  }, []);

  // GET: Database se data fetch karna
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.log("Fetch error", err); 
    }
  };

  // POST: Naya Task Add karna
  const addTask = async (status = "todo") => {
    if (!title) return alert("Bhai, task ka naam toh likho!");
    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title, status, priority: "Medium" })
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([...tasks, data]); // State update (Milestone 2)
        setTitle("");
      }
    } catch (err) {
      console.error("Add task error:", err);
    }
  };

  // DELETE: Database se task hatana (Milestone 1 & 2)
  const deleteTask = async (id) => {
    if (!window.confirm("Bhai, pakka delete kar doon?")) return;

    // Instant UI se hatana (No reload)
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== id));

    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setTasks(originalTasks); // Error aaye toh wapas lao
        alert("Delete fail ho gaya!");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setTasks(originalTasks);
    }
  };

  // PUT: Task ka status change karna (Edit/Move functionality)
  const moveTask = async (id, currentStatus) => {
    let nextStatus = "";
    if (currentStatus === "todo") nextStatus = "progress";
    else if (currentStatus === "progress") nextStatus = "done";
    else return; // Done hai toh kahin nahi jayega

    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: nextStatus })
      });
      
      if (res.ok) {
        fetchTasks(); // Database update hone ke baad fresh data lao
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Payment Integration (Milestone 3)
  const handlePayment = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Backend se URL nahi aaya!");
      }
    } catch (err) { 
      alert("Payment Error: " + err.message); 
    }
  };

  return (
    <div className="layout">
      {/* SIDEBAR: Figma Style (Black) */}
      <aside className="sidebar">
        <div>
          <div className="logo-container">
            <div className="logo-circle"></div>
            <h2 className="logo-text" style={{color: 'white'}}>TaskMatrix</h2>
          </div>
          <ul className="nav-links" style={{listStyle: 'none', marginTop: '30px'}}>
            <li className="nav-item active">Dashboard <span className="nav-badge">{tasks.length}</span></li>
            <li className="nav-item">Team <span className="nav-badge">2</span></li>
            <li className="nav-item">Projects</li>
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

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="top-bar">
          <div className="input-group" style={{width: '100%', display: 'flex', gap: '10px'}}>
            <input 
              style={{flex: 1, padding: '12px', borderRadius: '30px', border: '1px solid #eee', background: '#f9fafb'}}
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What needs to be done? (Press Enter)" 
              onKeyPress={(e) => e.key === 'Enter' && addTask("todo")}
            />
            <button onClick={() => addTask("todo")} style={{background: '#7c3aed', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '30px', fontWeight: '600'}}>Add Task</button>
          </div>
        </div>

        <div className="board-grid">
          {/* TO DO COLUMN */}
          <div className="column">
            <div className="col-header">To Do ({tasks.filter(t => t.status === 'todo').length})</div>
            <div className="task-list">
              {tasks.filter(t => t.status === 'todo').map(t => (
                <div key={t._id} className="task-card todo-card">
                  <div className="task-content">
                    <h4>{t.title}</h4>
                  </div>
                  <div className="card-actions-row">
                    <button className="pro-btn pro-btn-move" title="Move to Progress" onClick={() => moveTask(t._id, t.status)}>Move →</button>
                    <button className="pro-btn pro-btn-delete" title="Delete Task" onClick={() => deleteTask(t._id)}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div className="column">
            <div className="col-header">In Progress ({tasks.filter(t => t.status === 'progress').length})</div>
            <div className="task-list">
              {tasks.filter(t => t.status === 'progress').map(t => (
                <div key={t._id} className="task-card progress-card">
                  <div className="task-content">
                    <h4>{t.title}</h4>
                  </div>
                  <div className="card-actions-row">
                    <button className="pro-btn pro-btn-move" title="Move to Done" onClick={() => moveTask(t._id, t.status)}>Done →</button>
                    <button className="pro-btn pro-btn-delete" title="Delete Task" onClick={() => deleteTask(t._id)}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DONE COLUMN */}
          <div className="column">
            <div className="col-header">Completed ({tasks.filter(t => t.status === 'done').length})</div>
            <div className="task-list">
              {tasks.filter(t => t.status === 'done').map(t => (
                <div key={t._id} className="task-card done-card">
                  <div className="task-content">
                    <h4 style={{textDecoration: 'line-through', color: '#888'}}>{t.title}</h4>
                  </div>
                  <div className="card-actions-row">
                    <button className="pro-btn pro-btn-delete" title="Delete Task" onClick={() => deleteTask(t._id)}>🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;