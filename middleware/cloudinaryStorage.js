// middleware/cloudinaryStorage.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js"; // Make sure to set up your cloudinary config

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "room-images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });
export default upload;
