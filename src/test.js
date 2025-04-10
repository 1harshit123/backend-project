// testUpload.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.MY_CLOUD_NAME,
  api_key: process.env.MY_CLOUD_API_KEY,
  api_secret: process.env.MY_CLOUD_API_SECRET,
});

const filePath = "./public/temp/WhatsApp Image 2025-02-10 at 20.19.22_e9542b09.jpg"; // try uploading a valid image here

const run = async () => {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
    });
    console.log("✅ Manual upload success:", res.secure_url);
  } catch (e) {
    console.error("❌ Manual upload failed:", e.message);
    console.error("Full error:", e);
  }
};

run();
