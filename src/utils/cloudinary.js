import { v2 } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process
    .env
    .MY_CLOUD_NAME,
  api_key: process
    .env
    .MY_CLOUD_API_KEY,
  api_secret: process
    .env
    .MY_CLOUD_API_SECRET,
});

const uploadCLoudinary = async (file) => {
  try {
    if (
      !file
    )
      return null;
    const response = await cloudinary.uploader
      .upload(
        file, {
        resource_type: "auto",
      }
      )
      .then(
        (
          response
        ) =>
          console.log(
            response.url
          )
      );
    return response;
  } catch (error) {
      fs.unlinkSync(file)   // delete the locally saved file in out server
      return null;
    
  }
};

