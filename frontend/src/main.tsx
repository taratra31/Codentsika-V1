import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CookieProvider } from "./context/CookieContext";
import CookieConsent from "./components/cookies/CookieConsent";

import "./index.css";

import Splash from "./pages/Splash";
import Home from "./pages/Home";
import SignIn from "./pages/signin";
// import LogIn from "./pages/login";
import DashboardHome from "./pages/DashboardHome";
import Projects from "./pages/dashboard/Projects";
import MyProjects from "./pages/dashboard/MyProjects";
import APIGenerator from "./pages/dashboard/APIGenerator";
import AIAssistant from "./pages/dashboard/AIAssistant";
import BackendStudio from "./pages/dashboard/BackendStudio";
import Settings from "./pages/dashboard/Settings";
import Subscription from "./pages/dashboard/Subscription";
import Cookies from "./pages/dashboard/Cookies";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfUse from "./pages/legal/TermsOfUse";
import AdminLogin from "./pages/admin/adminLogin";
import AdminDashboard from "./pages/admin/adminDashboard";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CookieProvider>
      <BrowserRouter>
        <Routes>
          {/* Splash d'entrée */}
          <Route path="/" element={<Splash />} />
          {/* Routes publiques */}
          <Route path="/home" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/login" element={<LogIn />} /> */}
          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms" element={<TermsOfUse />} />

          {/* Routes Dashboard */}
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/projects" element={<Projects />} />
          <Route path="/dashboard/my-projects" element={<MyProjects />} />
          <Route path="/dashboard/api-generator" element={<APIGenerator />} />
          <Route path="/dashboard/ai-assistant" element={<AIAssistant />} />
          <Route path="/dashboard/backend-studio" element={<BackendStudio />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/subscription" element={<Subscription />} />
          <Route path="/dashboard/cookies" element={<Cookies />} />

          {/* Routes Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <CookieConsent />
      <Toaster position="top-right" richColors />
    </CookieProvider>
  </React.StrictMode>,
);
