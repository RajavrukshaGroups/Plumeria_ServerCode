import mongoose from "mongoose";

const EmailEventSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    subject: String,
    status: {
      type: String,
      enum: ["processing", "sent", "delivered", "opened", "clicked", "failed"],

      default: "pending", // Changed default to pending
    },
    events: [
      {
        type: {
          type: String,
          enum: ["processing", "send", "delivery", "open", "click", "error"],
        },
        timestamp: Date,
        ip: String,
        url: String,
        userAgent: String,
        details: mongoose.Schema.Types.Mixed, // For storing error details
      },
    ],
    metadata: {
      campaign: String,
      userId: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const MailPilot = mongoose.model("MailPilot", EmailEventSchema);
export default MailPilot;
