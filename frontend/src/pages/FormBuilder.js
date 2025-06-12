"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { handleError, handleSuccess } from "../utils"
import { ToastContainer } from "react-toastify"

function FormBuilder() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    questions: [{ question: "", type: "rating", required: true }],
  })
  const [submitting, setSubmitting] = useState(false)

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    }
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }))
  }

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { question: "", type: "rating", required: true }],
    }))
  }

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      handleError("Form must have at least one question")
      return
    }

    const updatedQuestions = formData.questions.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      handleError("Form title is required")
      return
    }

    const emptyQuestions = formData.questions.some((q) => !q.question.trim())
    if (emptyQuestions) {
      handleError("All questions must have content")
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch("http://localhost:8080/feedback/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        handleSuccess("Feedback form created successfully!")
        setTimeout(() => {
          navigate("/admin")
        }, 1500)
      } else {
        handleError(result.message || "Failed to create form")
      }
    } catch (err) {
      handleError("Error creating form")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-builder">
      <header>
        <h1>Create Feedback Form</h1>
        <button onClick={() => navigate("/admin")} className="back-btn">
          Back to Dashboard
        </button>
      </header>

      <form onSubmit={handleSubmit} className="builder-form">
        <div className="form-section">
          <h2>Form Details</h2>
          <div className="form-group">
            <label htmlFor="title">Form Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Enter form title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Enter form description"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Questions</h2>
          {formData.questions.map((question, index) => (
            <div key={index} className="question-card">
              <div className="question-header">
                <h3>Question {index + 1}</h3>
                <button type="button" onClick={() => removeQuestion(index)} className="remove-question-btn">
                  Remove
                </button>
              </div>

              <div className="form-group">
                <label htmlFor={`question-${index}`}>Question Text*</label>
                <input
                  type="text"
                  id={`question-${index}`}
                  value={question.question}
                  onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`type-${index}`}>Question Type</label>
                <select
                  id={`type-${index}`}
                  value={question.type}
                  onChange={(e) => handleQuestionChange(index, "type", e.target.value)}
                >
                  <option value="rating">Rating (1-5)</option>
                  <option value="text">Text Comment</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id={`required-${index}`}
                  checked={question.required}
                  onChange={(e) => handleQuestionChange(index, "required", e.target.checked)}
                />
                <label htmlFor={`required-${index}`}>Required</label>
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="add-question-btn">
            Add Question
          </button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/admin")} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? "Creating..." : "Create Form"}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  )
}

export default FormBuilder
