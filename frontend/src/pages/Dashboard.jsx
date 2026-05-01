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
    } catch {
      toast.error("Failed to fetch tasks");
    }
  };

  const addTask = async (status = "todo") => {
    if (!title) return toast.error("Please enter a task title!");
    // Level 3: Simple Frontend Validation before API call
    if (title.length < 3) return toast.error("Title kam se kam 3 characters ka hona chahiye!");

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
    } catch {
      toast.error("Server error!");
    }
  };

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
      const formatted = result.data
        .map((step, i) => `${i + 1}. ${step}`)
        .join(" ");

      setTitle(`${title} (Steps: ${formatted})`);

      toast.success("AI suggestion added 🤖");
    } else {
      toast.error("AI failed!");
    }

  } catch {
    toast.error("Backend error!");
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

    } catch { 
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

    } catch { 
      setTasks(originalTasks);
      toast.error("Server error!");
    }
  };

  const renderTaskContent = (text, isDone) => {
    const parts = text.split("(Steps:");
    const mainTitle = parts[0];
    const stepsText = parts[1];

    return (
      <div style={{ textDecoration: isDone ? "line-through" : "none" }}>
        <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px", color: "#111" }}>
          {mainTitle}
        </h4>
        {stepsText && (
          <div style={{ fontSize: "12px", color: "#555", lineHeight: "1.4" }}>
            {stepsText
              .replace(")", "")
              .split(/\d+\./)
              .map(s => s.trim())
              .filter(step => step.length > 0)
              .map((step, i) => (
                <div key={i} style={{ marginBottom: "3px", display: "flex", gap: "5px" }}>
                  <span style={{ fontWeight: "700", color: "#000", flexShrink: 0 }}>{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  const handlePayment = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.url) window.location.assign(data.url); 
    } catch { 
      toast.error("Payment error"); 
    }
  };

  return (
    <>
      <style>{`
        /* Level 3: Mobile Polish CSS */
        @media (max-width: 768px) {
          .layout { flex-direction: column !important; }
          .sidebar { width: 100% !important; height: auto !important; padding: 15px !important; }
          .board-grid { grid-template-columns: 1fr !important; padding: 10px !important; }
          .top-bar { flex-direction: column !important; align-items: stretch !important; }
          .nav-links { display: flex; gap: 15px; margin-top: 15px !important; overflow-x: auto; }
          .sidebar-bottom { margin-top: 20px; display: flex; flex-direction: row; gap: 10px; align-items: center; }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .skeleton-pulse { animation: pulse 1.5s infinite ease-in-out; }
      `}</style>

      <Toaster position="top-right" richColors />

      <div className="layout" style={{ display: 'flex', minHeight: '100vh' }}>
        <aside className="sidebar" style={{ width: '260px', background: '#000', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="logo-circle" style={{ width: '40px', height: '40px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://media.licdn.com/dms/image/v2/D4D0BAQGrdeQlSUcYkw/company-logo_400_400/company-logo_400_400/0/1698979543742?e=2147483647&v=beta&t=0j4qDuy6r1_kkUMxY9ioxNLCwU8OnkWWULJzaB6iiJw" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <h2 style={{ color: 'white', margin: 0 }}>TaskMatrix</h2>
            </div>

            <ul className="nav-links" style={{ listStyle: 'none', marginTop: '30px', padding: 0 }}>
              <li className="nav-item active" style={{ color: '#facc15', padding: '10px 0', cursor: 'pointer', fontWeight: 'bold' }}>
                Dashboard <span style={{ background: '#333', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', marginLeft: '5px' }}>{tasks.length}</span>
              </li>
              <li className="nav-item" style={{ color: '#888', padding: '10px 0', cursor: 'pointer' }}>Settings</li>
            </ul>
          </div>

          <div className="sidebar-bottom">
            <button onClick={handlePayment} style={{ background: '#facc15', color: 'black', width: '100%', padding: '12px', borderRadius: '10px', fontWeight: 'bold', border: 'none', marginBottom: '10px' }}>
              Upgrade to Pro
            </button>
            <button onClick={() => { localStorage.clear(); window.location.href = "/" }} style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              Logout
            </button>
          </div>
        </aside>

        <main className="main-content" style={{ flex: 1, background: '#f9f9f9', padding: '30px' }}>
          <div className="top-bar" style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <input 
              className="search-bar" 
              style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #ddd' }} 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Add a new task..." 
              onKeyDown={(e) => e.key === 'Enter' && addTask()} 
            />
            
            <button onClick={handleAiSuggest} disabled={isAiLoading} style={{ background: '#6366f1', color: 'white', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: isAiLoading ? 'not-allowed' : 'pointer' }}>
              {isAiLoading ? "Thinking..." : "✨ AI Suggest"}
            </button>

            <button onClick={() => addTask()} style={{ background: '#000', color: '#facc15', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              + Add Task
            </button>
          </div>

          {/* Level 3: Skeleton Loader for AI Suggestion */}
          {isAiLoading && (
            <div className="skeleton-pulse" style={{ background: '#fff', border: '2px dashed #6366f1', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', color: '#6366f1', fontWeight: '600' }}>
              🤖 AI is drafting your sub-steps...
            </div>
          )}

          <div className="board-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
            {["todo", "progress", "done"].map(status => (
              <div key={status} className="column">
                <div className="col-header" style={{ fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{status.toUpperCase()}</span>
                  <span style={{ color: '#888' }}>{tasks.filter(t => t.status === status).length}</span>
                </div>

                <div className="task-list">
                  {tasks.filter(t => t.status === status).map(t => (
                    <div key={t._id} className="task-card" style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      {renderTaskContent(t.title, status === "done")}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button onClick={() => editTask(t._id, t.title)} style={{ flex: 1, background: '#111', color: '#fff', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✎ Edit</button>
                        <button onClick={() => deleteTask(t._id)} style={{ flex: 1, background: '#fee2e2', color: '#991b1b', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>🗑 Delete</button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === status).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#bbb', fontSize: '13px', border: '1px dashed #ddd', borderRadius: '12px' }}>No tasks here</div>
                  )}
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