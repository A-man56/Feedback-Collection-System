const FeedbackFormModel = require("../Models/FeedbackForm")
const FeedbackSubmissionModel = require("../Models/FeedbackSubmission")

// Admin: Create a new feedback form
const createForm = async (req, res) => {
  try {
    const { title, description, questions } = req.body
    const form = new FeedbackFormModel({
      title,
      description,
      questions,
      createdBy: req.user._id,
    })
    await form.save()
    res.status(201).json({
      message: "Feedback form created successfully",
      success: true,
      form,
    })
  } catch (err) {
    console.error("Create form error:", err)
    res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

// Admin: Get all forms created by the admin
const getAdminForms = async (req, res) => {
  try {
    const forms = await FeedbackFormModel.find({ createdBy: req.user._id })
    res.status(200).json({
      success: true,
      forms,
    })
  } catch (err) {
    console.error("Get admin forms error:", err)
    res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

// Public: Get a form by access code (for anonymous submission)
const getFormByCode = async (req, res) => {
  try {
    const { accessCode } = req.params
    console.log("Looking for form with access code:", accessCode)

    const form = await FeedbackFormModel.findOne({
      accessCode,
      active: true,
    }).select("-createdBy")

    if (!form) {
      console.log("Form not found for access code:", accessCode)
      return res.status(404).json({
        message: "Form not found or inactive",
        success: false,
      })
    }

    console.log("Form found:", form.title)
    res.status(200).json({
      success: true,
      form,
    })
  } catch (err) {
    console.error("Get form by code error:", err)
    res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

// Public: Submit feedback anonymously
const submitFeedback = async (req, res) => {
  try {
    console.log("Received feedback submission:", JSON.stringify(req.body, null, 2))
    const { formId, responses } = req.body

    // Validate input
    if (!formId || !responses || !Array.isArray(responses)) {
      console.log("Invalid input data")
      return res.status(400).json({
        message: "Invalid input data",
        success: false,
      })
    }

    // Verify the form exists and is active
    const form = await FeedbackFormModel.findOne({ _id: formId, active: true })
    if (!form) {
      console.log("Form not found or inactive:", formId)
      return res.status(404).json({
        message: "Form not found or inactive",
        success: false,
      })
    }

    console.log("Form found for submission:", form.title)

    // Validate and clean responses
    const cleanedResponses = responses.map((response) => ({
      questionId: response.questionId.toString(),
      question: response.question.toString(),
      answer: response.answer.toString(),
      type: response.type.toString(),
    }))

    console.log("Cleaned responses:", JSON.stringify(cleanedResponses, null, 2))

    // Create submission
    const submission = new FeedbackSubmissionModel({
      formId: formId,
      responses: cleanedResponses,
    })

    const savedSubmission = await submission.save()
    console.log("Feedback submitted successfully:", savedSubmission._id)

    res.status(201).json({
      message: "Feedback submitted successfully",
      success: true,
    })
  } catch (err) {
    console.error("Submit feedback error:", err)
    res.status(500).json({
      message: "Internal server error: " + err.message,
      success: false,
    })
  }
}

// Admin: Get submissions for a specific form
const getFormSubmissions = async (req, res) => {
  try {
    const { formId } = req.params

    // Verify the form belongs to the requesting admin
    const form = await FeedbackFormModel.findOne({
      _id: formId,
      createdBy: req.user._id,
    })

    if (!form) {
      return res.status(403).json({
        message: "You don't have access to this form",
        success: false,
      })
    }

    const submissions = await FeedbackSubmissionModel.find({ formId })

    // Process data for charts
    const ratingQuestions = form.questions.filter((q) => q.type === "rating")
    const chartData = {}

    ratingQuestions.forEach((question) => {
      chartData[question._id] = {
        question: question.question,
        ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    })

    submissions.forEach((submission) => {
      submission.responses.forEach((response) => {
        if (response.type === "rating" && chartData[response.questionId]) {
          const rating = Number.parseInt(response.answer)
          if (rating >= 1 && rating <= 5) {
            chartData[response.questionId].ratings[rating] = (chartData[response.questionId].ratings[rating] || 0) + 1
          }
        }
      })
    })

    // Get text comments
    const comments = []
    submissions.forEach((submission) => {
      submission.responses.forEach((response) => {
        if (response.type === "text" && response.answer && response.answer.trim()) {
          comments.push({
            question: response.question,
            comment: response.answer,
            date: submission.submittedAt,
          })
        }
      })
    })

    res.status(200).json({
      success: true,
      chartData: Object.values(chartData),
      comments,
      submissions,
      form,
    })
  } catch (err) {
    console.error("Get form submissions error:", err)
    res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

// Admin: Toggle form active status
const toggleFormStatus = async (req, res) => {
  try {
    const { formId } = req.params

    const form = await FeedbackFormModel.findOne({
      _id: formId,
      createdBy: req.user._id,
    })

    if (!form) {
      return res.status(403).json({
        message: "You don't have access to this form",
        success: false,
      })
    }

    form.active = !form.active
    await form.save()

    res.status(200).json({
      success: true,
      active: form.active,
      message: `Form ${form.active ? "activated" : "deactivated"} successfully`,
    })
  } catch (err) {
    console.error("Toggle form status error:", err)
    res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}

module.exports = {
  createForm,
  getAdminForms,
  getFormByCode,
  submitFeedback,
  getFormSubmissions,
  toggleFormStatus,
}
