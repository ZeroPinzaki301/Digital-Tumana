import Feedback from "../models/Feedback.model.js";

export const createFeedback = async (req, res) => {
  try {
    const { senderName, subject, customSubject, message, email } = req.body;
    const userId = req.user._id; 
    const feedback = new Feedback({
      userId,
      senderName,
      subject,
      customSubject: subject === "Others" ? customSubject : "",
      message,
      email,
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit feedback", details: error.message });
  }
};

export const getUnseenFeedbacks = async (req, res) => {
  try {
    const unseenFeedbacks = await Feedback.find({ status: "unseen" }).sort({ createdAt: -1 });
    res.status(200).json(unseenFeedbacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve unseen feedbacks", details: error.message });
  }
};

export const markFeedbackAsSeen = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const updated = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status: "seen" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback marked as seen", feedback: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update feedback status", details: error.message });
  }
};

export const getSeenFeedbacks = async (req, res) => {
  try {
    const seenFeedbacks = await Feedback.find({ status: "seen" }).sort({ createdAt: -1 });
    res.status(200).json(seenFeedbacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve seen feedbacks", details: error.message });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const deleted = await Feedback.findByIdAndDelete(feedbackId);

    if (!deleted) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete feedback", details: error.message });
  }
};