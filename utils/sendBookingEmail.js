import "dotenv/config";
import nodemailer from "nodemailer";
import Booking from "../Models/Booking.js";
import { renderFile } from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.PLUMERIA_RESORT_MAIL,
    pass: process.env.PLUMERIA_RESORT_PASS,
  },
});

const sendBookingEmails = async ({
  bookingId,
  guestDetails,
  selectedRooms,
  formattedCheckInDate,
  formattedCheckOutDate,
  totalAmount,
  gstRate,
  gstAmount,
  totalWithGst,
  advancePayment,
  remainingAmount,
  amountInWords,
}) => {
  try {
    // Render the EJS template to HTML
    const htmlContent = await renderFile(
      path.join(__dirname, "../views/receipt.ejs"),
      {
        bookingId,
        guestDetails,
        selectedRooms,
        formattedCheckInDate,
        formattedCheckOutDate,
        totalAmount,
        gstRate,
        gstAmount,
        totalWithGst,
        advancePayment,
        remainingAmount,
        amountInWords,
        resortEmail: process.env.PLUMERIA_RESORT_MAIL,
      }
    );

    // Update booking with HTML receipt content
    await Booking.findOneAndUpdate({ bookingId }, { receiptHtml: htmlContent });

    const resortMailOptions = {
      from: `"Plumeria Resort Booking" <${process.env.PLUMERIA_RESORT_MAIL}>`,
      to: process.env.PLUMERIA_RESORT_MAIL,
      subject: `✅ New Booking Confirmed: ${bookingId}`,
      // html: `
      //   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      //     <div style="text-align: center;">
      //       <img src="https://res.cloudinary.com/daoulitkw/image/upload/v1744175217/plumeria_invoice_logo_vbzszb.jpg" alt="Plumeria Resort" style="max-width: 180px; display: block; margin: 0 auto 10px auto;" />
      //     </div>
      //     <h2>New Booking Confirmation - ${bookingId}</h2>
      //     <p><strong>Name:</strong> ${guestDetails.firstName} ${
      //   guestDetails.lastName
      // }</p>
      //     <p><strong>Email:</strong> ${guestDetails.email}</p>
      //     <p><strong>Phone:</strong> ${guestDetails.phone}</p>
      //     <p><strong>Check-in:</strong> ${formattedCheckInDate}</p>
      //     <p><strong>Check-out:</strong> ${formattedCheckOutDate}</p>
      //     <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
      //     <p><strong>Advance Paid:</strong> ₹${
      //       advancePayment || totalAmount
      //     }</p>
      //     <p><strong>Remaining:</strong> ₹${remainingAmount || 0}</p>
      //     <h3>Rooms & Guests:</h3>
      //     <p><strong>View Receipt:</strong> <a href="${
      //       process.env.FRONTEND_URL
      //     }/receipt/${bookingId}" target="_blank">View Online Receipt</a></p>
      //     <ul>
      //       ${selectedRooms
      //         .map(
      //           (r) =>
      //             `<li>${r.roomType}: ${r.count || 1} room(s), Persons: ${
      //               r.persons
      //             }, Adults: ${r.adults}, Children: ${r.children}, Plan: ${
      //               r.planName
      //             }, Stay Duration:${r.duration} night/s</li>`
      //         )
      //         .join("")}
      //     </ul>
      //     ${
      //       guestDetails.specialRequests
      //         ? `<p><strong>Special Request:</strong> ${guestDetails.specialRequests}</p>`
      //         : ""
      //     }
      //   </div>
      // `,
      html: htmlContent,
    };

    const clientMailOptions = {
      from: `"Plumeria Resort" <${process.env.PLUMERIA_RESORT_MAIL}>`,
      to: guestDetails.email,
      subject: `🎉 Your Booking is Confirmed - ${bookingId}`,
      html: htmlContent, // Use the rendered EJS template as email content
    };

    await transporter.sendMail(resortMailOptions);
    await transporter.sendMail(clientMailOptions);
    console.log("Emails sent to resort and client");

    return { success: true, message: "Emails sent successfully" };
  } catch (error) {
    console.error("Error sending booking emails:", error);
    return { success: false, message: "Failed to send emails" };
  }
};

export default sendBookingEmails;
