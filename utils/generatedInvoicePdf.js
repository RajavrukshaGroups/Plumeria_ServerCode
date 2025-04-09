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
      doc.moveDown(5);
    } catch (err) {
      console.error("Error loading logo image:", err);
    }

    // --- HEADER ---
    doc
      .fillColor("#222")
      .fontSize(24)
      .font("Helvetica-Bold")
      // .text("Plumeria Resort", { align: "center" })
      .fontSize(12)
      .fillColor("#666")
      // .text("Luxury Stay in the Lap of Nature", { align: "center" })
      .moveDown(0.5)
      .fillColor("#000")
      .font("Helvetica")
      .text(`Booking Invoice`, { align: "center" })
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
      .text("Guest Information", { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .text(`Name: ${guestDetails.firstName} ${guestDetails.lastName}`)
      .text(`Phone: ${guestDetails.phone}`)
      .text(`Email: ${guestDetails.email}`)
      .text(`Check-in: ${formattedCheckInDate}`)
      .text(`Check-out: ${formattedCheckOutDate}`)
      .moveDown(1);

    // --- PAYMENT TABLE ---
    doc.fontSize(14).text("Payment Summary", { underline: true }).moveDown(0.5);

    const tableStartX = doc.page.margins.left;
    let tableY = doc.y;

    const drawRow = (label, value, y) => {
      doc
        .font("Helvetica-Bold")
        .text(label, tableStartX, y)
        .font("Helvetica")
        .text(value, tableStartX + 300, y, { align: "right" });
    };

    drawRow("Total Amount", `₹${totalAmount}`, tableY);
    drawRow(
      "Advance Paid",
      `₹${advancePayment || totalAmount}`,
      (tableY += 20)
    );
    drawRow("Remaining Amount", `₹${remainingAmount || 0}`, (tableY += 20));

    doc.moveDown(2);

    // --- ROOM DETAILS TABLE ---
    doc.fontSize(14).text("Room Details", { underline: true }).moveDown(0.5);

    const roomTableY = doc.y;
    doc
      .font("Helvetica-Bold")
      .text("Type", tableStartX, roomTableY)
      .text("Count", tableStartX + 150, roomTableY)
      .text("Persons", tableStartX + 220, roomTableY)
      .text("Adults", tableStartX + 300, roomTableY)
      .text("Children", tableStartX + 380, roomTableY);

    let currentY = roomTableY + 20;
    doc.font("Helvetica");

    selectedRooms.forEach((room) => {
      doc
        .text(room.roomType, tableStartX, currentY)
        .text(`${room.count || 1}`, tableStartX + 150, currentY)
        .text(`${room.persons}`, tableStartX + 220, currentY)
        .text(`${room.adults}`, tableStartX + 300, currentY)
        .text(`${room.children}`, tableStartX + 380, currentY);
      currentY += 20;
    });

    // Special Requests
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
      .fillColor("gray")
      .text("Thank you for choosing Plumeria Resort!", { align: "center" })
      .text(
        `For assistance, contact us at ${process.env.PLUMERIA_RESORT_MAIL}`,
        { align: "center" }
      );

    doc.end();
    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
};

export default generateInvoicePdf;
