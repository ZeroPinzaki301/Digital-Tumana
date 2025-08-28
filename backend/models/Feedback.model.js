import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true, trim: true },
    subject: {
      type: String,
      enum: ["Report", "Suggestion", "Bug", "Feature Request", "Others"],
      required: true,
    },
    customSubject: {
      type: String,
      trim: true,
      default: "",
    },
    message: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ["seen", "unseen"],
      default: "unseen",
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;