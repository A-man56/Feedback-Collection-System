const mongoose = require("mongoose")
const Schema = mongoose.Schema

const FeedbackFormSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  questions: [
    {
      question: String,
      type: {
        type: String,
        enum: ["rating", "text"],
        default: "rating",
      },
      required: {
        type: Boolean,
        default: true,
      },
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  accessCode: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
  },
})

const FeedbackFormModel = mongoose.model("feedbackforms", FeedbackFormSchema)
module.exports = FeedbackFormModel
