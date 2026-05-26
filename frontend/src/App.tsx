import { useEffect, useState } from "react";
import "./App.css";

interface User {
  id: number;
  name: string;
  role: string;
}

function App() {
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      });

    fetch("http://127.0.0.1:8000/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
        React + FastAPI
      </h1>

      <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
        {message}
      </p>

      {loading ? (
        <h2>Loading...</h2>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "16px",
              }}
            >
              <h2>{user.name}</h2>
              <p>{user.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;