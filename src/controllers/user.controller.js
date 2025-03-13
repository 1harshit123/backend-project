import { DB_NAME } from '../constants.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.Model.js";
import uploadCLoudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
// Steps of getting register user
// 1. Getting user details from frontend
// 2. Validation - not empty
// 3. Check if user already exists
// 4. Checking for image and other media Files
// 5. Upload them to Cloudinary
// 6. Create user object in DB
// 7. Remove password and refresh token field from response
// 8. Check for user creation

const registerUser = asyncHandler(async (req, res) => {
   const { fullname, email, username, password } = req.body;

   // Method 1: Checking each field individually (Commented out)
   // if(fullname == ""){
   //    throw new ApiError(400, "Fullname is empty")
   // } else if(email == ""){
   //    throw new ApiError(400, "email is empty")
   // } else if(username == ""){
   //    throw new ApiError(400, "username is empty")
   // } else if(password == ""){
   //    throw new ApiError(400, 'password is empty')
   // }

   // Method 2: Using some() to check for empty fields
   if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, 'One or more fields are empty');
   }

   // Additional validation or logic can go here
   console.log({
      "fullname": fullname,
      "email": email
   });
   const existedUser = User.findOne({
      $or: [{username}, {email}]
   })
   if(existedUser){
      throw new ApiError(409, "User with duplicate email or username exist")
   }
   const avatarLocalPath = req.files?.avatar[0]?.path
   const coverImageLocalPath = req.files?.coverImage[0]?.path;
   // Rest of your logic to create a user, upload files, etc.

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadCLoudinary(avatarLocalPath);
   const coverImage = await uploadCLoudinary(coverImageLocalPath);
   if(!avatar){
      throw new ApiError(400, "Avatar file is required")
   }

   const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()

   })
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )
   if(!createdUser){
      throw new ApiError(500, "Something went wrong while creating user")
   }
   return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
   )
});

export default registerUser;
