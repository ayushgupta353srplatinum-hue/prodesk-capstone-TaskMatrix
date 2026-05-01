import { useState } from "react";
import { Toaster, toast } from "sonner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("All fields are required!");
    }

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
        return toast.error(data.msg || "Login failed");
      }

      localStorage.setItem("token", data.token);
      toast.success("Login Success ");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);

    } catch (err) {
      toast.error("Server down / CORS issue");
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />

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
    </>
  );
}

export default Login;