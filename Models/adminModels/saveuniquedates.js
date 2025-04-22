import mongoose from "mongoose";

const storeUniqueCheckInDatesSchema = new mongoose.Schema({
  checkInDate: {
    type: String,
    required: true,
    unique: true,
  },
});

const UniqueCheckInDates = mongoose.model(
  "UniqueCheckInDates",
  storeUniqueCheckInDatesSchema
);
export default UniqueCheckInDates;
