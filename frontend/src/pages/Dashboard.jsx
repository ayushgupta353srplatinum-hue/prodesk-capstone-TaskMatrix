import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTasks(data);
  };

  // ADD TASK
  const addTask = async () => {
    if (!title) return;

    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });

    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setTitle("");
  };

  // UPDATE TASK
  const updateTask = async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });

    const updated = await res.json();

    setTasks(tasks.map(t => t._id === editingId ? updated : t));
    setEditingId(null);
    setTitle("");
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    if (!confirm("Delete this task?")) return;

    await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    setTasks(tasks.filter(t => t._id !== id));
  };

  // CHANGE STATUS
  const changeStatus = async (id, status) => {
    const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const updated = await res.json();

    setTasks(tasks.map(t => t._id === id ? updated : t));
  };

  // FILTER TASKS
  const todo = tasks.filter(t => t.status === "todo");
  const progress = tasks.filter(t => t.status === "progress");
  const done = tasks.filter(t => t.status === "done");

  // CHART DATA
  const chartData = [
    { name: "To Do", count: todo.length },
    { name: "Progress", count: progress.length },
    { name: "Done", count: done.length }
  ];

  // PAYMENT
  const handlePayment = async () => {
    const res = await fetch(`${BASE_URL}/api/payment`, { method: "POST" });
    const data = await res.json();

    const stripe = await loadStripe("pk_test_YOUR_KEY");
    await stripe.redirectToCheckout({ sessionId: data.id });
  };

  // UI CARD
  const renderColumn = (title, data) => (
    <div className="column">
      <h3>{title}</h3>

      {data.map(t => (
        <div key={t._id} className="taskCard">
          <p>{t.title}</p>

          <div className="btnGroup">
            <button onClick={() => {
              setEditingId(t._id);
              setTitle(t.title);
            }}>Edit</button>

            <button onClick={() => deleteTask(t._id)}>Delete</button>
          </div>

          <div className="btnGroup">
            {t.status !== "progress" && (
              <button onClick={() => changeStatus(t._id, "progress")}>
                Start
              </button>
            )}

            {t.status !== "done" && (
              <button onClick={() => changeStatus(t._id, "done")}>
                Done
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container">
      <div className="card bigCard">
        <h2>TaskMatrix Dashboard 🔥</h2>

        <div className="inputRow">
          <input
            placeholder="Enter Task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button onClick={editingId ? updateTask : addTask}>
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {/* TASK BOARD */}
        <div className="taskBoard">
          {renderColumn("To Do", todo)}
          {renderColumn("In Progress", progress)}
          {renderColumn("Done", done)}
        </div>

        {/* CHART */}
        <h3>Analytics 📊</h3>
        <BarChart width={400} height={250} data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>

        {/* ACTIONS */}
        <div className="bottomBtns">
          <button onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}>
            Logout
          </button>

          <button className="proBtn" onClick={handlePayment}>
            Buy Pro 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;