const express = require("express")
const router = express.Router()
const {
  createForm,
  getAdminForms,
  getFormByCode,
  submitFeedback,
  getFormSubmissions,
  toggleFormStatus,
} = require("../Controllers/FeedbackController")
const ensureAuthenticated = require("../Middlewares/Auth")

// Admin routes (require authentication)
router.post("/forms", ensureAuthenticated, createForm)
router.get("/admin/forms", ensureAuthenticated, getAdminForms)
router.get("/forms/:formId/submissions", ensureAuthenticated, getFormSubmissions)
router.patch("/forms/:formId/toggle", ensureAuthenticated, toggleFormStatus)

// Public routes (anonymous access)
router.get("/public/forms/:accessCode", getFormByCode)
router.post("/submit", submitFeedback)

module.exports = router
