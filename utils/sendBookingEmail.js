import "dotenv/config";
import nodemailer from "nodemailer";
import generateInvoicePdf from "./generatedInvoicePdf.js";
import uploadToCloudinary from "./uploadToCloudinary.js";
import Booking from "../Models/Booking.js";
import axios from "axios";

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
  advancePayment,
  remainingAmount,
}) => {
  const pdfPath = await generateInvoicePdf({
    bookingId,
    guestDetails,
    selectedRooms,
    formattedCheckInDate,
    formattedCheckOutDate,
    totalAmount,
    advancePayment,
    remainingAmount,
  });

  const cloudinaryPdfUrl = await uploadToCloudinary(pdfPath);
  await Booking.findOneAndUpdate(
    { bookingId },
    { invoicePdfUrl: cloudinaryPdfUrl }
  );

  const cloudinaryFileResponse = await axios.get(cloudinaryPdfUrl, {
    responseType: "arraybuffer",
  });

  const resortMailOptions = {
    from: `"Plumeria Resort Booking" <${process.env.PLUMERIA_RESORT_MAIL}>`,
    to: process.env.PLUMERIA_RESORT_MAIL,
    subject: `✅ New Booking Confirmed: ${bookingId}`,
    // html: `
    //     <h2>New Booking Confirmation - ${bookingId}</h2>
    //     <p><strong>Name:</strong> ${guestDetails.firstName} ${
    //   guestDetails.lastName
    // }</p>
    //     <p><strong>Email:</strong> ${guestDetails.email}</p>
    //     <p><strong>Phone:</strong> ${guestDetails.phone}</p>
    //     <p><strong>Check-in:</strong> ${formattedCheckInDate}</p>
    //     <p><strong>Check-out:</strong> ${formattedCheckOutDate}</p>
    //     <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
    //     <p><strong>Advance Paid:</strong> ₹${advancePayment || totalAmount}</p>
    //     <p><strong>Remaining:</strong> ₹${remainingAmount || 0}</p>
    //     <h3>Rooms & Guests:</h3>
    //     <p><strong>Invoice PDF:</strong> <a href="${cloudinaryPdfUrl}" target="_blank">Download Invoice</a></p>
    //     <ul>
    //       ${selectedRooms
    //         .map(
    //           (r) =>
    //             `<li>${r.roomType}: ${r.count || 1} room(s), Persons: ${
    //               r.persons
    //             }, Adults: ${r.adults}, Children: ${r.children}</li>`
    //         )
    //         .join("")}
    //     </ul>
    //     ${
    //       guestDetails.specialRequests
    //         ? `<p><strong>Special Request:</strong> ${guestDetails.specialRequests}</p>`
    //         : ""
    //     }
    //   `,
    // attachments: [
    //   {
    //     filename: `Invoice-${bookingId}.pdf`,
    //     path: cloudinaryPdfUrl,
    //     contentType: "application/pdf",
    //   },
    // ],
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <div style="text-align: center;">
<img src="https://res.cloudinary.com/daoulitkw/image/upload/v1744175217/plumeria_invoice_logo_vbzszb.jpg" alt="Plumeria Resort" style="max-width: 180px; display: block; margin: 0 auto 10px auto;" />
    </div>
    <h2>New Booking Confirmation - ${bookingId}</h2>
    <p><strong>Name:</strong> ${guestDetails.firstName} ${
      guestDetails.lastName
    }</p>
    <p><strong>Email:</strong> ${guestDetails.email}</p>
    <p><strong>Phone:</strong> ${guestDetails.phone}</p>
    <p><strong>Check-in:</strong> ${formattedCheckInDate}</p>
    <p><strong>Check-out:</strong> ${formattedCheckOutDate}</p>
    <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
    <p><strong>Advance Paid:</strong> ₹${advancePayment || totalAmount}</p>
    <p><strong>Remaining:</strong> ₹${remainingAmount || 0}</p>
    <h3>Rooms & Guests:</h3>
    <p><strong>Invoice PDF:</strong> <a href="${cloudinaryPdfUrl}" target="_blank">Download Invoice</a></p>
    <ul>
      ${selectedRooms
        .map(
          (r) =>
            `<li>${r.roomType}: ${r.count || 1} room(s), Persons: ${
              r.persons
            }, Adults: ${r.adults}, Children: ${r.children}</li>`
        )
        .join("")}
    </ul>
    ${
      guestDetails.specialRequests
        ? `<p><strong>Special Request:</strong> ${guestDetails.specialRequests}</p>`
        : ""
    }
  </div>
`,
    attachments: [
      {
        filename: `Invoice-${bookingId}.pdf`,
        // path: cloudinaryFileResponse.data,
        content: Buffer.from(cloudinaryFileResponse.data),
        contentType: "application/pdf",
      },
    ],
  };

  const clientMailOptions = {
    from: `"Plumeria Resort" <${process.env.PLUMERIA_RESORT_MAIL}>`,
    to: guestDetails.email,
    subject: `🎉 Your Booking is Confirmed - ${bookingId}`,
    // html: `
    // <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
    //   <h2 style="text-align: center; color: #ffc107;">Plumeria Resort</h2>
    //   <h3 style="text-align: center;">Booking Confirmation Invoice</h3>

    //   <hr style="margin: 20px 0;" />

    //   <p><strong>Booking ID:</strong> ${bookingId}</p>
    //   <p><strong>Guest:</strong> ${guestDetails.firstName} ${
    //   guestDetails.lastName
    // }</p>
    //   <p><strong>Phone:</strong> ${guestDetails.phone}</p>
    //   <p><strong>Email:</strong> ${guestDetails.email}</p>

    //   <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
    //     <thead>
    //       <tr>
    //         <th style="border: 1px solid #ddd; padding: 8px;">Check-in</th>
    //         <th style="border: 1px solid #ddd; padding: 8px;">Check-out</th>
    //         <th style="border: 1px solid #ddd; padding: 8px;">Amount</th>
    //         <th style="border: 1px solid #ddd; padding: 8px;">Paid</th>
    //         <th style="border: 1px solid #ddd; padding: 8px;">Remaining</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       <tr>
    //         <td style="border: 1px solid #ddd; padding: 8px; text-align:center">${formattedCheckInDate}</td>
    //         <td style="border: 1px solid #ddd; padding: 8px; text-align:center">${formattedCheckOutDate}</td>
    //         <td style="border: 1px solid #ddd; padding: 8px; text-align:center">₹${totalAmount}</td>
    //         <td style="border: 1px solid #ddd; padding: 8px; text-align:center">₹${
    //           advancePayment || totalAmount
    //         }</td>
    //         <td style="border: 1px solid #ddd; padding: 8px; text-align:center">₹${
    //           remainingAmount || 0
    //         }</td>
    //       </tr>
    //     </tbody>
    //   </table>

    //   <h4 style="margin-top: 30px;">Room Details</h4>
    //   <ul>
    //     ${selectedRooms
    //       .map(
    //         (r) =>
    //           `<li><strong>${r.roomType}:</strong> ${
    //             r.count || 1
    //           } room(s), Persons: ${r.persons}, Adults: ${
    //             r.adults
    //           }, Children: ${r.children}</li>`
    //       )
    //       .join("")}
    //   </ul>

    //   ${
    //     guestDetails.specialRequests
    //       ? `<p><strong>Special Request:</strong> ${guestDetails.specialRequests}</p>`
    //       : ""
    //   }

    //   <p style="margin-top: 30px;">Thank you for booking with us!<br/>We look forward to your stay.</p>
    //   <p style="color: gray; font-size: 12px;">This is an auto-generated invoice. For any queries, contact us at ${
    //     process.env.PLUMERIA_RESORT_MAIL
    //   }.</p>
    // </div>
    // `,
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
    <div style="text-align: center;">
<img src="https://res.cloudinary.com/daoulitkw/image/upload/v1744175217/plumeria_invoice_logo_vbzszb.jpg" alt="Plumeria Resort" style="max-width: 180px; display: block; margin: 0 auto 10px auto;" />
    </div>
    <h3 style="text-align: center;">Booking Confirmation Invoice</h3>

    <hr style="margin: 20px 0;" />

    <p><strong>Booking ID:</strong> ${bookingId}</p>
    <p><strong>Guest:</strong> ${guestDetails.firstName} ${
      guestDetails.lastName
    }</p>
    <p><strong>Phone:</strong> ${guestDetails.phone}</p>
    <p><strong>Email:</strong> ${guestDetails.email}</p>

    <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Check-in</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Check-out</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Amount</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Paid</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Remaining</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align:center">${formattedCheckInDate}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align:center">${formattedCheckOutDate}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align:center">₹${totalAmount}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align:center">₹${
            advancePayment || totalAmount
          }</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align:center">₹${
            remainingAmount || 0
          }</td>
        </tr>
      </tbody>
    </table>

    <h4 style="margin-top: 30px;">Room Details</h4>
    <ul>
      ${selectedRooms
        .map(
          (r) =>
            `<li><strong>${r.roomType}:</strong> ${
              r.count || 1
            } room(s), Persons: ${r.persons}, Adults: ${r.adults}, Children: ${
              r.children
            }</li>`
        )
        .join("")}
    </ul>

    ${
      guestDetails.specialRequests
        ? `<p><strong>Special Request:</strong> ${guestDetails.specialRequests}</p>`
        : ""
    }

    <p style="margin-top: 30px;">Thank you for booking with us!<br/>We look forward to your stay.</p>
    <p style="color: gray; font-size: 12px;">This is an auto-generated invoice. For any queries, contact us at ${
      process.env.PLUMERIA_RESORT_MAIL
    }.</p>
  </div>
`,
    attachments: [
      {
        filename: `Invoice-${bookingId}.pdf`,
        // path: cloudinaryFileResponse.data,
        content: Buffer.from(cloudinaryFileResponse.data),
        contentType: "application/pdf",
      },
    ],
  };

  try {
    await transporter.sendMail(resortMailOptions);
    await transporter.sendMail(clientMailOptions);
    console.log("email sent to resort and client");
  } catch (error) {
    console.error("error sending booking emails:", error);
  }
};

export default sendBookingEmails;
