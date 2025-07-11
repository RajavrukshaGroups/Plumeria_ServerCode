import nodemailer from "nodemailer";
import fs from "fs";

const sendBulkMail = async (req, res) => {
  try {
    const { subject, message, to, fromEmail } = req.body;
    const attachment = req.files?.attachment;

    if (!subject || !message || !to || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Subject, message, and at least one recipient are required",
      });
    }

    // Validate email addresses
    const emailRegex = /\S+@\S+\.\S+/;
    const invalidEmails = to.filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid email addresses: ${invalidEmails.join(", ")}`,
      });
    }

    // Create transporter based on selected email
    let transporter;
    let senderName;
    if (fromEmail === process.env.PLUMERIA_RESORT_MAIL) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.PLUMERIA_RESORT_MAIL,
          pass: process.env.PLUMERIA_RESORT_PASS,
        },
      });
      senderName = "Plumeria Resort";
    } else {
      transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.DHS_NODEMAILER_MAIL,
          pass: process.env.DHS_NODEMAILER_PASS,
        },
      });
      senderName = "Defence Housing Society";
    }

    // Prepare attachment if exists
    const attachments = [];
    if (attachment) {
      attachments.push({
        filename: attachment.name,
        content: attachment.data,
      });
    }

    // Send emails individually
    const results = await Promise.all(
      to.map(async (recipient) => {
        try {
          await transporter.sendMail({
            from: `"${senderName}" <${fromEmail}>`,
            to: recipient,
            subject,
            text: message,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2d3748;">${subject}</h2>
                    <div style="line-height: 1.6;">
                      ${message.replace(/\n/g, "<br>")}
                    </div>
                    ${
                      attachment
                        ? `<p style="margin-top: 20px; font-size: 0.9em; color: #4a5568;">
                      <strong>Attachment:</strong> ${attachment.name}
                    </p>`
                        : ""
                    }
                    <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.8em; color: #718096;">
                    <p>${senderName}</p>
                    </footer>
                  </div>`,
            attachments,
          });
          return { email: recipient, status: "success" };
        } catch (error) {
          return { email: recipient, status: "failed", error: error.message };
        }
      })
    );

    const failedEmails = results.filter((result) => result.status === "failed");
    if (failedEmails.length > 0) {
      return res.status(207).json({
        success: true,
        message: "Some emails failed to send",
        results,
      });
    }

    return res.status(200).json({
      success: true,
      message: "All emails sent successfully",
      results,
    });
  } catch (err) {
    console.error("Error in sendBulkMail:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export default {
  sendBulkMail,
};
