"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { handleError, handleSuccess } from "../utils"
import { ToastContainer } from "react-toastify"

function AdminDashboard() {
  const [loggedInUser, setLoggedInUser] = useState("")
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"))
    fetchForms()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("loggedInUser")
    localStorage.removeItem("userRole")
    handleSuccess("User Logged out")
    setTimeout(() => {
      navigate("/login")
    }, 1000)
  }

  const fetchForms = async () => {
    try {
      setLoading(true)
      const url = "http://localhost:8080/feedback/admin/forms"
      const response = await fetch(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      const result = await response.json()
      if (result.success) {
        setForms(result.forms)
      } else {
        handleError(result.message || "Failed to fetch forms")
      }
    } catch (err) {
      handleError("Error fetching forms")
    } finally {
      setLoading(false)
    }
  }

  const toggleFormStatus = async (formId) => {
    try {
      const url = `http://localhost:8080/feedback/forms/${formId}/toggle`
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      const result = await response.json()
      if (result.success) {
        handleSuccess(result.message)
        fetchForms() // Refresh the forms list
      } else {
        handleError(result.message || "Failed to update form status")
      }
    } catch (err) {
      handleError("Error updating form status")
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    handleSuccess("Link copied to clipboard!")
  }

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Feedback Collection System</h1>
        <div className="user-controls">
          <span>Welcome, {loggedInUser}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Your Feedback Forms</h2>
          <button onClick={() => navigate("/admin/form/new")} className="create-form-btn">
            Create New Form
          </button>
        </div>

        {loading ? (
          <p>Loading forms...</p>
        ) : forms.length === 0 ? (
          <div className="no-forms">
            <p>You haven't created any feedback forms yet.</p>
            <p>Click "Create New Form" to get started!</p>
          </div>
        ) : (
          <div className="forms-list">
            {forms.map((form) => (
              <div key={form._id} className={`form-card ${!form.active ? "inactive" : ""}`}>
                <div className="form-card-header">
                  <h3>{form.title}</h3>
                  <span className={`status-badge ${form.active ? "active" : "inactive"}`}>
                    {form.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="form-description">{form.description || "No description"}</p>

                <div className="form-meta">
                  <p>Questions: {form.questions.length}</p>
                  <p>Created: {new Date(form.createdAt).toLocaleDateString()}</p>
                  <p>
                    Access Code: <strong>{form.accessCode}</strong>
                  </p>
                </div>

                <div className="form-actions">
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/feedback/${form.accessCode}`)}
                    className="copy-link-btn"
                  >
                    Copy Form Link
                  </button>
                  <button onClick={() => navigate(`/admin/form/${form._id}/results`)} className="view-results-btn">
                    View Results
                  </button>
                  <button
                    onClick={() => toggleFormStatus(form._id)}
                    className={form.active ? "deactivate-btn" : "activate-btn"}
                  >
                    {form.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

export default AdminDashboard
