"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { handleError } from "../utils"
import { ToastContainer } from "react-toastify"
import Chart from "chart.js/auto"

function FormResults() {
  const { formId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(null)
  const [chartData, setChartData] = useState([])
  const [comments, setComments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const chartRefs = useRef({})
  const chartInstances = useRef({})

  useEffect(() => {
    fetchResults()
  }, [formId])

  useEffect(() => {
    // Create charts when chart data is available
    if (chartData.length > 0) {
      chartData.forEach((data, index) => {
        if (chartRefs.current[index]) {
          // Destroy existing chart if it exists
          if (chartInstances.current[index]) {
            chartInstances.current[index].destroy()
          }

          // Create new chart
          const ctx = chartRefs.current[index].getContext("2d")
          chartInstances.current[index] = new Chart(ctx, {
            type: "bar",
            data: {
              labels: ["1 (Poor)", "2", "3", "4", "5 (Excellent)"],
              datasets: [
                {
                  label: "Responses",
                  data: [
                    data.ratings["1"] || 0,
                    data.ratings["2"] || 0,
                    data.ratings["3"] || 0,
                    data.ratings["4"] || 0,
                    data.ratings["5"] || 0,
                  ],
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(255, 159, 64, 0.7)",
                    "rgba(255, 205, 86, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(54, 162, 235, 0.7)",
                  ],
                  borderColor: [
                    "rgb(255, 99, 132)",
                    "rgb(255, 159, 64)",
                    "rgb(255, 205, 86)",
                    "rgb(75, 192, 192)",
                    "rgb(54, 162, 235)",
                  ],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: data.question,
                  font: {
                    size: 16,
                  },
                },
              },
            },
          })
        }
      })
    }

    // Cleanup charts on unmount
    return () => {
      Object.values(chartInstances.current).forEach((chart) => {
        if (chart) chart.destroy()
      })
    }
  }, [chartData])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/feedback/forms/${formId}/submissions`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })

      const result = await response.json()

      if (result.success) {
        setChartData(result.chartData || [])
        setComments(result.comments || [])
        setSubmissions(result.submissions || [])
        setFormData(result.form)
      } else {
        handleError(result.message || "Failed to fetch results")
        navigate("/admin")
      }
    } catch (err) {
      handleError("Error fetching form results")
      navigate("/admin")
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!submissions.length) {
      handleError("No data to export")
      return
    }

    // Prepare CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Headers
    const headers = ["Submission Date"]
    const questionMap = {}

    // Get all unique questions
    submissions.forEach((submission) => {
      submission.responses.forEach((response) => {
        if (!questionMap[response.questionId]) {
          questionMap[response.questionId] = response.question
          headers.push(response.question)
        }
      })
    })

    csvContent += headers.join(",") + "\r\n"

    // Data rows
    submissions.forEach((submission) => {
      const row = [new Date(submission.submittedAt).toLocaleDateString()]

      // Initialize with empty values
      const responseValues = {}
      headers.slice(1).forEach((question, i) => {
        responseValues[question] = ""
      })

      // Fill in actual responses
      submission.responses.forEach((response) => {
        responseValues[response.question] = response.answer
      })

      // Add values in the correct order
      headers.slice(1).forEach((question) => {
        row.push(`"${responseValues[question]}"`)
      })

      csvContent += row.join(",") + "\r\n"
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `feedback-results-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="loading">Loading results...</div>
  }

  return (
    <div className="form-results">
      <header>
        <h1>Form Results</h1>
        <div className="header-actions">
          <button onClick={exportToCSV} className="export-btn">
            Export to CSV
          </button>
          <button onClick={() => navigate("/admin")} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="results-summary">
        <h2>Summary</h2>
        <div className="summary-stats">
          <div className="stat-card">
            <h3>Total Submissions</h3>
            <p className="stat-value">{submissions.length}</p>
          </div>
          <div className="stat-card">
            <h3>Comments</h3>
            <p className="stat-value">{comments.length}</p>
          </div>
          <div className="stat-card">
            <h3>Last Response</h3>
            <p className="stat-value">
              {submissions.length > 0 ? new Date(submissions[0].submittedAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="charts-section">
          <h2>Rating Results</h2>
          <div className="charts-container">
            {chartData.map((data, index) => (
              <div key={index} className="chart-wrapper">
                <canvas ref={(el) => (chartRefs.current[index] = el)} width="400" height="300"></canvas>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-charts">
          <p>No rating data available yet.</p>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="comments-section">
          <h2>Comments</h2>
          <div className="comments-list">
            {comments.map((comment, index) => (
              <div key={index} className="comment-card">
                <h3>{comment.question}</h3>
                <p className="comment-text">{comment.comment}</p>
                <p className="comment-date">{new Date(comment.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-comments">
          <p>No comments available yet.</p>
        </div>
      )}
      <ToastContainer />
    </div>
  )
}

export default FormResults
