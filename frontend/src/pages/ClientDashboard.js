"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { handleError, handleSuccess } from "../utils"
import { ToastContainer } from "react-toastify"

function ClientDashboard() {
  const [loggedInUser, setLoggedInUser] = useState("")
  const [forms, setForms] = useState([])
  const [selectedForm, setSelectedForm] = useState(null)
  const [responses, setResponses] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"))
    fetchForms()
  }, [])

  const handleLogout = (e) => {
    localStorage.removeItem("token")
    localStorage.removeItem("loggedInUser")
    localStorage.removeItem("userRole")
    handleSuccess("User Loggedout")
    setTimeout(() => {
      navigate("/login")
    }, 1000)
  }

  const fetchForms = async () => {
    try {
      const url = "http://localhost:8080/feedback/forms"
      const response = await fetch(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      const result = await response.json()
      if (result.success) {
        setForms(result.forms)
      }
    } catch (err) {
      handleError(err)
    }
  }

  const handleResponseChange = (questionIndex, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: value,
    }))
  }

  const submitFeedback = async (e) => {
    e.preventDefault()
    const formattedResponses = selectedForm.questions.map((question, index) => ({
      question: question.question,
      answer: responses[index] || "",
    }))

    try {
      const url = "http://localhost:8080/feedback/submit"
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          formId: selectedForm._id,
          responses: formattedResponses,
        }),
      })
      const result = await response.json()
      if (result.success) {
        handleSuccess("Feedback submitted successfully")
        setSelectedForm(null)
        setResponses({})
      } else {
        handleError(result.message)
      }
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Client Dashboard - Welcome {loggedInUser}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {!selectedForm ? (
        <div>
          <h2>Available Feedback Forms</h2>
          {forms.length === 0 ? (
            <p>No feedback forms available.</p>
          ) : (
            forms.map((form) => (
              <div key={form._id} style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0" }}>
                <h3>{form.title}</h3>
                <p>Created by: {form.createdBy?.name}</p>
                <p>Questions: {form.questions.length}</p>
                <button onClick={() => setSelectedForm(form)}>Fill Form</button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="container" style={{ maxWidth: "600px" }}>
          <h2>{selectedForm.title}</h2>
          <form onSubmit={submitFeedback}>
            {selectedForm.questions.map((question, index) => (
              <div key={index}>
                <label>{question.question}</label>
                {question.type === "text" ? (
                  <input
                    type="text"
                    value={responses[index] || ""}
                    onChange={(e) => handleResponseChange(index, e.target.value)}
                    placeholder="Your answer..."
                    required
                  />
                ) : question.type === "rating" ? (
                  <select
                    value={responses[index] || ""}
                    onChange={(e) => handleResponseChange(index, e.target.value)}
                    required
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                ) : null}
              </div>
            ))}
            <button type="submit">Submit Feedback</button>
            <button type="button" onClick={() => setSelectedForm(null)}>
              Back to Forms
            </button>
          </form>
        </div>
      )}
      <ToastContainer />
    </div>
  )
}

export default ClientDashboard
