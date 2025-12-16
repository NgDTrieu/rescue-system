import { Routes, Route, Navigate } from "react-router-dom";
import AuthWelcome from "./pages/auth/AuthWelcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthWelcome />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

    </Routes>
  );
}
