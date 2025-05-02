import sgMail from "@sendgrid/mail";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import MailPilot from "../../Models/adminModels/mailPilot.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Add this at the top of your file (right after imports)
const validateEmail = (email) => {
  // Robust email validation regex
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

// Google Sheets logging function
const logToGoogleSheets = async ({
  email,
  subject,
  status,
  eventType,
  timestamp,
  messageId,
  updateExisting = false,
}) => {
  console.log(`Logging to Google Sheets:`, {
    email,
    subject,
    status,
    eventType,
    messageId,
    updateExisting,
  });
  const auth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const values = [
    [
      messageId || "N/A",
      email,
      subject,
      status,
      eventType || "send",
      new Date(timestamp || Date.now()).toISOString(),
    ],
  ];

  try {
    if (updateExisting) {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: "Sheet1!A:F",
      });

      const rows = result.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === messageId);

      if (rowIndex > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SHEET_ID,
          range: `Sheet1!A${rowIndex + 2}:F${rowIndex + 2}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [values[0]] },
        });
        console.log(`Updated existing row for messageId: ${messageId}`);
        return;
      }
    }
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: "Sheet1!A:F", // Updated range to include messageId
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
    console.log(`Appended new row for messageId: ${messageId}`);
  } catch (error) {
    console.error("Google Sheets logging error:", error);
  }
};

// Generate unique message ID
const generateMessageId = (email) => {
  return `${Date.now()}-${email.replace(/@.+$/, "")}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

// In your sendBulkMail controller
const sendBulkMail = async (req, res) => {
  const { subject, body, to } = req.body;

  console.log("Received bulk mail request:", {
    subject,
    recipients: to.length,
  });

  try {
    const failedEmails = [];
    const successfulEmails = [];
    const detailedErrors = [];

    for (const email of to) {
      const messageId = generateMessageId(email);
      let sendSuccess = false;

      console.log(`Processing email: ${email} with messageId: ${messageId}`);

      try {
        if (!validateEmail(email)) {
          throw new Error(`Invalid email format: ${email}`);
        }

        await MailPilot.create({
          messageId,
          email,
          subject,
          status: "processing",
          events: [{ type: "processing", timestamp: new Date() }],
        });

        console.log(`Sending email to ${email}...`);
        await sgMail.send({
          to: email,
          from: process.env.PLUMERIA_RESORT_MAIL,
          subject,
          html: body,
          customArgs: { messageId, email },
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true },
          },
        });

        console.log(
          `Email sent to ${email}, updating DB and logging to Sheets...`
        );

        await Promise.all([
          MailPilot.findOneAndUpdate({ messageId }, { status: "sent" }),
          logToGoogleSheets({
            messageId,
            email,
            subject,
            status: "Sent",
            eventType: "send",
            timestamp: new Date().toISOString(),
          }),
        ]);

        successfulEmails.push(email);
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);

        await Promise.all([
          MailPilot.findOneAndUpdate(
            { messageId },
            {
              status: "failed",
              $push: {
                events: {
                  type: "error",
                  timestamp: new Date(),
                  details: error.message,
                },
              },
            }
          ),
          logToGoogleSheets({
            messageId,
            email,
            subject,
            status: "Failed",
            eventType: "error",
            error: error.message,
            timestamp: new Date().toISOString(),
          }),
        ]);

        failedEmails.push(email);
        detailedErrors.push({
          email,
          message: error.message,
        });
      }
    }

    console.log("Bulk email sending finished:", {
      sent: successfulEmails.length,
      failed: failedEmails.length,
    });

    return res.status(failedEmails.length === 0 ? 200 : 207).json({
      success: failedEmails.length === 0,
      message:
        failedEmails.length === 0
          ? `Successfully sent ${successfulEmails.length} email(s)`
          : `Sent ${successfulEmails.length}, failed ${failedEmails.length}`,
      data: {
        sentCount: successfulEmails.length,
        failedCount: failedEmails.length,
        successfulEmails,
        failedEmails,
        errors: detailedErrors,
      },
    });
  } catch (error) {
    console.error("System error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    console.log("Webhook received:", JSON.stringify(req.body, null, 2));

    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      const { email, event: eventType, timestamp, ip, url, useragent } = event;
      const messageId = event.custom_args?.messageId;
      const subject = event.custom_args?.subject;

      if (!messageId) {
        console.warn("Missing messageId in webhook event:", event);
      }

      console.log("Processing event:", {
        email,
        eventType,
        messageId,
      });

      if (!email || !eventType || !messageId) continue;

      let status;
      switch (eventType) {
        case "delivered":
          status = "delivered";
          break;
        case "open":
          status = "opened";
          break;
        case "click":
          status = "clicked";
          break;
        case "bounce":
          status = "bounced";
          break;
        case "dropped":
          status = "failed";
          break;
        default:
          status = "processed";
      }

      await Promise.all([
        MailPilot.findOneAndUpdate(
          { messageId },
          {
            $set: { status },
            $push: {
              events: {
                type: eventType,
                timestamp: new Date(timestamp * 1000),
                ...(ip && { ip }),
                ...(url && { url }),
                ...(useragent && { userAgent: useragent }),
              },
            },
          }
        ),
        logToGoogleSheets({
          messageId,
          email,
          subject,
          status,
          eventType,
          timestamp: timestamp * 1000,
          updateExisting: true,
        }),
      ]);
    }

    res.status(200).send("Events processed successfully");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing events");
  }
};

export const getEmailAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Get data from MongoDB
    const dbStats = await MailPilot.aggregate([
      { $match: { "metadata.campaign": campaignId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          delivered: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          opened: { $sum: { $cond: [{ $eq: ["$status", "opened"] }, 1, 0] } },
          clicked: { $sum: { $cond: [{ $eq: ["$status", "clicked"] }, 1, 0] } },
        },
      },
    ]);

    // You could also fetch data from Google Sheets here if needed
    // using the googleapis client

    res.json({
      success: true,
      data: dbStats[0] || {},
    });
  } catch (error) {
    console.error("Error getting analytics:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export default {
  sendBulkMail,
  updateStatus,
  getEmailAnalytics,
};
