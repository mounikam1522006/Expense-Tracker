import React, { useState } from "react";
import LoginView from "./components/LoginView";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  return user ? <Dashboard user={user} setUser={setUser} /> : <LoginView setUser={setUser} />;
}

export default App;
