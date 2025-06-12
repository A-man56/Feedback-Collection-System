const mongoose = require("mongoose")
const Schema = mongoose.Schema

const FeedbackSubmissionSchema = new Schema({
  formId: {
    type: Schema.Types.ObjectId,
    ref: "feedbackforms",
    required: true,
  },
  responses: [
    {
      questionId: {
        type: String,
        required: true,
      },
      question: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
})

const FeedbackSubmissionModel = mongoose.model("feedbacksubmissions", FeedbackSubmissionSchema)
module.exports = FeedbackSubmissionModel
