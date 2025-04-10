import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.MY_CLOUD_NAME,
  api_key: process.env.MY_CLOUD_API_KEY,
  api_secret: process.env.MY_CLOUD_API_SECRET,
});

const uploadCloudinary = async (filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      console.error("File does not exist at path:", filePath);
      return null;
    }

    console.log("Uploading to Cloudinary from path:", filePath);

    const response = await cloudinary.uploader.upload(path.resolve(filePath), {
      resource_type: "image",
    });

    console.log("Upload Success:", response.secure_url);

    // Delete file after upload
    fs.unlinkSync(filePath);

    return response;
  } catch (error) {
    console.error("Cloudinary Upload Failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);

    // Cleanup
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      console.error(" Failed to delete file:", e.message);
    }

    return null;
  }
};

export default uploadCloudinary;
