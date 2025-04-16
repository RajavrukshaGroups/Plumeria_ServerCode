
// const Admin = require('../models/adminModel')
// import Admin from "../../Models/adminModels/adminMode.js";
import RoomModel from "../../Models/adminModels/roomModels.js";
import cloudinary from "../../utils/cloudinary.js";
const Adminlogin =async(req,res)=>{
    try {
        const { email, password } = req.body;
        console.log(req.body, 'Incoming data');
        // Check if admin already exists
        const AdminEmail = await Admin.findOne({ email });
        console.log(AdminEmail, 'Admin already exists');
        if (!AdminEmail) {
            return res.status(400).json({ success: false, message: "Incorrect email ID" });
        }else if(password!==AdminEmail.password){
            return res.status(400).json({ success: false, message: "Incorrect password" });
        }
        console.log('login successful'); 
        
        res.status(200).json({success:true,message:"Login Success"})
        
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


const saveRoomData = async (req, res) => {
  try {
    console.log(req.body.roomData, 'Incoming data');
    const parsedData = JSON.parse(req.body.roomData);
    console.log(parsedData.plans, 'Parse data');

    let imageUrls = [];
    if (req.files?.images) {
      let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: "room-images",
        });
        imageUrls.push(result.secure_url);
      }
    }

    const formatServices = (servicesArray) => ({
      WiFi: servicesArray.includes("WiFi"),
      breakfast: servicesArray.includes("Breakfast"),
      spa: servicesArray.includes("Spa"),
      taxesIncluded: servicesArray.includes("Taxes Included"),
    });

    const formatMenuDetails = (menuString) => {
      if (!menuString || typeof menuString !== "string") {
        return {
          welcomeDrinks: [],
          breakFast: [],
          dinner: [],
          snacks: []
        };
      }

      const items = menuString.split(',').map(item => item.trim());
      return {
        welcomeDrinks: [],    // Can customize if you want to split
        breakFast: items,     // Put all in breakfast for now (or separate logic if needed)
        dinner: [],
        snacks: []
      };
    };

    const formattedPlans = parsedData.plans.map(plan => ({
      name: plan.name,
      price: {
        twoGuests: {
          withGst: plan.price.twoGuests.withGst,
          withoutGst: plan.price.twoGuests.withoutGst
        },
        extraAdult: {
          withGst: plan.price.extraAdult.withGst,
          withoutGst: plan.price.extraAdult.withoutGst
        }
      },
      complimentary: plan.complimentary.map(c => c.trim()).filter(c => c),
      services: formatServices(plan.services),
      menuDetails: plan.menuDetails
    }));

    const roomToSave = {
      roomType: parsedData.roomType,
      maxRoomsAvailable: parsedData.maxRoomsAvailable,
      checkIn: parsedData.checkIn,
      checkOut: parsedData.checkOut,
      images: imageUrls,
      capacity: parsedData.capacity,
      roomInfo: {
        description: parsedData.roomInfo.description,
        bed: parsedData.roomInfo.bed,
        amenities: parsedData.amenities || [],
        terms: parsedData.terms ? parsedData.terms.split(',').map(term => term.trim()) : [],
      },
      plans: formattedPlans,
    };

    const newRoom = new RoomModel(roomToSave);
    const savedRoom = await newRoom.save();

    res.status(201).json({ message: "Room created successfully", room: savedRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// const saveRoomData = async (req, res) => {
//   try {
//     console.log(req.body.roomData, 'Incoming data');
//     const parsedData = JSON.parse(req.body.roomData);
//     console.log(parsedData.plans, 'Parse data');
    
//     let imageUrls = [];
//     if (req.files?.images) {
//       let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

//       for (const image of images) {
//         const result = await cloudinary.uploader.upload(image.tempFilePath, {
//           folder: "room-images",
//         });
//         imageUrls.push(result.secure_url);
//       }
//     }

//     const formatServices = (servicesArray) => ({
//       WiFi: servicesArray.includes("WiFi"),
//       breakfast: servicesArray.includes("Breakfast"),
//       spa: servicesArray.includes("Spa"),
//       taxesIncluded: servicesArray.includes("Taxes Included"),
//     });

//     const formattedPlans = parsedData.plans.map(plan => ({
//       name: plan.name,
//       price: {
//         twoGuests: {
//           withGst: plan.price.twoGuests.withGst,
//           withoutGst: plan.price.twoGuests.withoutGst
//         },
//         extraAdult: {
//           withGst: plan.price.extraAdult.withGst,
//           withoutGst: plan.price.extraAdult.withoutGst
//         }
//       },
//       complimentary: plan.complimentary.map(c => c.trim()),
//       services: formatServices(plan.services),
//       menuDetails: plan.menuDetails || {} // optional if present
//     }));
    
//     const roomToSave = {
//       roomType: parsedData.roomType,
//       maxRoomsAvailable: parsedData.maxRoomsAvailable,
//       checkIn: parsedData.checkIn,
//       checkOut: parsedData.checkOut,
//       images: imageUrls,
//       capacity: parsedData.capacity,
//       roomInfo: {
//         description: parsedData.roomInfo.description,
//         bed: parsedData.roomInfo.bed,
//         amenities: parsedData.amenities || [],
//         terms: parsedData.terms ? parsedData.terms.split(',').map(term => term.trim()) : [],
//       },
//       plans: formattedPlans,
//     };
    
//     const newRoom = new RoomModel(roomToSave);
//     const savedRoom = await newRoom.save();
    
//     res.status(201).json({ message: "Room created successfully", room: savedRoom });
//   } catch (error) {
//     console.error("Error creating room:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


const getRoomsData =async(req,res)=>{
 try {
    const rooms = await RoomModel.find();
    console.log(rooms,'fetched rooms data');
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms", error });
  }
};


const editSaveroom =async (req,res)=>{
  try {
    console.log(req.body.roomData, 'Incoming data');
    const parsedData = JSON.parse(req.body.roomData);
    console.log(parsedData, 'Parse data');
    console.log(parsedData.plans, 'Parse data');

    let imageUrls = [];
    if (req.files?.images) {
      let images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: "room-images",
        });
        imageUrls.push(result.secure_url);
      }
    }

    // const formatServices = (servicesArray) => ({
    //   WiFi: servicesArray.includes("WiFi"),
    //   breakfast: servicesArray.includes("Breakfast"),
    //   spa: servicesArray.includes("Spa"),
    //   taxesIncluded: servicesArray.includes("Taxes Included"),
    // });
    
    const formatServices = (servicesArray) => {
      const list = Array.isArray(servicesArray) ? servicesArray : [];
    
      return {
        WiFi: list.includes("WiFi"),
        breakfast: list.includes("Breakfast"),
        spa: list.includes("Spa"),
        taxesIncluded: list.includes("Taxes Included"),
      };
    };

    const formatMenuDetails = (menuString) => {
      if (!menuString || typeof menuString !== "string") {
        return {
          welcomeDrinks: [],
          breakFast: [],
          dinner: [],
          snacks: []
        };
      }

      const items = menuString.split(',').map(item => item.trim());
      return {
        welcomeDrinks: [],    // Can customize if you want to split
        breakFast: items,     // Put all in breakfast for now (or separate logic if needed)
        dinner: [],
        snacks: []
      };
    };

    const formattedPlans = parsedData.plans.map(plan => ({
      name: plan.name,
      price: {
        twoGuests: {
          withGst: plan.price.twoGuests.withGst,
          withoutGst: plan.price.twoGuests.withoutGst
        },
        extraAdult: {
          withGst: plan.price.extraAdult.withGst,
          withoutGst: plan.price.extraAdult.withoutGst
        }
      },
      complimentary: plan.complimentary.map(c => c.trim()).filter(c => c),
      services: formatServices(plan.services),
      menuDetails: plan.menuDetails
    }));

    const roomToSave = {
      roomType: parsedData.roomType,
      maxRoomsAvailable: parsedData.maxRoomsAvailable,
      checkIn: parsedData.checkIn,
      checkOut: parsedData.checkOut,
      images: imageUrls,
      capacity: parsedData.capacity,
      roomInfo: {
        description: parsedData.roomInfo.description,
        bed: parsedData.roomInfo.bed,
        amenities: parsedData.amenities || [],
        terms: parsedData.terms ? parsedData.terms.split(',').map(term => term.trim()) : [],
      },
      plans: formattedPlans,
    };

    const newRoom = new RoomModel(roomToSave);
    const savedRoom = await newRoom.save();

    res.status(201).json({ message: "Room created successfully", room: savedRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


export default{
  Adminlogin,
  getRoomsData,
  saveRoomData,
  editSaveroom
}
