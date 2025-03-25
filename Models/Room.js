import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
  roomType: String,
  maxRoomsAvailable: Number,
  checkIn: String,
  checkOut: String,
  images: [String],
  capacity: {
    maxPersons: Number,
    maxAdults: Number,
    maxChildren: Number,
  },
  roomInfo: {
    description: String,
    amenities: [String],
    terms: [String],
    bed: String,
  },
  plans: {
    lite: {
      price: {
        twoGuests: { withGst: Number, withoutGst: Number },
        extraAdult: { withGst: Number, withoutGst: Number },
      },
      complimentary: [String],
      services: {
        WiFi: Boolean,
        breakfast: Boolean,
        spa: Boolean,
        taxesIncluded: Boolean,
      },
    },
    plus: {
      price: {
        twoGuests: { withGst: Number, withoutGst: Number },
        extraAdult: { withGst: Number, withoutGst: Number },
      },
      complimentary: [String],
      menuDetails: {
        welcomeDrinks: [String],
        breakFast: [String],
      },
      services: {
        WiFi: Boolean,
        breakfast: Boolean,
        spa: Boolean,
        taxesIncluded: Boolean,
      },
    },
    max: {
      price: {
        twoGuests: { withGst: Number, withoutGst: Number },
        extraAdult: { withGst: Number, withoutGst: Number },
      },
      complimentary: [String],
      menuDetails: {
        welcomeDrinks: [String],
        breakFast: [String],
        dinner: [String],
        snacks: [String],
      },
      services: {
        WiFi: Boolean,
        breakfast: Boolean,
        spa: Boolean,
        taxesIncluded: Boolean,
      },
    },
  },
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
