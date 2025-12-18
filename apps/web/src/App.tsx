import { Routes, Route, Navigate } from "react-router-dom";
import AuthWelcome from "./pages/auth/AuthWelcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/home/Home";
import RescueNewSelectCategory from "./pages/customer/rescue/RescueNewSelectCategory.tsx";
import RescueNewLocation from "./pages/customer/rescue/RescueNewLocation";
import RescueNewCompanies from "./pages/customer/rescue/RescueNewCompanies";
import RescueNewConfirm from "./pages/customer/rescue/RescueNewConfirm";
import RescueNewSuccess from "./pages/customer/rescue/RescueNewSuccess";




export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthWelcome />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/customer/rescue/new" element={<RescueNewSelectCategory />} />
      <Route path="/customer/rescue/new/location" element={<RescueNewLocation />} />
      <Route path="/customer/rescue/new/companies" element={<RescueNewCompanies />} />
      <Route path="/customer/rescue/new/confirm" element={<RescueNewConfirm />} />
      <Route path="/customer/rescue/new/success" element={<RescueNewSuccess />} />




    </Routes>
  );
}
