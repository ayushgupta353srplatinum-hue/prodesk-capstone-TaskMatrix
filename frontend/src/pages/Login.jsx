import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Login failed ❌");
        return;
      }

      localStorage.setItem("token", data.token);
      alert("Login Success 🔥");
      window.location.href = "/dashboard";

    } catch (err) {
      console.log(err);
      alert("Server down / CORS issue ⚠️");
    }
  };

 return (
  <div className="container">
    <div className="card">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email"
          onChange={(e) => setEmail(e.target.value)} />

        <input type="password" placeholder="Password"
          onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Login</button>
      </form>

      <p className="link">
        Don't have an account?{" "}
        <span onClick={() => (window.location.href = "/register")}>
          Create Account
        </span>
      </p>
    </div>
  </div>
);
}

export default Login;