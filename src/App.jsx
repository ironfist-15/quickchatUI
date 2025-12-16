import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Chat from "./pages/Chat";

export default function App() {
  return (
    <div className="app-shell">
      <div className="app-shell-inner">
        <header className="app-header">
          <div className="app-title">
            <div className="app-logo">💬</div>
            <div className="app-title-text">
              <span>Quick Chat</span>
              <span>Fast, minimal WhatsApp-style chat</span>
            </div>
          </div>
        </header>
        <main className="app-main">

          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/:userId/home" element={<Home />} />
              <Route path="/:id1/history/:id2" element={<Chat />} />
            </Routes>
          </Router>
        </main>
      </div>
    </div>
  );
}