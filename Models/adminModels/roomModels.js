
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomType: { type: String,},
  maxRoomsAvailable: { type: Number },
  checkIn: { type: String },
  checkOut: { type: String },
  images: [{ type: String }],
  capacity: {
    maxPersons: { type: Number },
    maxAdults: { type: Number },
    maxChildren: { type: Number },
  },
  roomInfo: {
    description: { type: String,  },
    bed: { type: String },
    amenities: [{ type: String }],
    terms: [{ type: String }],
  },
  plans: {
    type: [
      {
        name: { type: String, required: true },
        price: {
          twoGuests: {
            withGst: { type: Number },
            withoutGst: { type: Number }
          },
          extraAdult: {
            withGst: { type: Number },
            withoutGst: { type: Number }
          }
        },
        complimentary: [{ type: String }],
        services: {
          WiFi: { type: Boolean, default: false },
          breakfast: { type: Boolean, default: false },
          spa: { type: Boolean, default: false },
          taxesIncluded: { type: Boolean, default: false }
        },
        // Optional: Add menuDetails if needed for 'plus' and 'max' plans
        menuDetails: {
          welcomeDrinks: [{ type: String }],
          breakFast: [{ type: String }],
          dinner: [{ type: String }],
          snacks: [{ type: String }]
        }
      }
    ]
  }
  
 
}, {
  timestamps: true,
});

const Room = mongoose.model("Roomadmin", roomSchema);
export default Room;
