import { useEffect, useState } from "react";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ❌ agar token nahi hai → login page bhej
    if (!token) {
      window.location.href = "/";
      return;
    }

    // 🔥 YAHI STEP 2 KA CODE HAI
    fetch("http://localhost:5000/api/protected", {
      method: "GET",
      headers: {
  Authorization: `Bearer ${token}`
}
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUser("Ayush"); // abhi dummy, baad me real data lenge
      })
      .catch((err) => {
        console.log(err);
      });

  }, []);

  return (
    <div>
      <h1>Dashboard 🔐</h1>
      <p>Welcome {user}</p>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;