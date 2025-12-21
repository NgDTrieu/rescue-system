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
import CompanyRequestsPending from "./pages/company/CompanyRequestsPending";
import CompanyRequestDetail from "./pages/company/CompanyRequestDetail";
import CompanyRequestsInProgress from "./pages/company/CompanyRequestsInProgress";
import CompanyRequestsToday from "./pages/company/CompanyRequestsToday";
import CompanyFeedback from "./pages/company/CompanyFeedback.tsx";
import CompanyRequestsAll from "./pages/company/CompanyRequestsAll";
import CompanyUpdateProfile from "./pages/company/CompanyUpdateProfile";
import CompanyAccount from "./pages/company/CompanyAccount";
import CustomerAccount from "./pages/customer/CustomerAccount";
import CustomerRequestsAll from "./pages/customer/CustomerRequestsAll";
import CustomerRequestDetail from "./pages/customer/CustomerRequestDetail";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthWelcome />} />
      <Route path="/home" element={<Home />} />

      <Route path="/auth" element={<AuthWelcome />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/company/account" element={<CompanyAccount />} />


      <Route path="/customer/rescue/new" element={<RescueNewSelectCategory />} />
      <Route path="/customer/rescue/new/location" element={<RescueNewLocation />} />
      <Route path="/customer/rescue/new/companies" element={<RescueNewCompanies />} />
      <Route path="/customer/rescue/new/confirm" element={<RescueNewConfirm />} />
      <Route path="/customer/rescue/new/success" element={<RescueNewSuccess />} />
      <Route path="/customer/account" element={<CustomerAccount />} />
      <Route path="/customer/requests" element={<CustomerRequestsAll />} />
      <Route path="/customer/requests/:id" element={<CustomerRequestDetail />} />



      {/* COMPANY: routes tĩnh trước */}
      <Route path="/company/requests/pending" element={<CompanyRequestsPending />} />
      <Route path="/company/requests/in-progress" element={<CompanyRequestsInProgress />} />
      <Route path="/company/requests/today" element={<CompanyRequestsToday />} />
      <Route path="/company/feedback" element={<CompanyFeedback />} />
      <Route path="/company/requests" element={<CompanyRequestsAll />} />
      <Route path="/company/profile" element={<CompanyUpdateProfile />} />



      {/* COMPANY: route động để cuối */}
      <Route path="/company/requests/:id" element={<CompanyRequestDetail />} />
    </Routes>

  );
}
