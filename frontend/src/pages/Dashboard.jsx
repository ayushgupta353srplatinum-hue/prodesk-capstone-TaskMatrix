import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

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
    if (!title) return alert("Bhai, title toh likho!");
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, status, priority: "medium" })
    });
    const data = await res.json();
    setTasks([...tasks, data]);
    setTitle("");
  };

  const handlePayment = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.msg || "Backend error");
      
      // Yahan apni wahi "pk_test_..." wali key daalna jo Stripe dashboard par hai
      const stripe = await loadStripe("pk_test_XXXXXXXXX_YOUR_KEY"); 
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error(err);
      alert("Payment Error: " + err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
        <h1>TaskMatrix</h1>
        <button className="pro-btn" onClick={handlePayment} style={{ background: 'black', color: 'white', borderRadius: '20px', padding: '10px 20px' }}>
          Upgrade to Pro 🚀
        </button>
      </header>

      <div className="task-input-bar" style={{ display: 'flex', gap: '10px', margin: '20px' }}>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Type your task here..." 
          style={{ flex: 1, padding: '10px', borderRadius: '8px' }}
        />
        <button className="add-task-main-btn" onClick={() => addTask("todo")} style={{ background: '#7c3aed', color: 'white', padding: '10px 20px', borderRadius: '8px' }}>
          Add Task
        </button>
      </div>

      <div className="board" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '20px' }}>
        {/* TO DO COLUMN */}
        <div className="column todo-col" style={{ background: '#7c3aed', padding: '15px', borderRadius: '15px', color: 'white' }}>
          <h3>To Do ({tasks.filter(t => t.status === 'todo').length})</h3>
          {tasks.filter(t => t.status === 'todo').map(t => (
            <div key={t._id} className="task-card" style={{ background: 'white', color: 'black', margin: '10px 0', padding: '10px', borderRadius: '8px' }}>
              <p>{t.title}</p>
            </div>
          ))}
        </div>

        {/* IN PROGRESS */}
        <div className="column progress-col" style={{ background: '#facc15', padding: '15px', borderRadius: '15px' }}>
          <h3>In Progress ({tasks.filter(t => t.status === 'progress').length})</h3>
          {tasks.filter(t => t.status === 'progress').map(t => (
            <div key={t._id} className="task-card" style={{ background: 'white', margin: '10px 0', padding: '10px', borderRadius: '8px' }}>
              <p>{t.title}</p>
            </div>
          ))}
        </div>

        {/* DONE */}
        <div className="column done-col" style={{ background: '#22c55e', padding: '15px', borderRadius: '15px', color: 'white' }}>
          <h3>Completed ({tasks.filter(t => t.status === 'done').length})</h3>
          {tasks.filter(t => t.status === 'done').map(t => (
            <div key={t._id} className="task-card" style={{ background: 'white', color: 'black', margin: '10px 0', padding: '10px', borderRadius: '8px' }}>
              <p>{t.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;