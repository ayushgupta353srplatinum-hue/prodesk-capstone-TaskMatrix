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
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch tasks");
    }
  };

  const addTask = async (status = "todo") => {
    if (!title) return toast.error("Please enter a task title!");

    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, status, priority: "medium" }),
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      const result = await res.json();

      if (result.success) {
        setTitle(`${title} (Steps: ${result.data})`);
        toast.success("AI suggestion added 🤖");
      } else {
        toast.error("AI failed!");
      }
    } catch {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (res.ok) {
        fetchTasks();
        toast.success("Task updated ✏️");
      } else toast.error("Update failed");
    } catch {
      toast.error("Edit failed");
    }
  };

  const deleteTask = async (id) => {
    const originalTasks = [...tasks];
    setTasks(tasks.filter((t) => t._id !== id));

    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setTasks(originalTasks);
        toast.error("Delete failed ❌");
      } else toast.success("Task deleted 🗑️");
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
        <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>
          {mainTitle}
        </h4>

        {stepsText && (
          <div style={{ fontSize: "12px", color: "#555", lineHeight: "1.4" }}>
            {stepsText
              .replace(")", "")
              .split(/\d+\./)
              .map((s) => s.trim())
              .filter(Boolean)
              .map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "5px", marginBottom: "3px" }}>
                  <span style={{ fontWeight: "700" }}>{i + 1}.</span>
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
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.url) window.location.assign(data.url);
    } catch {
      toast.error("Payment error");
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="layout">
        <aside className="sidebar">
          <div>
            <div className="logo-container">
              <div className="logo-circle">
                <img
                  src="https://media.licdn.com/dms/image/v2/D4D0BAQGrdeQlSUcYkw/company-logo_400_400/company-logo_400_400/0/1698979543742?e=2147483647&v=beta&t=0j4qDuy6r1_kkUMxY9ioxNLCwU8OnkWWULJzaB6iiJw"
                  alt="TaskMatrix Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              </div>
              <h2 style={{ color: "white" }}>TaskMatrix</h2>
            </div>

            <ul className="nav-links">
              <li className="nav-item active">
                Dashboard <span className="nav-badge">{tasks.length}</span>
              </li>
              <li className="nav-item">Settings</li>
            </ul>
          </div>

          <div className="sidebar-bottom">
            <button onClick={handlePayment} style={{ background: "#facc15", width: "100%" }}>
              Upgrade to Pro
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="top-bar">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />

            <button onClick={handleAiSuggest}>
              {isAiLoading ? "Thinking..." : "✨ AI Suggest"}
            </button>

            <button onClick={() => addTask()}>+ Add Task</button>
          </div>

          <div className="board-grid">
            {["todo", "progress", "done"].map((status) => (
              <div key={status} className="column">
                <div className="col-header">
                  {status.toUpperCase()} ({tasks.filter((t) => t.status === status).length})
                </div>

                <div className="task-list">
                  {tasks
                    .filter((t) => t.status === status)
                    .map((t) => (
                      <div key={t._id} className="task-card">
                        {renderTaskContent(t.title, status === "done")}

                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                          <button onClick={() => editTask(t._id, t.title)}>✎ Edit</button>
                          <button onClick={() => deleteTask(t._id)}>🗑 Delete</button>
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