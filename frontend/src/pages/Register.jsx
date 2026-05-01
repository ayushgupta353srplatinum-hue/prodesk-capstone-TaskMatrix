import { useState } from "react";
import { Toaster, toast } from "sonner";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      return toast.error("All fields required!");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.msg || "Registration failed");
      }

      toast.success("Registered Successfully 🎉");

      setTimeout(() => {
        window.location.href = "/";
      }, 1200);

    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="container">
        <div className="card">
          <h2>Register</h2>

          <form onSubmit={handleRegister}>
            <input
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
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
    </>
  );
}

export default Register;