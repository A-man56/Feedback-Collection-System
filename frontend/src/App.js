"use client"

import { Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import AdminDashboard from "./pages/AdminDashboard"
import FormBuilder from "./pages/FormBuilder"
import FormResults from "./pages/FormResults"
import FeedbackForm from "./pages/FeedbackForm"
import ThankYou from "./pages/ThankYou"
import { useState } from "react"
import RefrshHandler from "./RefrshHandler"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState("")

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />
  }

  const AdminRoute = ({ element }) => {
    return isAuthenticated && userRole === "admin" ? element : <Navigate to="/login" />
  }

  return (
    <div className="App">
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/form/new" element={<AdminRoute element={<FormBuilder />} />} />
        <Route path="/admin/form/:formId/results" element={<AdminRoute element={<FormResults />} />} />

        {/* Public routes for anonymous feedback */}
        <Route path="/feedback/:accessCode" element={<FeedbackForm />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </div>
  )
}

export default App
