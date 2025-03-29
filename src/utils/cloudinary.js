import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.MY_CLOUD_NAME,
  api_key: process.env.MY_CLOUD_API_KEY,
  api_secret: process.env.MY_CLOUD_API_SECRET,
});

const uploadCloudinary = async (file) => {
  try {
    if (!file) return null;

    const response = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    fs.unlinkSync(file) // Log the uploaded file URL
    return response;
  } catch (error) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file); // Delete the locally saved file on the server
      }
    } catch (deleteError) {
      console.error("Error deleting file:", deleteError.message);
    }
    console.error("Upload failed:", error.message); // Log the error
    return null;
  }
};

export default uploadCloudinary;
