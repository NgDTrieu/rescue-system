import { Routes, Route, Navigate } from "react-router-dom";
import AuthWelcome from "./pages/auth/AuthWelcome";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthWelcome />} />

      {/* Bước sau mình sẽ thêm login/register */}
      {/* <Route path="/auth/login" element={<Login />} /> */}
      {/* <Route path="/auth/register" element={<Register />} /> */}
    </Routes>
  );
}
