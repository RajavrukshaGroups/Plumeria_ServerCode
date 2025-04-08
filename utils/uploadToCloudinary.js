// src/utils/uploadToCloudinary.js
import cloudinary from "./cloudinary.js";
import fs from "fs";

const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw", // for non-image files like PDFs
      folder: "invoices", // optional Cloudinary folder
    });
    fs.unlinkSync(filePath); // delete local PDF after uploading
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
};

export default uploadToCloudinary;
