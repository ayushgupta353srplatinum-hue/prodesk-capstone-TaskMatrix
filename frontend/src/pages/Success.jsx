function Success() {
  return (
    <div className="container">
      <div className="card">
        <h2>Payment Successful 🎉</h2>
        <p>You are now Pro user 🚀</p>

        <button onClick={() => (window.location.href = "/dashboard")}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Success;