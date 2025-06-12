"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { handleError, handleSuccess } from "../utils"
import { ToastContainer } from "react-toastify"

function FeedbackForm() {
  const { accessCode } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [responses, setResponses] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [accessCode])

  const fetchForm = async () => {
    try {
      setLoading(true)
      console.log("Fetching form with access code:", accessCode)

      const response = await fetch(`http://localhost:8080/feedback/public/forms/${accessCode}`)
      const result = await response.json()

      console.log("Form fetch result:", result)

      if (result.success) {
        setForm(result.form)
        console.log("Form loaded successfully:", result.form.title)
      } else {
        handleError(result.message || "Form not found")
        setTimeout(() => {
          navigate("/")
        }, 2000)
      }
    } catch (err) {
      console.error("Error loading form:", err)
      handleError("Error loading form")
    } finally {
      setLoading(false)
    }
  }

  const handleResponseChange = (questionId, value, type) => {
    console.log("Response changed:", { questionId, value, type })
    setResponses((prev) => ({
      ...prev,
      [questionId]: { value, type },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("Current responses:", responses)

    // Validate required fields
    const missingRequired = form.questions.some((q) => {
      const response = responses[q._id]
      return q.required && (!response || !response.value || response.value.toString().trim() === "")
    })

    if (missingRequired) {
      handleError("Please answer all required questions")
      return
    }

    try {
      setSubmitting(true)

      // Format responses for submission
      const formattedResponses = form.questions.map((question) => {
        const response = responses[question._id]
        return {
          questionId: question._id,
          question: question.question,
          answer: response ? response.value.toString() : "",
          type: question.type,
        }
      })

      console.log("Submitting formatted responses:", formattedResponses)

      const submitData = {
        formId: form._id,
        responses: formattedResponses,
      }

      console.log("Submit data:", submitData)

      const response = await fetch("http://localhost:8080/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()
      console.log("Submit result:", result)

      if (result.success) {
        handleSuccess("Thank you for your feedback!")
        setTimeout(() => {
          navigate("/thank-you")
        }, 1500)
      } else {
        handleError(result.message || "Failed to submit feedback")
      }
    } catch (err) {
      console.error("Error submitting feedback:", err)
      handleError("Error submitting feedback")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading form...</div>
  }

  if (!form) {
    return <div className="error-message">Form not found</div>
  }

  return (
    <div className="feedback-form-container">
      <div className="feedback-form">
        <header>
          <h1>{form.title}</h1>
          {form.description && <p className="form-description">{form.description}</p>}
        </header>

        <form onSubmit={handleSubmit}>
          {form.questions.map((question, index) => (
            <div key={question._id || index} className="question-item">
              <label>
                {question.question}
                {question.required && <span className="required">*</span>}
              </label>

              {question.type === "rating" ? (
                <div className="rating-input">
                  <div className="rating-options">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="rating-option">
                        <input
                          type="radio"
                          id={`q${index}-r${value}`}
                          name={`question-${question._id}`}
                          value={value}
                          checked={responses[question._id]?.value === value.toString()}
                          onChange={() => handleResponseChange(question._id, value.toString(), "rating")}
                          required={question.required}
                        />
                        <label htmlFor={`q${index}-r${value}`}>{value}</label>
                      </div>
                    ))}
                  </div>
                  <div className="rating-labels">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ) : (
                <textarea
                  placeholder="Your answer..."
                  value={responses[question._id]?.value || ""}
                  onChange={(e) => handleResponseChange(question._id, e.target.value, "text")}
                  required={question.required}
                  rows={4}
                />
              )}
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="submit-btn">
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  )
}

export default FeedbackForm
