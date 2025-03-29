import { DB_NAME } from '../constants.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.Model.js";
import uploadCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import multer from "multer";

// Steps of getting registered user
// 1. Getting user details from frontend
// 2. Validation - not empty
// 3. Check if user already exists
// 4. Checking for image and other media Files
// 5. Upload them to Cloudinary
// 6. Create user object in DB
// 7. Remove password and refresh token field from response
// 8. Check for user creation

const registerUser = asyncHandler(async (req, res) => {
   const { fullName, email, username, password } = req.body;

   

   // Validation - Check for empty fields
   if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, 'One or more fields are empty');
   }

   // Check if user already exists
   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   });
   if (existedUser) {
      throw new ApiError(409, "User with duplicate email or username exists");
   }

   // Validate file uploads
   console.log("Files received: ", req.files);
   const avatarLocalPath = req.files?.avatar?.[0]?.path || null;
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
   }
   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
   }

   // Upload files to Cloudinary
   const avatar = await uploadCloudinary(avatarLocalPath);
   const coverImage = await uploadCloudinary(coverImageLocalPath);

   if (!avatar) {
      throw new ApiError(400, "Failed to upload avatar to Cloudinary");
   }

   // Create user in the database
   const user = await User.create({
      fullName,
      avatar: avatar?.url || "",
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   });

   // Fetch the created user without password and refreshToken fields
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while creating the user");
   }

   return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
   );
});

// Route handler
export default registerUser;
