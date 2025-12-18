import { Routes, Route, Navigate } from "react-router-dom";
import AuthWelcome from "./pages/auth/AuthWelcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/home/Home";
import RescueNewSelectCategory from "./pages/customer/rescue/RescueNewSelectCategory.tsx";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthWelcome />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/customer/rescue/new" element={<RescueNewSelectCategory />} />



    </Routes>
  );
}
