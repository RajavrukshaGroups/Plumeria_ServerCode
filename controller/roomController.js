import mongoose from "mongoose";
import { nanoid } from "nanoid";
import Booking from "../Models/Booking.js";
import Room from "../Models/Room.js";
import RoomAvailability from "../Models/RoomAvailability.js";

const roomDetails = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({
      message: "Room details fetched successfully",
      success: true,
      data: rooms,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching room details", success: false, error });
  }
};

const checkRoomsAvailability = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, rooms } = req.body;
    console.log("Request body1233232423", req.body);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    checkIn.setUTCHours(0, 0, 0, 0);
    checkOut.setUTCHours(0, 0, 0, 0);

    console.log("Checking availability from:", checkIn, "to", checkOut);

    // Restrict maximum stay to 5 days
    const maxStay = 5;
    const differenceInDays = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

    if (differenceInDays > maxStay) {
      return res.status(400).json({
        error: `Maximum stay allowed is ${maxStay} days. Please select a shorter duration.`,
      });
    }

    // Extract room types and count occurrences
    const roomCounts = rooms.reduce((acc, room) => {
      const type = room.roomType.trim().toLowerCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const roomTypes = Object.keys(roomCounts);

    // Fetch availability data with case-insensitive room type matching
    const availabilityData = await RoomAvailability.find({
      roomType: { $in: roomTypes.map((type) => new RegExp(`^${type}$`, "i")) },
      date: { $gte: checkIn, $lte: checkOut },
    });

    console.log("Fetched availability data:", availabilityData);

    let unavailableDates = [];

    // Check if enough rooms are available for each date
    for (const [roomType, totalRooms] of Object.entries(roomCounts)) {
      let currentDate = new Date(checkIn);

      while (currentDate <= checkOut) {
        const formattedDate = new Date(currentDate);
        formattedDate.setUTCHours(0, 0, 0, 0);

        let roomAvailability = availabilityData.find(
          (entry) =>
            entry.roomType.trim().toLowerCase() === roomType &&
            entry.date.toISOString() === formattedDate.toISOString()
        );

        if (!roomAvailability) {
          console.log(
            `No data found for ${formattedDate.toDateString()}. Assuming all rooms are available.`
          );

          roomAvailability = { availableRooms: 1000 }; // Set to a high number
        }

        console.log(
          `Checking ${roomType} on ${formattedDate.toDateString()}:`,
          roomAvailability.availableRooms
        );

        if (roomAvailability.availableRooms < totalRooms) {
          unavailableDates.push({
            date: formattedDate.toDateString(),
            roomType,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // ✅ Remove rooms with `availableRooms: 0`
    const filteredAvailableRooms = availabilityData
      .filter(({ availableRooms }) => availableRooms > 0) // Exclude unavailable rooms
      .map(({ roomType, date, availableRooms }) => ({
        roomType,
        date,
        availableRooms,
      }));

    if (unavailableDates.length > 0) {
      return res.status(400).json({
        error: "Rooms are unavailable on selected dates.",
        unavailableDates,
        availableRooms: filteredAvailableRooms, // ✅ Use the filtered list
      });
    }

    res.status(200).json({
      message: "Rooms are available for the selected dates.",
      availableRooms: filteredAvailableRooms, // ✅ Use the filtered list
    });
  } catch (error) {
    console.error("Error checking availability", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

// const createBooking = async (req, res) => {
//   try {
//     const {
//       customerName,
//       contactInfo,
//       checkInDate,
//       checkOutDate,
//       selectedRooms,
//       selectedPlan,
//       guestDetails,
//       advancePayment,
//       remainingAmount,
//       totalAmount,
//       totalRooms,
//       roomTypes,
//       totalGuests,
//       totalCost,
//       bookingStatus,
//       payment,
//       assignedStaff,
//       specialRequests,
//       amountToPay,
//     } = req.body;

//     // const checkIn = new Date(checkInDate);
//     // const checkOut = new Date(checkOutDate);
//     // checkIn.setUTCHours(0, 0, 0, 0);
//     // checkOut.setUTCHours(0, 0, 0, 0);

//     console.log("req body", req.body);

//     // Fetch availability before updating
//     // const availabilityData = await RoomAvailability.find({
//     //   roomType: { $in: roomTypes },
//     //   date: { $gte: checkIn, $lte: checkOut },
//     // });

//     // console.log("Fetched availability:", availabilityData);

//     // ❌ Check if there are enough available rooms
//     // for (const roomType of roomTypes) {
//     //   for (
//     //     let d = new Date(checkIn);
//     //     d <= checkOut;
//     //     d.setDate(d.getDate() + 1)
//     //   ) {
//     //     const formattedDate = new Date(d);
//     //     formattedDate.setUTCHours(0, 0, 0, 0); // Normalize time

//     //     const roomAvailability = availabilityData.find(
//     //       (entry) =>
//     //         entry.roomType.trim().toLowerCase() ===
//     //           roomType.trim().toLowerCase() &&
//     //         entry.date.toISOString() === formattedDate.toISOString()
//     //     );

//     //     console.log(
//     //       `Checking ${roomType} on ${formattedDate.toDateString()}:`,
//     //       roomAvailability ? roomAvailability.availableRooms : "Not Found"
//     //     );

//     //     if (!roomAvailability || roomAvailability.availableRooms < totalRooms) {
//     //       return res.status(400).json({
//     //         error: `Not enough rooms available for ${roomType} on ${formattedDate.toDateString()}.`,
//     //       });
//     //     }
//     //   }
//     // }

//     // ✅ Update room availability (Reduce available rooms)
//     // for (const roomType of roomTypes) {
//     //   for (
//     //     let d = new Date(checkIn);
//     //     d <= checkOut;
//     //     d.setDate(d.getDate() + 1)
//     //   ) {
//     //     const formattedDate = new Date(d);
//     //     formattedDate.setUTCHours(0, 0, 0, 0);

//     //     const result = await RoomAvailability.updateOne(
//     //       { roomType: roomType.trim(), date: formattedDate },
//     //       { $inc: { availableRooms: -totalRooms } }
//     //     );

//     //     console.log(
//     //       `Updated ${roomType} availability for ${formattedDate.toDateString()}:`,
//     //       result
//     //     );
//     //   }
//     // }

//     // ✅ Save Booking
//     // const newBooking = new Booking({
//     //   customerName,
//     //   contactInfo,
//     //   checkInDate,
//     //   checkOutDate,
//     //   totalRooms,
//     //   roomTypes,
//     //   totalGuests,
//     //   totalCost,
//     //   bookingStatus,
//     //   payment,
//     //   assignedStaff,
//     //   specialRequests,
//     // });

//     // await newBooking.save();

//     // Fetch updated availability data
//     // const updatedAvailability = await RoomAvailability.find({});
//     // console.log("Updated Room Data:", updatedAvailability);

//     // res.status(201).json({
//     //   message: "Booking created successfully",
//     //   booking: newBooking,
//     // });
//   } catch (error) {
//     console.error("Error creating booking", error);
//     res.status(500).json({ error: "Server error. Please try again later." });
//   }
// };

// const createBooking = async (req, res) => {
//   try {
//     const {
//       checkInDate,
//       checkOutDate,
//       selectedRooms,
//       guestDetails,
//       advancePayment,
//       remainingAmount,
//       totalAmount,
//     } = req.body;

//     console.log("Request body:", req.body);

//     const formatDate = (dateStr) => {
//       const date = new Date(dateStr);
//       const day = String(date.getDate()).padStart(2, "0");
//       const month = String(date.getMonth() + 1).padStart(2, "0");
//       const year = date.getFullYear();
//       return `${day}-${month}-${year}`;
//     };

//     const formattedCheckInDate = formatDate(checkInDate);
//     const formattedCheckOutDate = formatDate(checkOutDate);

//     const newBooking = new Booking({
//       customerName: `${guestDetails.firstName} ${guestDetails.lastName}`,
//       contactInfo: {
//         email: guestDetails.email,
//         phone: guestDetails.phone,
//       },
//       checkInDate: formattedCheckInDate,
//       checkOutDate: formattedCheckOutDate,
//       totalRooms: selectedRooms.length,
//       roomTypes: selectedRooms.map((room) => room.roomType),
//       totalGuests: selectedRooms.map((room) => ({
//         roomType: room.roomType,
//         persons: room.persons,
//         adult: room.adults,
//         children: room.children,
//       })),
//       totalCost: totalAmount,
//       bookingStatus: "Confirmed",
//       payment: {
//         method: "Razorpay",
//         amountPaid: advancePayment || totalAmount,
//         balanceDue: remainingAmount || 0,
//       },
//       assignedStaff: "",
//       specialRequests: guestDetails.specialRequests
//         ? [guestDetails.specialRequests]
//         : [],
//       discount: {
//         code: "",
//         amount: 0,
//       },
//     });

//     await newBooking.save();

//     // **Update Room Availability**
//     const checkIn = new Date(checkInDate);
//     const checkOut = new Date(checkOutDate);

//     for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
//       for (const room of selectedRooms) {
//         // Fetch maxRoomsAvailable dynamically
//         const roomData = await Room.findOne({ roomType: room.roomType });

//         if (!roomData) {
//           console.error(
//             `❌ Room type ${room.roomType} not found in Room model.`
//           );
//           continue;
//         }

//         const maxRoomsAvailable = roomData.maxRoomsAvailable;
//         const roomCount = room.count || 1; // Default to 1 if not provided

//         if (typeof roomCount !== "number" || isNaN(roomCount)) {
//           console.error(
//             `❌ Invalid room count for ${room.roomType} on ${d}:`,
//             roomCount
//           );
//           continue;
//         }

//         // Check existing availability
//         const existingAvailability = await RoomAvailability.findOne({
//           roomType: room.roomType,
//           date: d,
//         });

//         let updatedAvailability;

//         if (existingAvailability) {
//           // Ensure we don't go below 0
//           updatedAvailability = Math.max(
//             existingAvailability.availableRooms - roomCount,
//             0
//           );
//         } else {
//           // If no previous entry, initialize it with maxRoomsAvailable - booked count
//           updatedAvailability = Math.max(maxRoomsAvailable - roomCount, 0);
//         }

//         await RoomAvailability.findOneAndUpdate(
//           { roomType: room.roomType, date: d },
//           { availableRooms: updatedAvailability },
//           { upsert: true, new: true }
//         );
//       }
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Booking successfully created, room availability updated",
//       booking: newBooking,
//     });
//   } catch (error) {
//     console.error("❌ Error creating booking:", error);
//     res.status(500).json({ error: "Server error. Please try again later." });
//   }
// };

// const createBooking = async (req, res) => {
//   try {
//     const {
//       checkInDate,
//       checkOutDate,
//       selectedRooms,
//       guestDetails,
//       advancePayment,
//       remainingAmount,
//       totalAmount,
//     } = req.body;

//     console.log("Request body:", req.body);

//     const formatDate = (dateStr) => {
//       const date = new Date(dateStr);
//       const day = String(date.getDate()).padStart(2, "0");
//       const month = String(date.getMonth() + 1).padStart(2, "0");
//       const year = date.getFullYear();
//       return `${day}-${month}-${year}`;
//     };

//     const formattedCheckInDate = formatDate(checkInDate);
//     const formattedCheckOutDate = formatDate(checkOutDate);

//     const checkIn = new Date(checkInDate);
//     const checkOut = new Date(checkOutDate);

//     // ✅ Step 1: Validate room availability first
//     for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
//       const dateOnly = new Date(d.toDateString());
//       for (const room of selectedRooms) {
//         const roomData = await Room.findOne({ roomType: room.roomType });

//         if (!roomData) {
//           return res.status(400).json({
//             success: false,
//             message: `Room type "${room.roomType}" not found.`,
//           });
//         }

//         const roomCount = room.count || 1;

//         const existingAvailability = await RoomAvailability.findOne({
//           roomType: room.roomType,
//           date: dateOnly,
//         });

//         const availableRooms = existingAvailability
//           ? existingAvailability.availableRooms
//           : roomData.maxRoomsAvailable;

//         if (availableRooms < roomCount) {
//           const errorMsg = `❌ Not enough "${
//             room.roomType
//           }" rooms available on ${formatDate(dateOnly)}.`;
//           console.error(errorMsg);
//           return res.status(400).json({
//             success: false,
//             message: errorMsg,
//           });
//         }
//       }
//     }

//     // ✅ Step 2: Save the booking only after availability check
//     const newBooking = new Booking({
//       customerName: `${guestDetails.firstName} ${guestDetails.lastName}`,
//       contactInfo: {
//         email: guestDetails.email,
//         phone: guestDetails.phone,
//       },
//       checkInDate: formattedCheckInDate,
//       checkOutDate: formattedCheckOutDate,
//       totalRooms: selectedRooms.length,
//       roomTypes: selectedRooms.map((room) => room.roomType),
//       totalGuests: selectedRooms.map((room) => ({
//         roomType: room.roomType,
//         persons: room.persons,
//         adult: room.adults,
//         children: room.children,
//       })),
//       totalCost: totalAmount,
//       bookingStatus: "Confirmed",
//       payment: {
//         method: "Razorpay",
//         amountPaid: advancePayment || totalAmount,
//         balanceDue: remainingAmount || 0,
//       },
//       assignedStaff: "",
//       specialRequests: guestDetails.specialRequests
//         ? [guestDetails.specialRequests]
//         : [],
//       discount: {
//         code: "",
//         amount: 0,
//       },
//     });

//     await newBooking.save();
//     console.log("Booking saved successfully")

//     // ✅ Step 3: Update availability now that booking is confirmed
//     for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
//       const dateOnly = new Date(d.toDateString());
//       for (const room of selectedRooms) {
//         const roomData = await Room.findOne({ roomType: room.roomType });
//         const maxRoomsAvailable = roomData.maxRoomsAvailable;
//         const roomCount = room.count || 1;

//         const existingAvailability = await RoomAvailability.findOne({
//           roomType: room.roomType,
//           date: dateOnly,
//         });

//         let updatedAvailability;

//         if (existingAvailability) {
//           updatedAvailability = Math.max(
//             existingAvailability.availableRooms - roomCount,
//             0
//           );
//         } else {
//           updatedAvailability = Math.max(maxRoomsAvailable - roomCount, 0);
//         }

//         await RoomAvailability.findOneAndUpdate(
//           { roomType: room.roomType, date: dateOnly },
//           { availableRooms: updatedAvailability },
//           { upsert: true, new: true }
//         );
//       }
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Booking successfully created, room availability updated",
//       booking: newBooking,
//     });
//   } catch (error) {
//     console.error("❌ Error creating booking:", error);
//     res.status(500).json({ error: "Server error. Please try again later." });
//   }
// };

const generateUniqueBookingId = async () => {
  let bookingId;
  let exists = true;

  while (exists) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    bookingId = `PLUM${randomNum}`;

    const existing = await Booking.findOne({ bookingId });
    if (!existing) exists = false;
  }
  return bookingId;
};
const createBooking = async (req, res) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      selectedRooms,
      guestDetails,
      advancePayment,
      remainingAmount,
      totalAmount,
    } = req.body;

    console.log("Request body:", req.body);

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const getUTCDateOnly = (date) => {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );
    };

    const formattedCheckInDate = formatDate(checkInDate);
    const formattedCheckOutDate = formatDate(checkOutDate);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // ✅ Step 1: Validate room availability first
    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const dateOnly = getUTCDateOnly(d);
      for (const room of selectedRooms) {
        const roomData = await Room.findOne({ roomType: room.roomType });

        if (!roomData) {
          return res.status(400).json({
            success: false,
            message: `Room type "${room.roomType}" not found.`,
          });
        }

        const roomCount = room.count || 1;

        const existingAvailability = await RoomAvailability.findOne({
          roomType: room.roomType,
          date: dateOnly,
        });

        const availableRooms = existingAvailability
          ? existingAvailability.availableRooms
          : roomData.maxRoomsAvailable;

        if (availableRooms < roomCount) {
          const errorMsg = `❌ Not enough "${
            room.roomType
          }" rooms available on ${formatDate(dateOnly)}.`;
          console.error(errorMsg);
          return res.status(400).json({
            success: false,
            message: errorMsg,
          });
        }
      }
    }

    // ✅ Step 2: Save the booking only after availability check
    // let bookingId;
    // let exists = true;

    // while (exists) {
    //   bookingId = "PLUM" + nanoid(8);
    //   const existingBooking = await Booking.findOne({ bookingId });
    //   if (!existingBooking) exists = false;
    // }

    const bookingId = await generateUniqueBookingId();

    const newBooking = new Booking({
      bookingId,
      customerName: `${guestDetails.firstName} ${guestDetails.lastName}`,
      contactInfo: {
        email: guestDetails.email,
        phone: guestDetails.phone,
      },
      checkInDate: formattedCheckInDate,
      checkOutDate: formattedCheckOutDate,
      totalRooms: selectedRooms.length,
      roomTypes: selectedRooms.map((room) => room.roomType),
      totalGuests: selectedRooms.map((room) => ({
        roomType: room.roomType,
        persons: room.persons,
        adult: room.adults,
        children: room.children,
      })),
      totalCost: totalAmount,
      bookingStatus: "Confirmed",
      payment: {
        method: "Razorpay",
        amountPaid: advancePayment || totalAmount,
        balanceDue: remainingAmount || 0,
      },
      assignedStaff: "",
      specialRequests: guestDetails.specialRequests
        ? [guestDetails.specialRequests]
        : [],
      discount: {
        code: "",
        amount: 0,
      },
    });

    await newBooking.save();
    console.log("Booking saved successfully");

    // ✅ Step 3: Update availability now that booking is confirmed
    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const dateOnly = getUTCDateOnly(d);
      for (const room of selectedRooms) {
        const roomData = await Room.findOne({ roomType: room.roomType });
        const maxRoomsAvailable = roomData.maxRoomsAvailable;
        const roomCount = room.count || 1;

        const existingAvailability = await RoomAvailability.findOne({
          roomType: room.roomType,
          date: dateOnly,
        });

        let updatedAvailability;

        if (existingAvailability) {
          updatedAvailability = Math.max(
            existingAvailability.availableRooms - roomCount,
            0
          );
        } else {
          updatedAvailability = Math.max(maxRoomsAvailable - roomCount, 0);
        }

        await RoomAvailability.findOneAndUpdate(
          { roomType: room.roomType, date: dateOnly },
          { availableRooms: updatedAvailability },
          { upsert: true, new: true }
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Booking successfully created, room availability updated",
      booking: newBooking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

export default { roomDetails, checkRoomsAvailability, createBooking };
