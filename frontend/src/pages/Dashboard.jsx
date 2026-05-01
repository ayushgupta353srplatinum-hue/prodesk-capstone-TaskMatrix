import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { 
    if (token) fetchTasks(); 
    else window.location.href = "/";
  }, []);

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
      toast.error("Failed to fetch tasks"); 
    }
  };

  // ✅ ADD TASK (Toast version)
  const addTask = async (status = "todo") => {
    if (!title) return toast.error("Please enter a task title!");

    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title, status, priority: "medium" })
      });

      const data = await res.json();

      if (res.ok) {
        setTasks([...tasks, data]);
        setTitle("");
        toast.success("Task added ✅");
      } else {
        toast.error(data.msg || "Failed to add task");
      }
    } catch (err) {
      toast.error("Server error!");
    }
  };

  // 🤖 AI SUGGEST
  const handleAiSuggest = async () => {
    if (!title) return toast.error("Pehle title likho!");

    setIsAiLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/ai/suggest`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title })
      });

      const result = await res.json();

      if (result.success) {
        setTitle(`${title} (Steps: ${result.data})`);
        toast.success("AI suggestion added 🤖");
      } else {
        toast.error("AI failed!");
      }

    } catch (err) {
      toast.error("Backend connect nahi ho raha!");
    }

    setIsAiLoading(false);
  };

  const editTask = async (id, oldTitle) => {
    const newTitle = prompt("Enter the new title:", oldTitle);
    if (!newTitle || newTitle === oldTitle) return;

    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newTitle })
      });

      if (res.ok) {
        fetchTasks();
        toast.success("Task updated ✏️");
      } else {
        toast.error("Update failed");
      }

    } catch (err) { 
      toast.error("Edit failed"); 
    }
  };

  const deleteTask = async (id) => {
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== id));

    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        setTasks(originalTasks);
        toast.error("Delete failed ❌");
      } else {
        toast.success("Task deleted 🗑️");
      }

    } catch (err) { 
      setTasks(originalTasks);
      toast.error("Server error!");
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      if (data.url) window.location.assign(data.url); 
    } catch (err) { 
      toast.error("Payment error"); 
    }
  };

  return (
    <>
      {/* ✅ TOASTER */}
      <Toaster position="top-right" richColors />

      <div className="layout">
        <aside className="sidebar">
          <div>
            <div className="logo-container">
              <div className="logo-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://media.licdn.com/dms/image/v2/D4D0BAQGrdeQlSUcYkw/company-logo_400_400/company-logo_400_400/0/1698979543742?e=2147483647&v=beta&t=0j4qDuy6r1_kkUMxY9ioxNLCwU8OnkWWULJzaB6iiJw" alt="TaskMatrix Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <h2 style={{color: 'white'}}>TaskMatrix</h2>
            </div>

            <ul className="nav-links" style={{listStyle: 'none', marginTop: '30px'}}>
              <li className="nav-item active">
                Dashboard <span className="nav-badge">{tasks.length}</span>
              </li>
              <li className="nav-item">Settings</li>
            </ul>
          </div>

          <div className="sidebar-bottom">
            <button 
              className="pro-card-btn" 
              onClick={handlePayment} 
              style={{background: '#facc15', color: 'black', width: '100%', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px'}}
            >
              Upgrade to Pro
            </button>

            <button 
              className="logout-btn" 
              onClick={() => {localStorage.clear(); window.location.href="/"}} 
              style={{background: 'transparent', color: '#888', border: 'none', cursor: 'pointer'}}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="top-bar" style={{ display: 'flex', gap: '15px' }}>
            <input 
              className="search-bar" 
              style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #ddd' }} 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Add a new task..." 
              onKeyDown={(e) => e.key === 'Enter' && addTask()} 
            />
            
            <button 
              onClick={handleAiSuggest}
              style={{ background: '#6366f1', color: 'white', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              {isAiLoading ? "Thinking..." : "✨ AI Suggest"}
            </button>

            <button 
              onClick={() => addTask()} 
              style={{ background: '#000', color: '#facc15', border: '2px solid #facc15', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + Add Task
            </button>
          </div>

          <div className="board-grid">
            {["todo", "progress", "done"].map(status => (
              <div key={status} className="column">
                <div className="col-header" style={{ fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                  {status.toUpperCase()} ({tasks.filter(t => t.status === status).length})
                </div>

                <div className="task-list">
                  {tasks.filter(t => t.status === status).map(t => (
                    <div key={t._id} className="task-card" style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #eee' }}>
                      <div className="task-content">
                        <h4 style={{ textDecoration: status === "done" ? "line-through" : "none", marginBottom: '15px', color: '#333' }}>
                          {t.title}
                        </h4>
                      </div>

                      <div className="card-actions-row" style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          style={{ flex: 1, background: '#111', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }} 
                          onClick={() => editTask(t._id, t.title)}
                        >
                          ✎ Edit
                        </button>

                        <button 
                          style={{ flex: 1, background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }} 
                          onClick={() => deleteTask(t._id)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;