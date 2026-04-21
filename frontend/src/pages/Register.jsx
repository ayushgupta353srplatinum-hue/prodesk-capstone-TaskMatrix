import { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (data.msg) {
        alert("Registered Successfully 🔥");
        window.location.href = "/";
      } else {
        alert(data.msg || "Registration failed");
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

 return (
  <div className="container">
    <div className="card">
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <input
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>

      <p className="link">
        Already have an account?{" "}
        <span onClick={() => (window.location.href = "/")}>
          Login
        </span>
      </p>
    </div>
  </div>
);
}

export default Register;