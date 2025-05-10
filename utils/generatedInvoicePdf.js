import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import axios from "axios";

const generateInvoicePdf = async ({
  bookingId,
  guestDetails,
  selectedRooms,
  formattedCheckInDate,
  formattedCheckOutDate,
  totalAmount,
  advancePayment,
  remainingAmount,
}) => {
  const pdfPath = path.join("invoices", `Invoice-${bookingId}.pdf`);
  if (!fs.existsSync("invoices")) {
    fs.mkdirSync("invoices");
  }

  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // --- LOGO ---
    try {
      const imageUrl =
        "https://res.cloudinary.com/daoulitkw/image/upload/v1744175217/plumeria_invoice_logo_vbzszb.jpg";
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(imageResponse.data);
      doc.image(imageBuffer, doc.page.width / 2 - 90, 30, { width: 180 });
      doc.moveDown(7);
    } catch (err) {
      console.error("Error loading logo image:", err);
    }

    // --- HEADER ---
    doc
      .fillColor("#000")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Booking Invoice", { align: "center" })
      .fontSize(12)
      .text(`Invoice #: ${bookingId}`, { align: "center" })
      .moveDown(1);

    // Divider
    doc
      .strokeColor("#e0e0e0")
      .lineWidth(1)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke()
      .moveDown(1);

    // --- GUEST DETAILS ---
    doc
      .fontSize(14)
      .fillColor("#000")
      .font("Helvetica-Bold")
      .text("Guest Information", { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .font("Helvetica")
      .text(`Name         : ${guestDetails.firstName} ${guestDetails.lastName}`)
      .text(`Phone        : ${guestDetails.phone}`)
      .text(`Email        : ${guestDetails.email}`)
      .text(`Check-in     : ${formattedCheckInDate}`)
      .text(`Check-out    : ${formattedCheckOutDate}`)
      .moveDown(1.5);

    // --- PAYMENT SUMMARY ---
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Payment Summary", { underline: true })
      .moveDown(0.5);

    const labelX = doc.page.margins.left;
    const valueX = 400;
    let y = doc.y;

    const drawSummaryRow = (label, value) => {
      doc.font("Helvetica-Bold").text(label, labelX, y);
      doc.font("Helvetica").text(value, valueX, y, { align: "right" });
      y += 20;
    };

    drawSummaryRow("Total Amount", `₹${totalAmount}`);
    drawSummaryRow("Advance Paid", `₹${advancePayment || totalAmount}`);
    drawSummaryRow("Remaining Amount", `₹${remainingAmount || 0}`);

    doc.moveDown(2);

    // --- ROOM DETAILS ---
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Room Details", { underline: true })
      .moveDown(0.5);

    const tableY = doc.y;
    const colX = {
      roomType: labelX,
      plan: labelX + 130,
      persons: labelX + 230,
      adults: labelX + 300,
      children: labelX + 370,
      duration: labelX + 450,
    };

    // Header
    doc.font("Helvetica-Bold").fontSize(12);
    doc
      .text("Room Type", colX.roomType, tableY)
      .text("Plan", colX.plan, tableY)
      .text("Persons", colX.persons, tableY)
      .text("Adults", colX.adults, tableY)
      .text("Children", colX.children, tableY)
      .text("Duration", colX.duration, tableY);

    let rowY = tableY + 20;
    doc.font("Helvetica").fontSize(11);

    selectedRooms.forEach((room) => {
      doc
        .text(room.roomType, colX.roomType, rowY)
        .text(room.planName, colX.plan, rowY)
        .text(room.persons, colX.persons, rowY)
        .text(room.adults, colX.adults, rowY)
        .text(room.children, colX.children, rowY)
        .text(`${room.duration} night(s)`, colX.duration, rowY);
      rowY += 20;
    });

    // --- Special Requests ---
    if (guestDetails.specialRequests) {
      doc
        .moveDown(2)
        .font("Helvetica-Oblique")
        .fillColor("#000")
        .text(`Special Request: ${guestDetails.specialRequests}`);
    }

    // --- FOOTER ---
    doc
      .moveDown(3)
      .strokeColor("#e0e0e0")
      .lineWidth(1)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke()
      .moveDown(1)
      .fontSize(10)
      .fillColor("gray");

    const footerMessage = `Thank you for choosing Plumeria Resort! For assistance, contact us at ${process.env.PLUMERIA_RESORT_MAIL}`;
    const maxFooterWidth = 400;
    const footerX = (doc.page.width - maxFooterWidth) / 2;

    doc.text(footerMessage, footerX, doc.y, {
      align: "center",
      width: maxFooterWidth,
    });

    doc.end();
    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
};

export default generateInvoicePdf;
